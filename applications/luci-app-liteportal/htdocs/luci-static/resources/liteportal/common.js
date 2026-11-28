'use strict';
'require rpc';
'require ui';
'require uci';
'require form';
'require baseclass';

/*
 * Shared helpers for the portal views. Loaded as
 *
 *     'require liteportal.common as common';
 *
 * The `as common` part only picks the variable name - the module system derives
 * it from the last path segment otherwise.
 *
 * This module MUST return a class, not a plain object. LuCI's require() wraps
 * the factory output in a class check (`Class.isSubclass()`) and then does
 * `new` on it, so returning an object literal fails with
 *
 *     TypeError: "liteportal.common" factory yields invalid constructor
 *
 * The rpc handles stay at the top level on purpose: they are created once when
 * the file is evaluated, and the methods below close over them. Putting them
 * into the extend object would rebuild them on every instantiation.
 */

/*
 * `reject: true` is not optional here: it is what turns a rejected ubus call
 * into a rejected promise instead of a result of 2. See run_rpc() below.
 */
const callStatus = rpc.declare({
	object: 'luci.liteportal',
	method: 'status',
	reject: true
});

const callScan = rpc.declare({
	object: 'luci.liteportal',
	method: 'scan',
	params: [ 'ports' ],
	reject: true
});

/*
 * What a failed render() leaves on the page instead of throwing.
 *
 * The stack goes in a <pre> rather than into a notification: LuCI's own error
 * path shows a modal that the SPA router then tears down with the aborted
 * stage, so a message delivered that way is gone before it can be read.
 */
function render_error_block(err) {
	return E('div', { class: 'alert-message error' }, [
		E('p', {}, _('Error')),
		E('pre', { style: 'white-space:pre-wrap' }, String((err && err.message) || err))
	]);
}

/*
 * Ask the backend what is listening, and reduce that to the services that are
 * actually addable: a browser can open what a port offers as HTTP, and a port
 * that already has a bookmark is not news. Nothing is written here - this is
 * the read-only half of the scan, so the user gets to see the list before the
 * configuration changes.
 *
 * The backend sorts the ports into three buckets rather than guessing:
 * services a browser cannot open (ssh, dns, a VPN) are dropped, known web
 * services are offered, and everything else is offered unclassified. A port
 * number carries no protocol information - 7890 may be a proxy or an arbitrary
 * TCP service, 1053 is mDNS - so anything else would be a coin flip, and a
 * wrong bookmark is worse than an extra click.
 *
 * The 'unknown' bucket is returned rather than hidden so the caller can put
 * those ports in front of the user unchecked: dropping them silently would
 * lose a service run on an unusual port, and adding them automatically would
 * put ssh and mDNS on the page.
 */
function scan_candidates() {
	return callScan().then(function(result) {
		const host = (result && result.lan_ip) || window.location.hostname;
		const seen = new Set(uci.sections('liteportal', 'link').map(function(sid) {
			return uci.get('liteportal', sid, 'url');
		}));

		return ((result && result.ports) || []).filter(function(entry) {
			if (entry.web !== true && entry.web !== 'unknown')
				return false;

			return !seen.has('http://' + host + ':' + entry.port);
		}).map(function(entry) {
			return {
				port: entry.port,
				svc: entry.svc,
				web: entry.web,
				url: 'http://' + host + ':' + entry.port
			};
		});
	});
}

/*
 * Stage the chosen services as disabled bookmarks.
 *
 * Deliberately no uci.save(): the rows are appended to the table right after,
 * and every other input on this page works the same way - it is the footer
 * "Save & Apply" that commits. Saving here would leave the configuration
 * holding bookmarks that the page has not shown the user yet, and the next
 * Save & Apply would then mix two sources of changes.
 *
 * `enabled` is staged as '0' for the same reason the old flow set it: a
 * service the user has not looked at yet does not belong on the portal page.
 *
 * Returns the new section ids, in the order they were added, so the caller can
 * append exactly these rows.
 */
