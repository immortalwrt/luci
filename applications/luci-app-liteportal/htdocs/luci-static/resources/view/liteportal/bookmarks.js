'use strict';
'require view';
'require form';
'require fs';
'require request';
'require uci';
'require ui';
'require liteportal.common as common';

const ICON_DIR = '/www/liteportal/icons';

/*
 * The portal's own tree inside the main document root. Kept separate from
 * ICON_DIR (which points one level deeper) because icon_url_of() has to slice
 * against this one: the URL keeps the "icons/" segment, so trimming at
 * ICON_DIR would drop it and 404 - exactly what the first release of the
 * row thumbnail did. Same constant the rpcd plugin slices against (WWW).
 */
const WWW = '/www/liteportal';

const MIME = {
	png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
	svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon', bmp: 'image/bmp'
};

function extension(name) {
	return (name.split('.').pop() || '').toLowerCase();
}

function basename(path) {
	return (path || '').split('/').pop() || '';
}

/*
 * The URL a stored icon option can be fetched from, for the row thumbnail.
 *
 * Mirrors asset_path() in the rpcd plugin (liteportal.uc), which is what the
 * portal page itself goes through - a thumbnail that resolved differently
 * from the tile would show a picture the portal does not show. The three
 * shapes a stored value can take: an absolute path under /www/liteportal (what
 * the Assets page writes), a bare file name (hand edited config, resolved
 * against the icons directory), any other absolute path.
 */
function icon_url_of(value) {
	if (value == null || value === '')
		return '';

	if (value.indexOf(WWW + '/') === 0)
		return '/liteportal/' + value.slice(WWW.length + 1);

	if (value.indexOf('/') !== 0)
		return '/liteportal/icons/' + value;

	return '/liteportal' + value;
}

/*
 * A thumbnail of the row's asset image, for the left of the Save button.
 *
 * Only the icon file option drives it: an emoji or a remote URL in the
 * "Icon" column is not an asset on this router, and pulling a third-party
 * image into the settings page to decorate a row is not a trade worth
 * making. Rows without an asset simply get no thumbnail.
 */
function make_thumb(url, name) {
	return E('img', {
		class: 'liteportal-bm-thumb',
		src: url,
		alt: '',
		title: name,
		style: 'height:1.7em;width:auto;max-width:3em;vertical-align:middle;' +
			'margin:0 .5em 0 0;border-radius:2px;object-fit:contain;' +
			'background:rgba(127,127,127,.15)'
	});
}

/*
 * Redraw the thumbnail after the icon dropdown changed, so the row reflects
 * the new pick without waiting for a save or a reload.
 */
function update_thumb(map, sid, value) {
	const tr = map.findElement('data-sid', sid);

	if (tr == null)
		return;

	const old = tr.querySelector('img.liteportal-bm-thumb');
	const url = icon_url_of(value);

	if (url === '') {
		if (old != null)
			old.remove();

		return;
	}

	if (old != null) {
		old.src = url;
		old.title = basename(value);
		return;
	}

	const save = tr.querySelector('button.cbi-button-save');

	if (save != null)
		save.parentNode.insertBefore(make_thumb(url, basename(value)), save);
}

/*
 * Write the staged values into /etc/config and commit them.
 *
 * uci.save() alone is not enough. It writes the configuration file, but only the
 * commit fires the procd reload trigger registered for the portal configuration,
 * and that reload is what runs generate(). generate() runs in the rpcd plugin
 * process with its own uci cursor, so it never sees this session's staged
 * changes - without a commit it would re-bake the previous values and the portal
 * page would keep showing them.
 *
 * The commit goes through the HTTP endpoint the footer's "Save & Apply" uses,
 * not through ubus `uci apply`: that method is checked against an ACL that is not
 * scoped to a single configuration, so a session holding write access to just
 * `portal` cannot call it and gets ubus code 6, permission denied. The endpoint
 * commits every pending configuration one by one with the caller's session,
 * which is exactly the permission this page does have - and it is the path the
 * LuCI UI itself takes, so this cannot diverge from "Save & Apply" behaviour.
 */
