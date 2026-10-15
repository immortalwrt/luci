'use strict';
'require baseclass';
'require view.ztewifi.common as common';

/*
 * Overview (Status -> Overview) panel.
 *
 * The layout copies the stock LuCI "Wireless" section: a
 * .network-status-table wrapper containing an ifacebox (coloured title
 * bar + "Label: value" list) with a wide ifacebadge at the bottom.
 * The badge only stretches inside .network-status-table, see
 *   .network-status-table .ifacebox-body .ifacebadge { display:flex; flex:1; min-width:220px }
 *
 * The file name prefix "29z_" is deliberate: the overview page sorts the
 * files found in view/status/include/ as strings and renders them in
 * order, so 29_ports < 29z_ztewifi < 30_network places this panel right
 * below "Port Status" and above "Network".
 */
return baseclass.extend({
	title: _('ZTE Portable WiFi'),

	load: function () {
		return common.callStatus();
	},

	render: function (st) {
		if (!st || !st.ok) {
			return E('div', { 'class': 'alert-message warning' }, [
				E('strong', {}, [ _('Read failed') + ': ' ]),
				(st && st.error) ? st.error : _('Unknown error'),
				E('br'),
				E('a', { 'href': '/cgi-bin/luci/admin/services/ztewifi/settings' }, [ _('Open settings') ])
			]);
		}

		var n = st.network || {}, s = st.signal || {}, d = st.device || {}, b = st.battery || {};

		var pct = common.rsrpPercent(s.rsrp, s.bars);
		var icon = common.signalIcon(pct);
		var connected = /connected|connect/i.test(n.ppp_status || '');
		var model = [ d.market, d.model ].filter(Boolean).join(' / ');

		var info = [
			_('Network type'), n.type || null,
			_('Radio band'), n.band || null,
			_('Channel'), n.channel || null,
			_('Cell ID'), n.cell_id || null,
			_('Operator'),
				[ n.provider, (n.mcc && n.mnc) ? '(' + n.mcc + '/' + n.mnc + ')' : '', n.roam ]
					.filter(Boolean).join('  ') || null,
			_('Connection'), n.ppp_status || null,
			_('Firmware'), d.firmware || null,
			_('Battery'), (b.percent || 0) + '%' + (b.charging ? ' ' + _('(charging)') : '')
		];

		var badge = common.badgeWide(icon,
			_('Signal') + ': ' + common.fmt(s.rsrp, ' dBm') + ' / ' + _('Quality') + ': ' + pct + '%',
			[
				'RSRP', common.fmt(s.rsrp, '\u00a0dBm'),
				'RSRQ', common.fmt(s.rsrq, '\u00a0dB'),
				'SINR', common.fmt(s.sinr, '\u00a0dB'),
				_('Quality'), pct + '%' + (common.levelName(s.level) ? '  ' + common.levelName(s.level) : ''),
				_('Rate'), '\u2191 ' + (st.traffic && st.traffic.tx || 0) + '   \u2193 ' + (st.traffic && st.traffic.rx || 0),
				'WAN IP', n.wan_ip || null,
				'WiFi SSID', (st.wifi && st.wifi.ssid) ? st.wifi.ssid : null
			]);

		var box = common.ifaceBox(model || _('ZTE Portable WiFi'), connected,
			[ E('div', {}, [ badge ]) ], info);

		return E('div', { 'class': 'network-status-table' }, [ box ]);
	}
});
