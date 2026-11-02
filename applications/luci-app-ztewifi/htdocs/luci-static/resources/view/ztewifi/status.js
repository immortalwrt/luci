'use strict';
'require view';
'require dom';
'require poll';
'require uci';
'require ui';
'require view.ztewifi.common as common';

function renderContent(st) {
	if (!st || !st.ok) {
		return E('div', {}, [
			E('div', { 'class': 'alert-message error' }, [
				E('strong', {}, [ _('Read failed') + ': ' ]),
				(st && st.error) ? st.error : _('Unknown error')
			]),
			E('p', {}, [ _('Check the device IP and password on the Settings page, and make sure the router can reach the portable WiFi.') ])
		]);
	}

	var n = st.network || {}, s = st.signal || {}, d = st.device || {},
	    b = st.battery || {}, t = st.traffic || {}, w = st.wifi || {};

	var pct = common.rsrpPercent(s.rsrp, s.bars);
	var icon = common.signalIcon(pct);
	var level = common.levelName(s.level);

	var signal = E('table', { 'class': 'table' });
	signal.appendChild(common.row(_('Network type'), n.type || '-'));
	signal.appendChild(common.row(_('Radio band'), n.band || '-'));
	signal.appendChild(common.row(_('Channel'), n.channel || '-'));
	signal.appendChild(common.row(_('Cell ID'), n.cell_id || '-'));
	signal.appendChild(E('tr', { 'class': 'tr' }, [
		E('td', { 'class': 'td left', 'width': '34%' }, [ _('Signal strength') ]),
		E('td', { 'class': 'td left' }, [
			E('span', { 'style': 'display:flex;align-items:center;flex-wrap:wrap' }, [
				E('span', { 'style': 'margin-right:.75em' }, [
					common.badge(icon, common.fmt(s.rsrp, '\u00a0dBm'),
						_('Signal') + ': ' + common.fmt(s.rsrp, ' dBm') +
						' / ' + _('Quality') + ': ' + pct + '%')
				]),
				E('span', {}, [
					pct + '%' + (level ? '  ' + level : '') +
					'   (' + _('device reports') + ' ' + (s.bars || 0) + '/5)'
				])
			])
		])
	]));
	signal.appendChild(common.row('RSRP / RSRQ / SINR',
		common.fmt(s.rsrp, ' dBm') + '  /  ' + common.fmt(s.rsrq, ' dB') + '  /  ' + common.fmt(s.sinr, ' dB')));
	signal.appendChild(common.row('RSSI', common.fmt(s.rssi || s.lte_rssi, ' dBm')));
	signal.appendChild(common.row('LTE RSRP', common.fmt(s.lte_rsrp, ' dBm')));
	signal.appendChild(common.row(_('Rate'), '\u2191 ' + (t.tx || 0) + '   \u2193 ' + (t.rx || 0)));

	var net = E('table', { 'class': 'table' });
	net.appendChild(common.row(_('Operator'),
		[ n.provider, (n.mcc && n.mnc) ? '(' + n.mcc + '/' + n.mnc + ')' : '' ].filter(Boolean).join(' ') || '-'));
	net.appendChild(common.row(_('Roaming'), n.roam || '-'));
	net.appendChild(common.row(_('Dial status'), n.ppp_status || '-'));
	net.appendChild(common.row('WAN IP', n.wan_ip || '-'));
	net.appendChild(common.row('LAN IP', n.lan_ip || '-'));

	var dev = E('table', { 'class': 'table' });
	dev.appendChild(common.row(_('Model'),
		[ d.market, d.model ].filter(Boolean).join(' / ') || '-'));
	dev.appendChild(common.row(_('Firmware'), d.firmware || '-'));
	dev.appendChild(common.row('IMEI', d.imei || '-'));
	dev.appendChild(common.row('ICCID', d.iccid || '-'));
	dev.appendChild(common.row('IMSI', d.imsi || '-'));
	dev.appendChild(common.row('MSISDN', d.msisdn || '-'));
	dev.appendChild(common.row('WiFi SSID',
		(w.ssid || '-') + '   [' + (w.enabled ? _('On') : _('Off')) + ']'));
	dev.appendChild(common.row(_('Battery'),
		(b.percent || 0) + '%' + (b.charging ? ' ' + _('(charging)') : '')));

	return E('div', { 'class': 'cbi-section-node' }, [
		E('div', { 'class': 'cbi-section' }, [ E('h3', {}, [ _('Signal') ]), signal ]),
		E('div', { 'class': 'cbi-section' }, [ E('h3', {}, [ _('Network') ]), net ]),
		E('div', { 'class': 'cbi-section' }, [ E('h3', {}, [ _('Device') ]), dev ]),
		E('p', { 'class': 'cbi-section-descr' }, [
			_('Collected from %s, device time %s').format(st.ip || '-', st.time || '-')
		])
	]);
}

return view.extend({
	load: function () {
		return Promise.all([ common.callStatus(), uci.load('ztewifi') ]);
	},

	render: function (data) {
		var interval = parseInt(uci.get('ztewifi', 'main', 'interval')) || 5;
		var box = E('div', { 'class': 'ztewifi-status-box' });

		var update = function (st) { dom.content(box, renderContent(st)); };
		update(data[0]);

		var refresh = function () {
			return common.callStatus().then(function (st) { update(st); return st; });
		};

		poll.add(refresh, interval);

		return E('div', {}, [
			E('div', { 'class': 'cbi-map' }, [
				E('h2', {}, [ _('ZTE Portable WiFi Status') ]),
				E('div', { 'class': 'cbi-map-descr' }, [
					_('Auto refresh every %d seconds; configurable on the Settings page.').format(interval)
				]),
				box
			]),
			E('div', { 'class': 'cbi-page-actions' }, [
				E('button', {
					'class': 'cbi-button cbi-button-action',
					'click': ui.createHandlerFn(this, refresh)
				}, [ _('Refresh now') ])
			])
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
