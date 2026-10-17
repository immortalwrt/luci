'use strict';
'require view';
'require fs';
'require rpc';
'require request';
'require uci';
'require ui';
'require liteportal.common as common';

/*
 * The two asset directories, inside the document root of the main uhttpd. They
 * are the same tree the portal page itself is served from, so nothing has to be
 * copied anywhere for a thumbnail to be fetchable.
 */
const ICON_DIR = '/www/liteportal/icons';
const BG_DIR = '/www/liteportal/bg';

/*
 * The sub-path the portal is served under. The backend writes the same value
 * into every asset URL it hands to the page (URL_BASE in liteportal.uc); this copy
 * exists because the thumbnails on this page are fetched directly rather than
 * through links.json.
 */
const PORTAL_PATH = '/liteportal';

/*
 * Uploads are rejected above this size. It is enforced here so the user gets an
 * immediate answer instead of a slow upload that fails at the far end, and
 * again in the backend so a hand crafted request cannot bypass it.
 */
const MAX_UPLOAD = 2 * 1024 * 1024;

/*
 * Where the browser drops the uploaded bytes. cgi-upload can only write where
 * the ACL says, and the backend moves the file to its final name from there -
 * which is what keeps the destination out of the browser's reach.
 */
const TMP_UPLOAD = '/tmp/liteportal_upload.tmp';

const MIME = {
	png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
	svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon', bmp: 'image/bmp'
};

const NAME_RE = /^[A-Za-z0-9_.-]+$/;

/*
 * `reject: true` matters more here than anywhere else: without it a ubus level
 * rejection arrives as the plain number 2 and the caller below reads that as a
 * success and redraws the list as if the file had landed. See run_rpc().
 *
 * `params` is the array form, which names the arguments positionally: the call
 * sites pass dir_key(dir), name - not a { dir, name } object. An object would
 * be taken as the first argument itself, so the request would carry
 * { dir: { ... } } with no name at all, and ubus would answer with
 * UBUS_STATUS_INVALID_ARGUMENT - the same silent failure in a new disguise.
 */
const callUpload = rpc.declare({
	object: 'luci.liteportal',
	method: 'upload',
	params: [ 'dir', 'name' ],
	reject: true
});

const callRemove = rpc.declare({
	object: 'luci.liteportal',
	method: 'remove',
	params: [ 'dir', 'name' ],
	reject: true
});

const callRename = rpc.declare({
	object: 'luci.liteportal',
	method: 'rename',
	params: [ 'dir', 'name', 'new_name' ],
	reject: true
});

function extension(name) {
	return (name.split('.').pop() || '').toLowerCase();
}

function mime_of(name) {
	return MIME[extension(name)];
}

function human_size(bytes) {
	if (bytes == null)
		return '';

	const units = [ 'B', 'KiB', 'MiB' ];
	let value = bytes, unit = 0;

	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}

	return (unit === 0 ? String(value) : value.toFixed(1)) + ' ' + units[unit];
}

function human_time(seconds) {
	return (seconds != null) ? new Date(seconds * 1000).toLocaleString() : '';
}

/* 'bg' or 'icons' - the short name the backend uses to address a directory. */
function dir_key(dir) {
	return (dir === BG_DIR) ? 'bg' : 'icons';
}

/*
 * A URL the browser can fetch the file from directly.
 *
 * The portal is served by the very same uhttpd that served this LuCI page, under
 * a sub-path of its document root, so the address is built from this page's own
 * origin. The host, port and scheme the admin is browsing in on are already the
 * right ones, and there is no portal port left to look up.
 *
 * Thumbnails used to be inlined as base64 over ubus, which capped them at
 * RPC_FILE_MAX_SIZE (256 KiB) - smaller than a typical background image.
 * Fetching over HTTP has no such ceiling, because the payload never becomes a
 * ubus message. Being same-origin now, it also cannot be refused as mixed
 * content, which is what used to force a plain text link whenever LuCI itself
 * was served over HTTPS.
 *
 * The version appended to the URL is what makes replacing a file actually
 * change it: without it the browser keeps showing the cached copy. Modtime plus
 * size is used for the same reason as on the portal page - the timestamp has
 * one second resolution, so two quick changes could otherwise share a URL.
 *
 * The version suffix is folded into the returned expression rather than
 * appended afterwards: building the string in two steps and reassigning it is
 * exactly what a `const` binding cannot do, and a throw here takes down the
 * whole page (see common.render_safe for why that is expensive).
 */
function portal_url(dir, name, entry) {
	const base = window.location.origin + PORTAL_PATH + '/' +
		dir_key(dir) + '/' + encodeURIComponent(name);

	return (entry != null) ? base + '?v=' + entry.mtime + '-' + entry.size : base;
}

