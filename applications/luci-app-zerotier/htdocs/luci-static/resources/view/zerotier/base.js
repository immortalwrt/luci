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
	expect: { '': {} },
});


function tidyExtra(data) {
	var extra_sections = L.uci.sections('zerotier-extra', 'network');
	var sections = Object.values(data);
	var section_ids = sections.length > 0 ? sections.map(section => section['id']) : [];
	var remove_section_names = [];
	for (var i = 0; i < extra_sections.length; i++) {
		var idx = section_ids.indexOf(extra_sections[i]['id']);
		if (idx === -1) {
			remove_section_names.push(extra_sections[i]['.name']);
			continue;
		}
		section_ids.splice(idx, 1);
		var section = sections.splice(idx, 1)[0];	
		// if (section.hasOwnProperty('') && section['auto_nat'] == '1') {
			if (section?.['auto_nat'] == '1') {
				L.uci.set('zerotier-extra', extra_sections[i]['.name'], 'auto_nat', '1');
				continue;
		}
		remove_section_names.push(extra_sections[i]['.name']);
	}

	for (var i = 0; i < remove_section_names.length; i++) {
		L.uci.remove('zerotier-extra', remove_section_names[i]);
	}

	for (var i = 0; i < sections.length; i++) {
		var section = sections[i];
		if (section?.['auto_nat'] == '1') {
			var name = L.uci.add('zerotier-extra', section['.type']);
			L.uci.set('zerotier-extra', name, 'id', section['id']);
			L.uci.set('zerotier-extra', name, 'auto_nat', 1);
		}
	}
}