function commit() {
	return uci.save().then(function() {
		return request.request(L.url('admin/uci', 'apply_unchecked'), {
			method: 'post',
			query: { sid: L.env.sessionid, token: L.env.token }
		});
	}).then(function(res) {
		/*
		 * 204 is the controller's success status; anything else is mapped from the
		 * underlying ubus status (403 permission denied, 400 invalid argument...),
		 * which says far more than a generic failure would.
		 */
		if (res == null || res.status !== 204)
			throw new Error('apply_unchecked failed: HTTP ' + (res ? res.status : '?'));

		return res;
	});
}

/*
 * Save a single row.
 *
 * The same walk as form.TableSection#parse() - including the per-option
 * validation, so that an empty name or URL is reported instead of written - but
 * limited to one section id. That is the whole point of the button: the footer
 * "Save & Apply" parses every row, so one unfinished row anywhere in the table
 * would block the save of an unrelated one, and it re-renders the page as well.
 */
function save_row(section, section_id) {
	const tasks = (section.children || []).filter(function(opt) {
		return opt.editable && !opt.modalonly;
	}).map(function(opt) {
		return opt.parse(section_id);
	});

	return Promise.all(tasks).then(commit);
}

/*
 * Drop the given sections and commit. Both bulk deletions use this, after asking
 * for confirmation.
 */
function drop_sections(sids) {
	sids.forEach(function(sid) {
		uci.remove('liteportal', sid);
	});

	return commit();
}

function reload_soon() {
	/* The notifications are added to the page itself, so let them be read. */
	window.setTimeout(function() { window.location.reload(); }, 1500);
}

/*
 * Second confirmation for a destructive action.
 *
 * Both bulk deletions rewrite the whole table, so a misclick is expensive. The
 * message spells out how many rows are about to be lost, and the count comes from
 * the widgets rather than from uci: a row that is unticked but not saved yet is
 * still one the user sees as disabled, and the dialog must not promise less than
 * the action does.
 */
function confirm_removal(title, message, on_confirm) {
	ui.showModal(title, [
		E('p', {}, message),
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
					return on_confirm();
				}
			}, _('Delete'))
		])
	]);
}

/* ---------------------------------------------------------------- the table -- */