/*
 * The text link a thumbnail degrades to - a file that turned out not to be an
 * image after all, or one that was removed while the page was open.
 */
function fallback_link(dir, entry) {
	return E('a', {
		href: portal_url(dir, entry.name, entry),
		target: '_blank',
		rel: 'noopener'
	}, _('open'));
}

function thumbnail(dir, entry) {
	if (mime_of(entry.name) == null)
		return E('em', {}, _('not an image'));

	const img = E('img', {
		width: 48,
		height: 48,
		style: 'object-fit:contain;border-radius:6px;border:1px solid #8883',
		src: portal_url(dir, entry.name, entry),
		alt: entry.name
	});

	/* A file that is not an image after all, or was removed meanwhile. */
	img.addEventListener('error', function() {
		img.replaceWith(fallback_link(dir, entry));
	});

	return img;
}

/*
 * One unreadable entry must not cost the whole page.
 *
 * The rows are built inside a single .map(), so anything thrown while
 * assembling one cell aborts the rest of the list and the view never paints.
 * Degrading to the same text an unsupported file gets keeps the page usable
 * and leaves the other rows intact.
 */
function safe_thumbnail(dir, entry) {
	try {
		return thumbnail(dir, entry);
	}
	catch (e) {
		return E('em', {}, _('not an image'));
	}
}

/*
 * Rebuild just the two asset lists instead of reloading the page.
 *
 * This used to call window.location.reload() (after a 1.2 s delay): every
 * upload / rename / delete threw the whole page away and rebuilt it, which
 * loses the scroll position and discards staged uci changes the user had not
 * applied yet. Re-reading the two directories and swapping out only the list
 * container keeps the session intact; the notification run_rpc() puts up is
 * the feedback that actually matters.
 *
 * The container is remembered here rather than threaded through asset_section:
 * this module is loaded once per page, and render() reassigns it on every
 * re-render, so a stale reference simply makes the swap a no-op.
 */
let assets_host = null;

function refresh_assets() {
	return Promise.all([
		fs.list(ICON_DIR).catch(function() { return []; }),
		fs.list(BG_DIR).catch(function() { return []; })
	]).then(function(data) {
		const icons = data[0] || [];
		const bgs = data[1] || [];
		const sections = uci.sections('liteportal', 'liteportal');
		const current_bg = sections.length
			? (uci.get('liteportal', sections[0]['.name'], 'background_file') || '')
			: '';

		if (assets_host == null || assets_host.parentNode == null)
			return;

		while (assets_host.firstChild)
			assets_host.removeChild(assets_host.firstChild);

		assets_host.appendChild(asset_section(_('Icons'), ICON_DIR, icons, null));
		assets_host.appendChild(asset_section(_('Backgrounds'), BG_DIR, bgs, current_bg));
	});
}

/*
 * Turn a picked file's name into one the backend accepts.
 *
 * The backend's rule is `^[A-Za-z0-9_.\-]+$` and it does not relax it, which is
 * the point: the name ends up in a device path and the class has to be one no
 * browser or shell can escape a directory with.
 *
 * Replacing every offending character with an underscore - which is what this
 * used to do - satisfies that rule and nothing else. A name like
 * "AI训练背景.jpg" came out as "______AI__-__-__.jpg": six underscores in a row,
 * no way to tell what was uploaded, and two different pictures whose names
 * differ only in the Chinese part collide outright. Sanitising a name the user
 * typed is bad in general, and it is worse when the result is unreadable.
 *
 * So the ASCII is kept and only the rest is dropped: "AI训练背景.jpg" becomes
 * "AI.jpg", which is both valid and recognisable. A name that was all
 * non-ASCII leaves nothing behind, so it gets "image"; the extension always
 * survives, since it is what the MIME table and the server content type key
 * off. The caller resolves collisions by appending a number before the
 * extension.
 */
function safe_name(original) {
	const base = original.replace(/^.*[\\/]/, '');
	const dot = base.lastIndexOf('.');
	const stem = (dot > 0) ? base.slice(0, dot) : base;
	const ext = (dot > 0) ? base.slice(dot) : '';

	/* Collapse the runs of dropped characters into a single separator, so the
	 * remaining words stay apart instead of being glued together. */
	const kept = stem.replace(/[^A-Za-z0-9.-]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^[-.]+|[-.]+$/g, '');

	return (kept || 'image') + ext.replace(/[^A-Za-z0-9.]/g, '');
}

/*
 * Pick a name that is not taken yet. The backend refuses an existing name
 * rather than overwriting it - the file behind it may be a user's background -
 * so the number has to be added here, and the extension kept last for the MIME
 * table. taken() is answered from the list already on screen, which the caller
 * has just rendered, so this does not need a round trip of its own.
 */