function stage_bookmarks(entries) {
	return entries.map(function(entry) {
		const sid = uci.add('liteportal', 'link');

		uci.set('liteportal', sid, 'name', entry.svc || _('Service %d').format(entry.port));
		uci.set('liteportal', sid, 'url', entry.url);
		uci.set('liteportal', sid, 'icon_url', '🔌');
		uci.set('liteportal', sid, 'enabled', '0');

		return sid;
	});
}

/*
 * Present the scan result as a checklist and add what the user ticks.
 *
 * The confirmation is a list rather than a yes/no because "add all" is not a
 * decision anybody can make without seeing the list - which is why the old
 * flow, that added every recognised service the moment the button was
 * pressed, could not be kept. Recognised services are ticked by default and
 * unclassified ports are not, so the common case stays one click and the
 * doubtful ones stay the user's call.
 *
 * `self` is the common instance: run_rpc() and notify() are prototype methods,
 * so this module-level function cannot reach them on its own.
 *
 * `on_add(sids)` runs after the sections are staged. The Bookmarks page uses
 * it to append the new rows in place, and that is the whole confirmation:
 * the rows appearing at the end of the table say everything a toast would,
 * and a toast would sit on top of the very rows it reports on. An earlier
 * revision announced "Added N bookmark(s)…" here and it was removed for
 * exactly that reason.
 */
function confirm_scan(self, candidates, on_add) {
	const boxes = [];

	const rows = candidates.map(function(entry, idx) {
		const box = E('input', {
			type: 'checkbox',
			checked: (entry.web === true) ? true : null,
			style: 'margin:0 .6em 0 0;vertical-align:middle'
		});

		boxes.push({ entry: entry, box: box });

		return E('div', { style: 'display:flex;align-items:center;margin:.2em 0' }, [
			box,
			E('span', { style: 'min-width:12em' }, entry.svc || _('Service %d').format(entry.port)),
			E('code', { style: 'opacity:.75' }, entry.url),
			(entry.web === 'unknown') ? E('em', { style: 'margin-left:.8em' },
				_('port not classified - a port number does not say which protocol is spoken on it')) : ''
		]);
	});

	ui.showModal(_('Local services found'), [
		E('p', {}, _('These local services are not bookmarked yet. The ones you tick are added as ' +
			'disabled bookmarks, so nothing appears on the portal page until you enable them and ' +
			'press "Save & Apply".')),
		E('div', {}, rows),
		E('div', { class: 'right' }, [
			E('button', {
				class: 'btn',
				click: function() { ui.hideModal(); }
			}, _('Cancel')),
			' ',
			E('button', {
				class: 'btn cbi-button cbi-button-action',
				click: function() {
					const chosen = boxes.filter(function(item) {
						return item.box.checked;
					}).map(function(item) {
						return item.entry;
					});

					ui.hideModal();

					if (!chosen.length) {
						self.notify(null, E('p', {}, _('Nothing was added.')), 'info');
						return;
					}

				const sids = stage_bookmarks(chosen);

				return Promise.resolve(typeof(on_add) === 'function'
					? on_add(sids)
					: null);
				}
			}, _('Add selected'))
		])
	]);
}