function getServiceStatus() {
	return L.resolveDefault(callServiceList('zerotier'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['zerotier']['instances']['instance1']['running'];
		} catch (e) {}
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp =
		'<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	var renderHTML;
	if (isRunning) {
		renderHTML = String.format(spanTemp, 'green', _('ZeroTier'), _('RUNNING'));
	} else {
		renderHTML = String.format(
			spanTemp,
			'red',
			_('ZeroTier'),
			_('NOT RUNNING')
		);
	}

	return renderHTML;
}
async function loadNetwork() {
	await L.uci.load('zerotier', 'zerotier-extra');
}
return view.extend({
	// load: function () {
	// 	return Promise.all([
	//   L.uci.load('zerotier'),
	//   L.uci.load('zerotier-extra').then(async() => {
	// 	  return await L.uci.sections('zerotier-extra', 'network')
	//   }).catch(() => {
	// 	  return [];
	//   })
	// ]);
	// },
	load: function () {
		return L.uci.load(['zerotier', 'zerotier-extra']).then(data => {
			var sections = uci.sections('zerotier', 'network');
			var extra_sections = uci.sections('zerotier-extra', 'network');
			var extra_configs = {};
			extra_sections.forEach(section => {
				extra_configs[section['id']] = section;
			});

			sections.forEach(section => {
				if (section['id'] in extra_configs) {
					section['auto_nat'] = extra_configs[section['id']]['auto_nat'];
					section['.extra_name'] = extra_configs[section['id']]['.name'];
				}
			});
			return { network: sections };
		});
	},

	render: function (data) {
		var m, s, o;

		m = new form.Map(
			'zerotier',
			_('ZeroTier'),
			_(
				'ZeroTier is an open source, cross-platform and easy to use virtual LAN.'
			)
		);

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				E('p', { id: 'service_status' }, _('Collecting data ...')),
			]);
		};

		s = m.section(form.NamedSection, 'global', 'zerotier');
		o = s.option(
			form.Flag,
			'enabled',
			_('Enable'),
			_('Sets whether ZeroTier is enabled or not')
		);
		o.rmempty = false;

		o = s.option(
			form.Value,
			'port',
			_('Listening Port'),
			_('Sets the ZeroTier listening port (default 9993; set to 0 for random)')
		);
		o.datatype = 'port';
		o.default = '9993';

		o = s.option(
			form.Value,
			'secret',
			_('Client Secret'),
			_('Client secret (leave blank to generate a secret on first run)')
		);
		o.datatype = 'string';
		o.rmempty = true;

		o = s.option(
			form.Value,
			'local_conf_path',
			_('Local Configuration Path'),
			_(
				'Path of the optional file local.conf (see documentation at https://docs.zerotier.com/config#local-configuration-options)'
			)
		);

		o = s.option(
			form.Value,
			'config_path',
			_('Persistent Configuration Path'),
			_(
				'Persistent configuration directory (to perform other configurations such as controller mode or moons, etc.)'
			)
		);

		// copy_config_path
		o = s.option(
			form.Flag,
			'copy_config_path',
			_('Copy Configuration Directory'),
			_(
				'Copy the contents of the persistent configuration directory to memory instead of linking it, this avoids writing to flash'
			)
		);

		o = s.option(
			form.Button,
			'_panel',
			_('ZeroTier Central'),
			_(
				'Create or manage your ZeroTier network, and auth clients who could access.'
			)
		);
		o.inputtitle = _('Open website');
		o.inputstyle = 'apply';
		o.onclick = function () {
			window.open('https://my.zerotier.com/network', '_blank');
		};

		var netM, netS, netO;
		netM = new form.JSONMap(data);
		netS = netM.section(
			form.GridSection,
			'network',
			_('Networks'),
			_(
				'Network configuration, you can have as many configurations as networks you want to join. see documentation at https://docs.zerotier.com/config/#network-specific-configuration'
			)
		);
		netS.anonymous = true;
		netS.addremove = true;
		netS.sortable = true;
		netS.nodescriptions = true;
		netS.addbtntitle = _('Add new Network...');
		netS.handleModalSave = function (...args) {
			var section_name = args[0].section;
			var old_section = Object.assign({}, this.map.data.data[section_name]);
			var res = form.GridSection.prototype.handleModalSave.apply(this, args);
			var section_name = args[0].section;
			var section = this.map.data.data[section_name];
			if ('addedSection' in this.map) {
				var new_name = L.uci.add('zerotier', section['.type']);
				for (var key in section) {
					if (key.charAt(0) != '.' && key != 'auto_nat') {
						L.uci.set('zerotier', new_name, key, section[key]);
					}
				}
				section['.name'] = new_name;
				this.map.data.data[new_name] = section;
				delete this.map.data.data[section_name];
			} else {
				for (var key in section) {
					if (key.charAt(0) != '.' && key != 'auto_nat' && old_section[key] != section[key]) {
						L.uci.set('zerotier', section_name, key, section[key]);
					}
				}
			}
			tidyExtra(this.map.data.data);
			L.uci.save();
			return res;
		};
		netS.handleRemove = function (section_id, ev) {
			var res =  form.GridSection.prototype.handleRemove.apply(this, [section_id,ev]);
			L.uci.remove('zerotier', section_id);
			tidyExtra(this.map.data.data);
			L.uci.save();
			return res;
		};
		netO = netS.option(form.Value, 'id', _('ID'));
		netO = netS.option(
			form.Flag,
			'allow_managed',
			_('Allow Managed'),
			_(
				'Allow ZeroTier to set IP Addresses and Routes ( local/private ranges only). Default Yes.'
			)
		);
		netO.default = '1';

		// allow_global
		netS.option(
			form.Flag,
			'allow_global',
			_('Allow Global'),
			_(
				'Allow ZeroTier to set Global/Public/Not-Private range IPs and Routes. Default No.'
			)
		);
		// allow_default
		netS.option(
			form.Flag,
			'allow_default',
			_('Allow Default'),
			_('Allow ZeroTier to set the Default Route on the system. Default No.')
		);
		// allow_dns
		netS.option(
			form.Flag,
			'allow_dns',
			_('Allow DNS'),
			_('Allow ZeroTier to set DNS servers. Default No.')
		);
		// auto_nat
		netO = netS.option(
			form.Flag,
			'auto_nat',
			_('Auto NAT clients'),
			_('Allow ZeroTier clients access your LAN network.')
		);
		netO.default = '0';

		return Promise.all([m.render(), netM.render()]);
	},
});