const BookmarkTable = form.TableSection.extend({
	/*
	 * The "Enabled" column header is where the select-all box belongs: it sits
	 * directly above the flags it drives, instead of floating above the table
	 * (form.Button inside a TableSection would occupy a column of every row).
	 *
	 * The flags are driven through their own widget instances rather than by
	 * poking at the DOM. Map.parse() reads the value back with
	 * CBIFlagValue.formvalue(), which asks the ui.Checkbox whether it is checked,
	 * so setting it here is exactly what a user click does - and no synthetic
	 * change event is needed for the value to be picked up.
	 *
	 * Ticking the box only stages the change, like every other input on the page:
	 * it is the footer "Save & Apply" (or the per-row Save) that commits it.
	 */
	renderHeaderRows(has_action) {
		const node = this.super('renderHeaderRows', [ has_action ]);
		const flag = this.flag;

		if (flag == null)
			return node;

		const row = node.querySelector('tr.cbi-section-table-titles:not(.cbi-section-table-filter)');
		const th = (row != null) ? row.children[this.children.indexOf(flag)] : null;

		if (th == null)
			return node;

		/*
		 * The column name moves down to the description row, where the other
		 * column hints live - the tick box in the titles row speaks for itself.
		 * That row exists because the Icon column carries a hint, and it holds
		 * one cell per column, so the flag's cell sits at the same index the
		 * titles row uses. Clearing the title text first also leaves the box as
		 * the only child of its cell.
		 */
		th.textContent = '';

		const descr = node.querySelector('tr.cbi-section-table-descr');
		const hint = (descr != null) ? descr.children[this.children.indexOf(flag)] : null;

		if (hint != null)
			hint.textContent = _('Enabled');

		this.select_all = E('input', {
			type: 'checkbox',
			title: _('Select all'),
			style: 'margin:0 0 0 .4em;vertical-align:middle',
			change: function(ev) { this.toggle_all(ev.target.checked); }.bind(this)
		});

		th.appendChild(this.select_all);

		return node;
	},

	toggle_all(on) {
		const flag = this.flag;
		let count = 0;

		this.cfgsections().forEach(function(sid) {
			const elem = flag.getUIElement(sid);

			if (elem == null)
				return;

			elem.setValue(on ? flag.enabled : flag.disabled);
			count++;
		});

		this.sync_select_all();

		if (count > 0)
			common.notify(null, E('p', {}, on
				? _('Enabled %d bookmark(s). Press "Save & Apply" to keep the change.').format(count)
				: _('Disabled %d bookmark(s). Press "Save & Apply" to keep the change.').format(count)), 'info');
	},

	/*
	 * Keep the header box honest: a "select all" that stays ticked while a single
	 * row is unticked is a lie. The state is recomputed from the rendered
	 * checkboxes, and shown as an indeterminate box while only some rows are on.
	 */
	sync_select_all() {
		const box = this.select_all;

		if (box == null || this.section_node == null)
			return;

		const boxes = this.section_node.querySelectorAll('tbody input[type="checkbox"]');
		let on = 0;

		boxes.forEach(function(elem) { if (elem.checked) on++; });

		box.checked = (boxes.length > 0 && on === boxes.length);
		box.indeterminate = (on > 0 && on < boxes.length);
	},

	render() {
		const self = this;

		/*
		 * The empty array is not decoration: LuCI's super(key) with a single
		 * argument returns the parent method itself, it only calls it when
		 * arguments are supplied (super('key', args)). Omitting it hands the
		 * function to the promise chain instead of the rendered node.
		 */
		return Promise.resolve(this.super('render', [])).then(function(node) {
			self.section_node = node;

			/*
			 * One delegated listener instead of one per row: rows are added and
			 * removed at runtime (Add, per-row Delete), so per-row listeners would
			 * have to be re-attached over and over. Change events bubble, and the
			 * header box fires its own change event, which is filtered out here.
			 */
			node.addEventListener('change', function(ev) {
				if (ev.target !== self.select_all)
					self.sync_select_all();
			});

			self.sync_select_all();

			return node;
		});
	},

	/*
	 * Draw extra rows at the end of the table for sections that were staged
	 * after the page was rendered.
	 *
	 * The scan needed this: it used to end in window.location.reload(), which
	 * threw away the notification, any half-finished row the user was editing
	 * and the scroll position, all to make three new lines appear. Re-rendering
	 * only the rows is the difference between "the list grew" and "the page
	 * restarted".
	 *
	 * form.TableSection keeps its row building private - renderContents() is the
	 * only place a <tr> is made, and it is called once, for the sections that
	 * existed at render time. So the few lines of it that matter are repeated
	 * here: ask the section for the cells of one sid, wrap them in a <tr>, hand
	 * it the same attributes the real rows carry (the per-row Save button looks
	 * up the row by data-sid to decide whether it has been saved yet, and the
	 * responsive theme reads data-title), and append.
	 *
	 * The cells come from the very same option widgets as the initial render, so
	 * a row drawn here parses and saves exactly like one drawn at load time: the
	 * footer "Save & Apply" walks the widgets, not the DOM.
	 */
	append_sections(sids) {
		const self = this;

		/*
		 * max_cols is not set on this section, so has_more is false and there is
		 * never a "More…" button. Both are read from the section rather than
		 * assumed, so a future max_cols here cannot silently produce rows with a
		 * different shape than the ones the table was built with.
		 */
		const max_cols = this.max_cols ?? this.children.length;
		const has_more = max_cols < this.children.length;

		return Promise.all(sids.map(function(sid) {
			/*
			 * An option widget renders from its own cache of the config
			 * value, filled once when the page loaded the sections that
			 * existed at that time. A section created after that - what
			 * the scan's uci.add() produces - is in no cache: cfgvalue()
			 * reads nothing else, so renderUCISection() would draw empty
			 * inputs for exactly the rows just staged.
			 *
			 * Loading each option for this sid first, and writing the
			 * value back through the same two-argument cfgvalue() form
			 * that CBIAbstractSection.load() uses, puts the new row on
			 * the same footing as the ones drawn at page load. The read
			 * reaches the section because uci.get() consults the pending
			 * creates before the loaded values - the section is not in
			 * the configuration yet, it is in the transaction.
			 */
			return Promise.all(self.children.map(function(opt) {
				return Promise.resolve(opt.load(sid)).then(function(value) {
					opt.cfgvalue(sid, value);
				});
			})).then(function() {
				return Promise.resolve(self.renderUCISection(sid));
			}).then(function(nodes) {
				const trEl = E('tr', {
					id: 'cbi-%s-%s'.format(self.map.config, sid),
					class: 'tr cbi-section-table-row',
					'data-sid': sid,
					'data-section-id': sid
				});

				/*
				 * renderOptions() hands back one container holding the cells, and
				 * the initial render drains it the same way - appendChild moves a
				 * node out of its parent, so this loop walks the cells out one by
				 * one.
				 */
				for (let i = 0; i < max_cols && nodes.firstChild; i++)
					trEl.appendChild(nodes.firstChild);

				trEl.appendChild(self.renderRowActions(sid, has_more ? _('More…') : null, trEl));

				return trEl;
			});
		})).then(function(rows) {
			const tbody = self.section_node.querySelector('tbody');

			/*
			 * An empty table carries a placeholder row saying so. Leaving it in
			 * place under real rows is how a table ends up claiming to be empty
			 * while showing bookmarks.
			 */
			const placeholder = tbody.querySelector('tr.placeholder');

			if (placeholder != null)
				placeholder.remove();

			rows.forEach(function(row) { tbody.appendChild(row); });

			self.sync_select_all();
		});
	},

	/*
	 * The per-row "Save" button, placed left of LuCI's "Delete". It commits this
	 * row only - the other rows, including a half filled one that has not been
	 * saved yet, are left alone.
	 */
	renderRowActions(section_id, more_label, trEl) {
		const node = this.super('renderRowActions', [ section_id, more_label, trEl ]);
		const remove = node.querySelector('button.cbi-button-remove');

		if (remove == null || this.map.readonly)
			return node;

		const section = this;

		const save = E('button', {
			title: _('Save this bookmark'),
			class: 'btn cbi-button cbi-button-save',
			click: function(ev) {
				ev.preventDefault();

			return common.run_rpc(function() {
				return save_row(section, section_id);
			}, null).then(function(res) {
					/*
					 * run_rpc() resolves to null when the call failed, so the label
					 * only switches on a real save; a rejected one keeps saying
					 * "Save", with the error banner explaining why.
					 */
					if (res != null)
						save.textContent = _('Saved');
				});
			}
		}, [ _('Save') ]);

		remove.parentNode.insertBefore(save, remove);

		/*
		 * The asset thumbnail goes left of the Save button, inside the same
		 * cell: the row already carries the icon option's value in a
		 * dropdown, and a picture of what was picked answers "which image
		 * is this row using" faster than any control on the page. Placed
		 * here rather than in the Icon column so the two read together -
		 * the dropdown is where the choice is made, the thumbnail sits
		 * next to the button that commits it.
		 */
		const icon = uci.get('liteportal', section_id, 'icon');
		const icon_url = icon_url_of(icon);

		if (icon_url !== '')
			remove.parentNode.insertBefore(make_thumb(icon_url, basename(icon)), save);

		return node;
	},

	/*
	 * The two bulk deletions, to the right of "Add". Both are irreversible, so
	 * both are painted as negative buttons and both ask for confirmation first.
	 * `only_disabled` selects the target set: the rows whose "Enabled" box is
	 * currently unticked, or every row.
	 */
	bulk_delete(label, only_disabled) {
		const self = this;

		return E('button', {
			class: 'btn cbi-button cbi-button-negative',
			disabled: this.map.readonly || null,
			/* Themes disagree on whether buttons carry their own margin;
			 * Argon keeps it at zero, which glues these two to the "Add"
			 * button left of them. */
			style: 'margin-left:.5em',
			click: function(ev) {
				ev.preventDefault();

				const flag = self.flag;

				const sids = self.cfgsections().filter(function(sid) {
					return !only_disabled || (flag.formvalue(sid) !== flag.enabled);
				});

				if (!sids.length) {
					common.notify(null, E('p', {}, only_disabled
						? _('There is no disabled bookmark to delete.')
						: _('There is no bookmark to delete.')), 'info');

					return;
				}

				confirm_removal(label, only_disabled
					? _('This removes %d disabled bookmark(s) from the configuration. It cannot be undone.').format(sids.length)
					: _('This removes all %d bookmark(s) from the configuration. It cannot be undone.').format(sids.length),
					function() {
					return common.run_rpc(function() {
						/*
						 * The removed count is no longer shown - the rows
						 * are gone from the table the moment this resolves,
						 * which is the feedback. It is still returned so
						 * that run_rpc() resolves non-null, which is what
						 * the reload below keys on.
						 */
						return drop_sections(sids).then(function() { return { removed: sids.length }; });
					}, null).then(function(res) {
							if (res != null)
								reload_soon();
						});
					});
			}
		}, [ label ]);
	},

	renderSectionAdd(extra_class) {
		const node = this.super('renderSectionAdd', [ extra_class ]);

		if (!this.addremove || this.flag == null)
			return node;

		node.appendChild(this.bulk_delete(_('Delete disabled bookmarks'), true));
		node.appendChild(this.bulk_delete(_('Clear all bookmarks'), false));

		return node;
	}
});