function unique_name(name, taken) {
	const has = function(n) {
		return (taken || []).indexOf(n) >= 0;
	};

	if (!has(name))
		return name;

	const dot = name.lastIndexOf('.');
	const stem = (dot > 0) ? name.slice(0, dot) : name;
	const ext = (dot > 0) ? name.slice(dot) : '';

	for (let i = 2; i < 1000; i++) {
		const candidate = stem + '-' + i + ext;

		if (!has(candidate))
			return candidate;
	}

	return stem + '-' + Date.now() + ext;
}

/*
 * Upload through LuCI's own cgi-upload endpoint, the very path its file upload
 * widget uses. Unlike ubus it is not constrained by the message size limit.
 *
 * The file goes to a fixed temporary path rather than to its final name: the
 * backend resolves the destination itself and moves the file there, so the
 * request cannot place a file outside the two asset directories.
 */
function upload(dir, file, taken) {
	if (file.size > MAX_UPLOAD)
		return common.run_rpc(function() {
			throw new Error(_('Image is larger than 2 MiB (%s).').format(human_size(file.size)));
		}, null);

	const name = unique_name(safe_name(file.name), taken);
	const data = new FormData();

	data.append('sessionid', rpc.getSessionID());
	data.append('filename', TMP_UPLOAD);
	data.append('filedata', file);

	/*
	 * No success message: the list below redraws itself from the backend the
	 * moment the upload lands, and the new tile appearing in it is the
	 * confirmation. A toast saying "Uploaded <name>." repeated that, and sat
	 * on top of the very row it reported on - the same reason the scan flow
	 * dropped its "Added N bookmark(s)" notice.
	 */
	return common.run_rpc(function() {
		return request.post(L.env.cgi_base + '/cgi-upload', data, { timeout: 0 })
			.then(function(res) {
				const reply = res.json();

				if (L.isObject(reply) && reply.failure)
					throw new Error(reply.message || reply.failure);

				return callUpload(dir_key(dir), name);
			});
	}, null).then(function(res) {
		if (res != null)
			refresh_assets();
	});
}

function upload_button(dir, taken) {
	const input = E('input', {
		type: 'file',
		accept: 'image/*',
		style: 'display:none',
		change: function(ev) {
			const file = ev.currentTarget.files[0];

			ev.currentTarget.value = '';

			if (file != null)
				upload(dir, file, taken);
		}
	});

	return E('div', {}, [
		input,
		E('button', {
			class: 'btn cbi-button cbi-button-action',
			click: function(ev) {
				ev.preventDefault();
				input.click();
			}
		}, _('Upload')),
		' ',
		E('span', { class: 'cbi-value-description' }, _('Up to 2 MiB per file.'))
	]);
}

/*
 * Renaming goes through the backend rather than a read plus a write, so it
 * works for a file of any size and cannot leave a half written image behind.
 */
function rename_file(dir, entry) {
	const input = E('input', {
		type: 'text',
		value: entry.name,
		style: 'width:100%'
	});

	return ui.showModal(_('Rename'), [
		E('p', {}, _('Choose a new name. Letters, digits, dot, dash and underscore only.')),
		E('div', { class: 'cbi-value' }, input),
		E('div', { class: 'right' }, [
			E('button', {
				class: 'btn',
				click: function() { ui.hideModal(); }
			}, _('Cancel')),
			' ',
			E('button', {
				class: 'btn cbi-button cbi-button-action',
				click: function() {
					const name = input.value.trim();

					if (!NAME_RE.test(name))
						return common.run_rpc(function() {
							throw new Error(_('Invalid file name.'));
						}, null);

					ui.hideModal();

					return common.run_rpc(function() {
						return callRename(dir_key(dir), entry.name, name);
					}, _('Renamed to %s.').format(name)).then(function(res) {
						if (res != null)
							refresh_assets();
					});
				}
			}, _('Rename'))
		])
	]);
}

function remove_file(dir, entry) {
	return ui.showModal(_('Delete'), [
		E('p', {}, _('Delete %s?').format(entry.name)),
		E('p', { class: 'cbi-value-description' },
			_('Bookmarks using this file and the current background will be cleared.')),
		E('div', { class: 'right' }, [
			E('button', {
				class: 'btn',
				click: function() { ui.hideModal(); }
			}, _('Cancel')),
			' ',
			E('button', {
				class: 'btn cbi-button cbi-button-negative',
				click: function() {
					ui.hideModal();

				return common.run_rpc(function() {
					return callRemove(dir_key(dir), entry.name);
				}, null).then(function(res) {
						if (res != null)
							refresh_assets();
					});
				}
			}, _('Delete'))
		])
	]);
}

