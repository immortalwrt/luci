'use strict';
'require baseclass';
'require fs';

/*
 * Shared helpers.
 *
 * NOTE: LuCI instantiates the class a module returns
 * (loader does `const instance = new _class()`), so a module must
 * `return baseclass.extend({...})` rather than a plain object literal,
 * otherwise it fails with "factory yields invalid constructor".
 */

/* Run /usr/bin/ztewifi and parse its JSON output. All failures are
 * normalised to {ok: false, error: "..."} so views can handle one shape. */
function callStatus() {
	return fs.exec('/usr/bin/ztewifi', [ 'status' ]).then(function (res) {
		var out = (res.stdout || '').trim();
		try {
			return JSON.parse(out);
		}
		catch (e) {
			return {
				ok: false,
				error: out ? out.slice(0, 300) : ((res.stderr || '').trim() || _('No output from device'))
			};
		}
	}).catch(function (e) {
		var msg = (e && e.message) ? e.message : String(e);
		if (/PermissionError/.test(msg))
			msg += ' (' + _('missing file.exec permission, please log in as an administrator') + ')';
		return { ok: false, error: msg };
	});
}

/* Print a value, treating 0 / empty as "no data". */
function fmt(v, unit) {
	if (v === undefined || v === null || v === '' || v === 0)
		return '-';
	return v + (unit || '');
}

/* RSRP (dBm) to a 0..100 quality percentage; falls back to the
 * bar count reported by the device when RSRP is unavailable. */
function rsrpPercent(rsrp, bars) {
	var r = parseInt(rsrp);
	if (!r)
		return Math.max(0, Math.min(100, (parseInt(bars) || 0) * 20));
	return Math.max(0, Math.min(100, Math.round((r + 115) * 100 / 35)));
}

/* Pick the stock OpenWrt signal icon (same thresholds as 60_wifi.js). */
function signalIcon(pct) {
	var name = (pct <= 0) ? 'signal-000-000'
		: (pct < 25) ? 'signal-000-025'
		: (pct < 50) ? 'signal-025-050'
		: (pct < 75) ? 'signal-050-075'
		: 'signal-075-100';
	return L.resource('icons/' + name + '.svg');
}

/* Human readable name for the level code emitted by the backend. */
function levelName(code) {
	switch (code) {
		case 'excellent': return _('Excellent');
		case 'good':      return _('Good');
		case 'fair':      return _('Fair');
		case 'weak':      return _('Weak');
		case 'poor':      return _('Poor');
		default:          return code || '';
	}
}

/* ---------------------------------------------------------------
 * The three helpers below re-create what the LuCI overview template
 * admin_status/index.ut injects globally (renderBox / renderBadge /
 * L.itemlist), so the panel looks exactly like the stock "Wireless"
 * section. The native implementations are preferred when present.
 * ------------------------------------------------------------- */

function itemlist(pairs) {
	if (typeof L.itemlist === 'function')
		return L.itemlist(E('span'), pairs);

	/* Equivalent fallback: one "Label: value" per line, <br> separated */
	var children = [];
	for (var i = 0; i < pairs.length; i += 2) {
		if (pairs[i + 1] === null || pairs[i + 1] === undefined)
			continue;
		if (children.length)
			children.push(E('br'));
		children.push(E('span', { 'class': 'nowrap' }, [
			pairs[i] ? E('strong', pairs[i] + ': ') : '',
			pairs[i + 1]
		]));
	}
	return E('span', {}, children);
}

/* Compact signal badge: icon on top, one line of text below. */
function badge(icon, text, title) {
	return E('span', { 'class': 'ifacebadge', 'title': title || text }, [
		E('img', { 'src': icon }),
		E('span', {}, [ ' ', text ])
	]);
}

/* Wide signal badge: icon on the left, multiple "Label: value" lines
 * on the right. Only stretches inside a .network-status-table container. */
function badgeWide(icon, title, pairs) {
	if (typeof renderBadge === 'function')
		return renderBadge.apply(null, [ icon, title ].concat(pairs));

	return E('span', { 'class': 'ifacebadge' }, [
		E('img', { 'src': icon, 'title': title || '' }),
		itemlist(pairs)
	]);
}

/* ifacebox: informational card with a coloured title bar. */
function ifaceBox(title, active, children, pairs) {
	if (typeof renderBox === 'function')
		return renderBox.apply(null, [ title, active, children ].concat(pairs));

	children = (children || []).slice();
	children.unshift(itemlist(pairs));

	return E('div', { 'class': 'ifacebox' }, [
		E('div', { 'class': 'ifacebox-head center ' + (active ? 'active' : '') },
			E('strong', title)),
		E('div', { 'class': 'ifacebox-body left' }, children)
	]);
}

/* Plain "label - value" table row (used by the app status page). */
function row(label, value) {
	return E('tr', { 'class': 'tr' }, [
		E('td', { 'class': 'td left', 'width': '34%' }, [ label ]),
		E('td', { 'class': 'td left' }, [
			(value === undefined || value === null || value === '') ? '\u2014' : value
		])
	]);
}

return baseclass.extend({
	callStatus: callStatus,
	fmt: fmt,
	rsrpPercent: rsrpPercent,
	signalIcon: signalIcon,
	levelName: levelName,
	badge: badge,
	badgeWide: badgeWide,
	ifaceBox: ifaceBox,
	itemlist: itemlist,
	row: row
});