return view.extend({
	/*
	 * The icon library has to be known before render(): ListValue candidates
	 * must be registered before the widget is built. A failure to list the
	 * directory (empty, or denied) just yields an empty picker.
	 */
	load: function() {
		return Promise.all([
			uci.load('liteportal'),
			fs.list(ICON_DIR).catch(function() { return []; })
		]).then(function(data) {
			this.icons = (data[1] || []).filter(function(entry) {
				return entry.type === 'file' && MIME[extension(entry.name)];
			}).map(function(entry) {
				return entry.name;
			});
		}.bind(this));
	},

	render: function() {
		return common.render_safe(function() {
			let m, s, o;

			m = new form.Map('liteportal', _('Bookmarks'),
				_('The tiles shown on the portal page. Only enabled bookmarks are baked ' +
				  'into links.json.'));

			/*
			 * Maintenance sits above the list because its scan writes this list:
			 * having it below meant scrolling past everything to find a control
			 * whose result appears above where you clicked.
			 *
			 * The section is built in common.js - the Bookmarks page is the
			 * only one that uses it now, but the scan rules it carries are not
			 * something to keep per-page.
			 *
			 * The callback is written against `table`, which is only assigned
			 * further down: the scan button can be pressed long after render()
			 * has returned, by which time the assignment has happened. Declaring
			 * it first is what lets the maintenance section stay above the list
			 * without being built after it.
			 */
			let table = null;

			common.maintenance_section(m, null, function(sids) {
				return table.append_sections(sids);
			});

			s = m.section(BookmarkTable, 'link', _('Bookmarks'));
			s.anonymous = true;
			s.addremove = true;

			o = s.option(form.Flag, 'enabled', _('Enabled'));
			o.default = '1';
			o.rmempty = false;

			/*
			 * The select-all box in the header and the bulk deletions need the
			 * flag option to read and drive the per-row checkboxes; the section is
			 * not rendered yet, so handing it over here is enough.
			 */
			s.flag = o;

			/*
			 * Read back by the scan callback above, which is why it is assigned
			 * after it: `m.section()` returns the section object immediately, and
			 * the scan button cannot be pressed before render() has finished
			 * wiring this up.
			 */
			table = s;

			o = s.option(form.Value, 'name', _('Name'));
			o.rmempty = false;

			o = s.option(form.Value, 'url', _('URL'));
			o.rmempty = false;
			o.placeholder = 'http://192.168.1.1:3000';

			o = s.option(form.Value, 'icon_url', _('Icon'),
				_('An emoji or an absolute image URL.'));
			o.placeholder = '💡';

			/*
			 * A file from the Assets page. The value is stored as an absolute
			 * path, which the backend strips down to something the portal page
			 * can request. It wins over `icon_url` when both are set.
			 */
			o = s.option(form.ListValue, 'icon', _('Icon file'),
				_('An image from the Assets page. Takes precedence over the icon above.'));
			o.rmempty = true;
			o.optional = true;

			(this.icons || []).forEach(function(name) {
				o.value(ICON_DIR + '/' + name, name);
			});

			/*
			 * The thumbnail follows the dropdown without waiting for a
			 * save: picking an image and seeing it appear next to the
			 * Save button is how the user knows the pick took, since the
			 * value itself is a path in a select box.
			 */
			o.onchange = function(ev, section_id, value) {
				update_thumb(this.map, section_id, value);
			};

			/* Wrapped so the shared stylesheet (common.admin_css()) has
			 * its .liteportal-admin scope, and so the page gets the same
			 * bottom padding across themes. The style tag travels with
			 * the wrapper: this LuCI has no view-level css() hook. */
			return m.render().then(function(mapNode) {
				return E('div', { class: 'liteportal-admin' }, [
					E('style', { type: 'text/css' }, [ common.admin_css() ]),
					mapNode
				]);
			});
		}.bind(this));
	}
});