/*
 * Point the portal at this file.
 *
 * The value is only staged, like every other setting on this page: the footer
 * "Save & Apply" button is what commits it. Applying is also what re-bakes
 * links.json - generate() runs in the rpcd plugin process with its own uci
 * cursor, so it never sees this session's staged changes and would otherwise
 * bake the old value.
 */
function set_background(entry) {
	const sections = uci.sections('liteportal', 'liteportal');

	if (!sections.length)
		return Promise.resolve();

	uci.set('liteportal', sections[0]['.name'], 'background_file', BG_DIR + '/' + entry.name);

	return common.run_rpc(function() {
		return uci.save();
	}, _('Background set to %s. Press "Save & Apply" below to make it take effect.')
		.format(entry.name)).then(function(res) {
		/*
		 * uci.set() already rewrote the in-memory value, so re-rendering here
		 * makes the "(current)" marker move right away - without a page
		 * reload, which is what this used to take.
		 */
		if (res != null)
			return refresh_assets();
	});
}

function asset_section(title, dir, entries, current_bg) {
	const rows = entries
		.filter(function(entry) { return entry.type === 'file'; })
		.sort(function(a, b) { return a.name.localeCompare(b.name); })
		.map(function(entry) {
			const is_current = (dir === BG_DIR) && (current_bg === dir + '/' + entry.name);

			return E('tr', { class: 'tr' }, [
				E('td', { class: 'td', style: 'width:64px' }, safe_thumbnail(dir, entry)),
				E('td', { class: 'td left' }, [
					entry.name,
					is_current ? ' ' : '',
					is_current ? E('span', { class: 'cbi-value-description' }, _('(current)')) : ''
				]),
				E('td', { class: 'td right' }, human_size(entry.size)),
				E('td', { class: 'td right' }, human_time(entry.mtime)),
				E('td', { class: 'td right' }, [
					(dir === BG_DIR) ? E('button', {
						class: 'btn cbi-button',
						click: function() { return set_background(entry); }
					}, _('Set as background')) : '',
					' ',
					E('button', {
						class: 'btn cbi-button',
						click: function() { rename_file(dir, entry); }
					}, _('Rename')),
					' ',
					E('button', {
						class: 'btn cbi-button cbi-button-negative',
						click: function() { remove_file(dir, entry); }
					}, _('Delete'))
				])
			]);
		});

	return E('div', { class: 'cbi-section liteportal-panel' }, [
		E('h3', {}, title),
		E('div', { style: 'margin-bottom:.6em' },
			upload_button(dir, entries.map(function(e) { return e.name; }))),
		rows.length
			? E('table', { class: 'table' }, [
				E('tr', { class: 'tr table-titles' }, [
					E('th', { class: 'th' }, ''),
					E('th', { class: 'th left' }, _('Name')),
					E('th', { class: 'th right' }, _('Size')),
					E('th', { class: 'th right' }, _('Modified')),
					E('th', { class: 'th right' }, _('Actions'))
				])
			].concat(rows))
			: E('p', {}, E('em', {}, _('No files yet.')))
	]);
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('liteportal'),
			fs.list(ICON_DIR).catch(function() { return []; }),
			fs.list(BG_DIR).catch(function() { return []; })
		]).then(function(data) {
			this.icons = data[1] || [];
			this.bgs = data[2] || [];

			const sections = uci.sections('liteportal', 'liteportal');

			this.current_bg = sections.length
				? (uci.get('liteportal', sections[0]['.name'], 'background_file') || '')
				: '';
		}.bind(this));
	},

	render: function() {
		return common.render_safe(function() {
			/*
			 * The cbi-map wrapper is what makes LuCI render the page footer with its
			 * "Save & Apply" button (view.addFooter() looks for one). The staged
			 * background is picked up by uci.save() rather than by a form widget,
			 * so no form.Map is needed - the button commits whatever uci has staged.
			 */
			/*
			 * Both lists live in one container so refresh_assets() can swap out
			 * just their contents. The cbi-map wrapper and the page footer stay
			 * where they are, which is what keeps a local refresh from losing
			 * the scroll position or dropping staged changes.
			 */
			assets_host = E('div', {}, [
				asset_section(_('Icons'), ICON_DIR, this.icons, null),
				asset_section(_('Backgrounds'), BG_DIR, this.bgs, this.current_bg)
			]);

			return E('div', { class: 'cbi-map liteportal-admin' }, [
				/* The style tag travels with the wrapper: this LuCI has
				 * no view-level css() hook. */
				E('style', { type: 'text/css' }, [ common.admin_css() ]),
				E('h2', {}, _('Assets')),
				E('div', { class: 'cbi-map-descr' },
					_('Icons and background images offered to the portal. Files are served ' +
					  'from the portal page directory by the main web server, picked for a ' +
					  'bookmark on the Bookmarks page, or set as the page background here.')),
				assets_host
			]);
		}.bind(this));
	}
});