return baseclass.extend(/** @lends LuCI.liteportal.common.prototype */ {

	/*
	 * Show a notification, replacing the previous one this app put up.
	 *
	 * ui.addNotification() inserts a fresh banner at the top of #maincontent and
	 * never takes an old one down, so repeated clicks on Save or "Select all"
	 * stack the banners up and the page grows taller with every click. Holding
	 * on to the node the previous call returned and removing it first leaves at
	 * most one banner on screen, which is what makes the message readable
	 * instead of a wall of identical lines.
	 */
	notify(title, children, type) {
		if (this._notification != null && this._notification.parentNode != null)
			this._notification.parentNode.removeChild(this._notification);

		this._notification = ui.addNotification(title, children, type);

		return this._notification;
	},

	/*
	 * Run an action that talks to the backend, with visible feedback either way.
	 *
	 * LuCI does not do this for us: ui.createHandlerFn() wraps a button handler in
	 * Promise.resolve(...).finally(...) and never attaches a .catch(), so a rejected
	 * promise ends up in the console while the user sees nothing at all. Every
	 * button that calls the backend goes through here, so a failure always surfaces
	 * as a notification instead of a click that appears to do nothing.
	 *
	 * okMsg is a string, or a function(result) returning one; it is skipped when the
	 * action resolves to null.
	 *
	 * Failures arrive in two shapes and both have to be caught here:
	 *
	 *  - an ubus level error (unknown method, missing ACL entry, an argument the
	 *    method policy does not allow) never reaches the action at all. LuCI
	 *    resolves the numeric status as the call result unless the rpc.declare()
	 *    for that method sets `reject: true`, so every declaration in this app
	 *    carries it - without it a failed call is indistinguishable from success;
	 *  - an application level failure (a name that is already taken, a directory
	 *    that cannot be written) resolves normally with { ok: false, error: ... },
	 *    which is rethrown just below.
	 */
	run_rpc(action, okMsg) {
		return Promise.resolve()
			.then(action)
			.then((res) => {
				/*
				 * The backend reports failure by resolving with { ok: false, error:
				 * ... } instead of rejecting, so a bare null check would read it as
				 * success. Rethrow it so the catch below reports the error instead
				 * of a bogus success notification.
				 */
				if (res != null && res.ok === false)
					throw new Error(res.error);

				if (okMsg != null && res != null)
					this.notify(null, E('p', {},
						(typeof(okMsg) === 'function') ? okMsg(res) : okMsg), 'info');

				return res;
			})
			.catch((err) => {
				/* 'error' is defined by both the bootstrap and the argon themes. */
				this.notify(_('Error'),
					E('p', {}, _('Operation failed: %s').format((err && err.message) || err)),
					'error');

				return null;
			});
	},

	/*
	 * Run a view's render() body so that a failure ends the page instead of the
	 * session.
	 *
	 * Why this is needed: LuCI's View.__init__ is
	 *   .then(load).then(render).then(paint).catch(LuCI.prototype.error)
	 * and error() re-throws after showing its notification. Under
	 * luci-theme-footstrap's SPA router that is expensive, because it
	 * serializes navigations (`const previous = _inflight`): a view that never
	 * paints keeps every later click queued until the 15000 ms
	 * RENDER_TIMEOUT expires, and history.pushState has already moved the
	 * address bar by then - so the URL and the page disagree. Catching here
	 * returns a real DOM node, the view paints, the queue drains immediately
	 * and the next click navigates at once.
	 *
	 * The asynchronous half is not optional: general.js returns a promise
	 * (form.Map#render), so a plain try/catch would let a rejection escape
	 * through exactly the path this is meant to close.
	 *
	 * `context` is the view instance - render() runs with `this` bound to it,
	 * and the body still needs that.
	 */
	render_safe(fn, context) {
		let res;

		try {
			res = fn.call(context);
		}
		catch (err) {
			return render_error_block(err);
		}

		return Promise.resolve(res).catch(render_error_block);
	},

	badge(text, ok) {
		return E('span', {
			style: 'display:inline-block;padding:1px 8px;border-radius:9px;color:#fff;' +
				'font-size:90%;white-space:nowrap;background:' + (ok ? '#2e7d32' : '#c62828')
		}, text);
	},

	/*
	 * A neutral badge for states that are neither good nor bad. A portal the user
	 * deliberately switched off is not a failure, so it must not be painted red.
	 */
	muted_badge(text) {
		return E('span', {
			style: 'display:inline-block;padding:1px 8px;border-radius:9px;color:#fff;' +
				'font-size:90%;white-space:nowrap;background:#607d8b'
		}, text);
	},

	status_row(label, value) {
		return E('tr', { class: 'tr' }, [
			E('td', { class: 'td left', style: 'width:32%' }, label),
			E('td', { class: 'td left' }, value)
		]);
	},

	/*
	 * Why the portal cannot be reached, in the words of whatever is actually
	 * wrong.
	 *
	 * The page is served by the main uhttpd, so "the portal is down" is never a
	 * single fact: either the files are not in place, or the server that should
	 * hand them out is not listening. Those have two different fixes, which is
	 * exactly why the backend reports them separately instead of folding them
	 * into one boolean.
	 */
	unreachable_reason(st) {
		if (!st.published)
			return _('The page files are not in place. Press "Save & Apply" to publish it.');

		if (!st.server_listening)
			return _('The main web server (uhttpd) is not listening on any of its ports, so nothing can serve the page.');

		return _('The page cannot be reached.');
	},

	/*
	 * The status panel. It answers one question - can the portal be reached -
	 * and reports the two conditions behind it rather than a process id: there
	 * is no portal daemon any more, the page is handed out by the main uhttpd.
	 *
	 * `enabled` stays a separate axis: when it is false the page is supposed to
	 * be absent, which is why the failure hint is replaced by one pointing at
	 * the switch - a portal the user switched off is not a fault.
	 */
	status_view(st) {
		if (!st)
			return [ E('em', {}, _('Service state unknown.')) ];

		const on = (st.enabled !== false);

		/*
		 * Composed from the origin this page was loaded from, not from a stored
		 * address: LuCI and the portal are served by the same uhttpd, so the
		 * origin is by construction the one that reaches it - whichever host,
		 * port or scheme the admin browsed in on.
		 */
		const url = window.location.origin + (st.path || '/liteportal/');

		const nodes = [
			E('table', { class: 'table' }, [
				this.status_row(_('Reachable'), on
					? [
						this.badge(st.reachable ? _('Yes') : _('No'), st.reachable),
						st.reachable ? '' : ' ' + this.unreachable_reason(st)
					]
					: [ this.muted_badge(_('Disabled')) ]),
				this.status_row(_('Address'),
					E('a', { href: url, target: '_blank', rel: 'noopener' }, url)),
				this.status_row(_('Bookmarks'), st.generated
					? _('%d baked into links.json').format(st.links)
					: E('em', {}, _('links.json has not been generated yet')))
			])
		];

		if (!on) {
			nodes.push(E('p', { class: 'alert-message' }, [
				_('The portal is switched off. Turn on "Enable portal" above, then press "Save & Apply" to publish it.')
			]));
		}
		else if (!st.reachable) {
			nodes.push(E('p', { class: 'alert-message warning' }, [
				this.unreachable_reason(st)
			]));
		}

		return nodes;
	},

	status_panel() {
		const body = E('div', { style: 'margin-bottom:.6em' }, E('em', {}, _('Querying…')));

		// Bound to the instance so that the helpers below resolve through the
		// prototype, exactly like a method call would.
		const self = this;

		function refresh() {
			body.replaceChildren(E('em', {}, _('Querying…')));

			return callStatus().then(function(st) {
				body.replaceChildren(...self.status_view(st));
			}).catch(function(err) {
				body.replaceChildren(E('em', {},
					_('Status query failed: %s').format((err && err.message) || err)));
			});
		}

		const node = E('div', { class: 'cbi-section liteportal-panel' }, [
			E('h3', {}, _('Service status')),
			body,
			E('div', { style: 'margin-top:.8em' }, [
				E('button', {
					class: 'btn cbi-button cbi-button-action',
					click: function(ev) {
						ev.preventDefault();
						return refresh();
					}
				}, _('Refresh')),
				' ',
				E('span', { class: 'cbi-value-description' },
					_('Re-reads the published state, it does not change the configuration.'))
			])
		]);

		node.refresh = refresh;

		return node;
	},

	/*
	 * The Maintenance section: scan the router for locally reachable services.
	 *
	 * It used to carry a second button that regenerated links.json on demand.
	 * That is gone (ROADMAP #10): a configuration change already runs
	 * `/etc/init.d/liteportal reload`, and procd_add_reload_trigger is registered
	 * on the service, so "Save & Apply" re-bakes the page whether or not
	 * anything about it changed. The button was a second path to something the
	 * normal save already does - and a misleading one, since pressing it
	 * republishes without fixing whatever the user came to change.
	 *
	 * It lives here rather than in either view because it is needed by both,
	 * and a copy per page would drift - the scan in particular has a rule about
	 * which ports may be offered without hesitation, and two copies of that
	 * rule are two chances to get it wrong. The caller decides where it goes;
	 * the Bookmarks page puts it above the list, since the scan writes bookmarks.
	 *
	 * `status` is the panel returned by status_panel(). Nothing in the section
	 * refreshes it at the moment - the Bookmarks page passes null and the
	 * Bookmarks page is the only caller - but it stays a parameter because a
	 * scan that republishes would want it, and status_panel() carries its own
	 * refresh button for the general case.
	 *
	 * `on_add(sids)` is how the caller learns which rows to draw. The scan does
	 * not touch the DOM: only the caller knows how a row of this table is built
	 * (this module has no idea what a bookmark row looks like), and passing the
	 * section ids back keeps the "which rows exist" decision in one place. When
	 * it is omitted the scan still works - the sections are staged - but nothing
	 * appears until the page is re-rendered, so the caller is expected to pass it.
	 */
	maintenance_section: function(m, status, on_add) {
		const s = m.section(form.TypedSection, 'liteportal', _('Maintenance'));
		const self = this;

		s.anonymous = true;
		s.addremove = false;

		let o = s.option(form.Button, '_scan', _('Discovery'));
		o.inputtitle = _('Scan local services & add (disabled)');
		o.inputstyle = 'action';
		o.onclick = function() {
			return this.run_rpc(scan_candidates).then(function(candidates) {
				/*
				 * run_rpc() resolves to null when the scan itself failed, and the
				 * error banner is already up - opening an empty dialog on top of it
				 * would only hide the reason.
				 */
				if (candidates == null)
					return null;

				if (!candidates.length) {
					self.notify(null, E('p', {},
						_('No new local services found.')), 'info');

					return null;
				}

				/*
				 * Nothing is written and nothing is redrawn until the dialog is
				 * answered. The old flow staged every recognised service on the
				 * spot and reloaded the page a second and a half later, which
				 * destroyed the notification it had just raised and gave the user
				 * no chance to look at what was about to be added.
				 */
				return confirm_scan(self, candidates, on_add);
			});
		}.bind(this);

		return s;
	},

	/*
	 * Shared stylesheet for the three admin views. Each view drops it into
	 * a <style> tag inside its .liteportal-admin wrapper (this LuCI has no
	 * view-level css() hook), and every rule is scoped under that class,
	 * so none of it can reach other pages or other apps. Left on its own,
	 * spacing comes from the active theme, and themes disagree - Argon in
	 * particular keeps button margins at zero and table cell contents
	 * top aligned.
	 */
	admin_css: function() {
		return [
			/* Breathing room below the last card, before the page edge. */
			'.liteportal-admin { padding-bottom: 2em }',

			/* Panels built by hand (status, asset sections) are not part
			 * of a form.Map, so themes that only pad map sections leave
			 * their contents flush against the container edge. */
			'.liteportal-admin .liteportal-panel { padding-left: .6em; padding-right: .6em }',

			/* Buttons default to baseline alignment; the row thumbnail is
			 * vertical-align:middle already, so an unaligned button makes
			 * the picture sit visibly above the row's centre. */
			'.liteportal-admin .cbi-section-table .btn { vertical-align: middle }'
		].join('\n');
	},

	callStatus: callStatus,
	callScan: callScan,

	scan_candidates: scan_candidates,
	stage_bookmarks: stage_bookmarks
});
