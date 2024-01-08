/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2022 ImmortalWrt.org
 */

'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('zerotier'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['zerotier']['instances']['instance1']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp = '<label class="cbi-value-title">Status</label><div class="cbi-value-field"><em><span style="color:%s">%s</span></em></div>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('Running'));
	} else {
		renderHTML = String.format(spanTemp, 'red', _('Not Running'));
	}

	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('zerotier')
		]);
	},

	render: function(data) {
		var m, s, o;

		m = new form.Map('zerotier', _('ZeroTier'),
			_('ZeroTier is an open source, cross-platform and easy to use virtual LAN.'));

		s = m.section(form.NamedSection, 'sample_config', 'config');

		o = s.option(form.DummyValue, 'service_status', _('Status'));
		o.load = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('cbi-zerotier-sample_config-service_status');
					view.innerHTML = renderStatus(res);
				});
			});
		}
		o.value = _('Collectiong data ...');

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.DynamicList, 'join', _('Network ID'));
		o.rmempty = false;

		o = s.option(form.Flag, 'nat', _('Auto NAT clients'),
			_('Allow ZeroTier clients access your LAN network.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Button, '_panel', _('ZeroTier Central'),
			_('Create or manage your ZeroTier network, and auth clients who could access.'));
		o.inputtitle = _('Open website');
		o.inputstyle = 'apply';
		o.onclick = function () {
			window.open('https://my.zerotier.com/network', '_blank');
		}

		return m.render();
	}
});
