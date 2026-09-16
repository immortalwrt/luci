/* SPDX-License-Identifier: GPL-3.0-only
 *
 * Copyright (C) 2022 ImmortalWrt.org
 */

'use strict';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require ui';
'require view';
'require tools.widgets as widgets';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceEnabled() {
	return fs.exec('/etc/init.d/zerotier', ['enabled']).then(function(res) {
			return res && res.code === 0;
		})
		.catch(function() {
			return false;
		});
}

function getServiceStatus() {
	return Promise.all([
		L.resolveDefault(callServiceList('zerotier'), {}),
		getServiceEnabled()
	]).then(function(results) {
		const res = results[0];
		const enabled = results[1];
		const configEnabled = uci.get('zerotier', 'global', 'enabled') === '1';
		let running = false;

		try {
			running = res['zerotier']['instances']['instance1']['running'] === true;
		} catch (e) {
			running = false;
		}

		return {
			running: running,
			enabled: enabled,
			configEnabled: configEnabled
		};
	});
}

function execServiceAction(action) {
	return fs.exec('/etc/init.d/zerotier', [action])
		.then(function(res) {
			if (!res || res.code !== 0) {
				let msg = 'Service action failed: ' + action;

				if (res && res.stderr)
					msg += ': ' + res.stderr;

				throw new Error(msg);
			}

			return res;
		})
		.catch(function(err) {
			console.error('ZeroTier service action failed:', action, err);
			throw err;
		});
}

function renderStatus(isRunning, isEnabled, configEnabled) {
	const status = isRunning ? _('Running') : _('Stopped');
	const autostart = isEnabled ? _('Enabled') : _('Disabled');
	let text = status + ' (' + autostart + ')';
	const color = isRunning ? 'green' : 'red';

	if (!configEnabled)
		text += ' - ' + _('Disabled in Global configuration');

	return E('span', {
		style: 'color:' + color + '; font-weight:bold;'
	}, text);
}

function pollServiceStatus(expectRunning, callback) {
	const maxAttempts = 300;
	let attempt = 0;

	function checkStatus() {
		attempt++;

		getServiceStatus().then(function(status) {
			const isRunning = status.running === true;

			if (expectRunning ? isRunning : !isRunning) {
				callback(true);
			}
			else if (attempt >= maxAttempts) {
				callback(false, 'timeout');
			}
			else {
				setTimeout(checkStatus, 1000);
			}
		}).catch(function() {
			if (attempt < maxAttempts)
				setTimeout(checkStatus, 1000);
			else
				callback(false, 'error');
		});
	}

	setTimeout(checkStatus, 3000);
}

return view.extend({
	render() {
		const m = new form.Map('zerotier', _('ZeroTier'),
			_('ZeroTier is an open source, cross-platform and easy to use virtual LAN.'));

		let s, o;

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.cfgsections = function() {
			return [ 'status' ];
		};

		s.render = function() {
			const section = E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Status'))
			]);

			const version = E('div', { class: 'cbi-value' }, [
				E('label', { class: 'cbi-value-title' }, _('Version')),
				E('div', { class: 'cbi-value-field' }, _('Collecting data…'))
			]);

			const status = E('div', { class: 'cbi-value' }, [
				E('label', { class: 'cbi-value-title' }, _('Status')),
				E('div', { class: 'cbi-value-field' }, _('Collecting data…'))
			]);

			const btnStart = E('button', {
				class: 'btn cbi-button cbi-button-apply',
				disabled: true,
				type: 'button',
				click: function() {
					ui.showModal(null, [
						E('p', {
							class: 'spinning'
						}, _('Starting ZeroTier service'))
					]);

					execServiceAction('start')
						.then(function() {
							pollServiceStatus(true, function() {
								ui.hideModal();
								getServiceStatus().then(updateStatus);
							});
						})
						.catch(function(err) {
							ui.hideModal();
							ui.addNotification(null,
								E('p', {}, _('Failed to start ZeroTier service: %s').format(err.message)),
								'error'
							);
							getServiceStatus().then(updateStatus);
						});
				}
			}, _('Start'));

			const btnRestart = E('button', {
				class: 'btn cbi-button cbi-button-apply',
				disabled: true,
				type: 'button',
				click: function() {
					ui.showModal(null, [
						E('p', {
							class: 'spinning'
						}, _('Restarting ZeroTier service'))
					]);

					execServiceAction('restart')
						.then(function() {
							pollServiceStatus(true, function() {
								ui.hideModal();
								getServiceStatus().then(updateStatus);
							});
						})
						.catch(function(err) {
							ui.hideModal();
							ui.addNotification(null,
								E('p', {}, _('Failed to restart ZeroTier service: %s').format(err.message)),
								'error'
							);
							getServiceStatus().then(updateStatus);
						});
				}
			}, _('Restart'));

			const btnStop = E('button', {
				class: 'btn cbi-button cbi-button-reset',
				disabled: true,
				type: 'button',
				click: function() {
					ui.showModal(null, [
						E('p', {
							class: 'spinning'
						}, _('Stopping ZeroTier service'))
					]);

					execServiceAction('stop')
						.then(function() {
							pollServiceStatus(false, function() {
								ui.hideModal();
								getServiceStatus().then(updateStatus);
							});
						})
						.catch(function(err) {
							ui.hideModal();
							ui.addNotification(null,
								E('p', {}, _('Failed to stop ZeroTier service: %s').format(err.message)),
								'error'
							);
							getServiceStatus().then(updateStatus);
						});
				}
			}, _('Stop'));

			const btnEnable = E('button', {
				class: 'btn cbi-button cbi-button-apply',
				disabled: true,
				type: 'button',
				click: function() {
					ui.showModal(null, [
						E('p', {
							class: 'spinning'
						}, _('Enabling ZeroTier service'))
					]);

					execServiceAction('enable')
						.then(function() {
							return getServiceStatus();
						})
						.then(function(res) {
							ui.hideModal();
							updateStatus(res);
						})
						.catch(function(err) {
							ui.hideModal();
							ui.addNotification(null,
								E('p', {}, _('Failed to enable ZeroTier service: %s').format(err.message)),
								'error'
							);
							getServiceStatus().then(updateStatus);
						});
				}
			}, _('Enable'));

			const btnDisable = E('button', {
				class: 'btn cbi-button cbi-button-reset',
				disabled: true,
				type: 'button',
				click: function() {
					ui.showModal(null, [
						E('p', {
							class: 'spinning'
						}, _('Disabling ZeroTier service'))
					]);

					execServiceAction('disable')
						.then(function() {
							return getServiceStatus();
						})
						.then(function(res) {
							ui.hideModal();
							updateStatus(res);
						})
						.catch(function(err) {
							ui.hideModal();
							ui.addNotification(null,
								E('p', {}, _('Failed to disable ZeroTier service: %s').format(err.message)),
								'error'
							);
							getServiceStatus().then(updateStatus);
						});
				}
			}, _('Disable'));

			const btnGap = E('span', {}, '\u00a0\u00a0');
			const btnGapLong = E('span', {}, '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0');
			const buttonsTitle = E('label', {
				class: 'cbi-value-title'
			}, _('Service Control'));

			const buttonsText = E('div', {}, [
				btnStart,
				btnGap,
				btnRestart,
				btnGap,
				btnStop,
				btnGapLong,
				btnEnable,
				btnGap,
				btnDisable
			]);

			const buttonsField = E('div', {
				class: 'cbi-value-field'
			}, buttonsText);

			const buttonsRow = E('div', {
				class: 'cbi-value'
			}, [
				buttonsTitle,
				buttonsField
			]);

			section.appendChild(version);
			section.appendChild(status);
			section.appendChild(buttonsRow);

			function updateStatus(res) {
				res = res || {};

				status.lastElementChild.replaceChildren(
					renderStatus(
						res.running === true,
						res.enabled === true,
						res.configEnabled === true
					)
				);

				if (res.running === true) {
					btnStart.disabled = true;
					btnRestart.disabled = !res.configEnabled;
					btnStop.disabled = false;
				}
				else {
					btnStart.disabled = !res.configEnabled;
					btnRestart.disabled = true;
					btnStop.disabled = true;
				}

				btnEnable.disabled = res.enabled === true;
				btnDisable.disabled = res.enabled !== true;
			}

			fs.exec_direct('/usr/bin/zerotier-one', ['-v'])
				.then(function(res) {
					version.lastElementChild.textContent = res.trim();
				})
				.catch(function() {
					version.lastElementChild.textContent = _('Unknown');
				});

			getServiceStatus().then(updateStatus);

			poll.add(function() {
				return getServiceStatus().then(updateStatus);
			});

			return section;
		};

		s = m.section(form.NamedSection, 'global', 'zerotier', _('Global configuration'));

		o = s.option(form.Flag, 'enabled', _('Enable'));

		o = s.option(form.Value, 'port', _('Listen port'));
		o.datatype = 'port';

		o = s.option(form.Value, 'secret', _('Client secret'));
		o.password = true;

		o = s.option(form.Value, 'local_conf_path', _('Local config path'),
			_('Path of the optional file local.conf (see <a target="_blank" href="%s">documentation</a>).').format(
				'https://docs.zerotier.com/config/#local-configuration-options'));
		o.value('/etc/zerotier.conf');

		o = s.option(form.Value, 'config_path', _('Config path'),
			_('Persistent configuration directory (to keep other configurations such as controller or moons, etc.).'));
		o.value('/etc/zerotier');

		o = s.option(form.Flag, 'copy_config_path', _('Copy config path'),
			_('Copy the contents of the persistent configuration directory to memory instead of linking it, this avoids writing to flash.'));
		o.depends({'config_path': '', '!reverse': true});

		o = s.option(form.Flag, 'fw_allow_input', _('Allow input traffic'),
			_('Allow input traffic to the ZeroTier daemon.'));

		o = s.option(form.Button, '_panel', _('ZeroTier Central'),
			_('Create or manage your ZeroTier network, and auth clients who could access.'));
		o.inputtitle = _('Open website');
		o.inputstyle = 'apply';
		o.onclick = function() {
			window.open("https://my.zerotier.com/network", '_blank');
		};

		s = m.section(form.GridSection, 'network', _('Network configuration'));
		s.addremove = true;
		s.rowcolors = true;
		s.sortable = true;
		s.nodescriptions = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.enabled;
		o.editable = true;

		o = s.option(form.Value, 'id', _('Network ID'));
		o.rmempty = false;
		o.width = '20%';

		o = s.option(form.Flag, 'allow_managed', _('Allow managed IP/route'),
			_('Allow ZeroTier to set IP addresses and routes (local/private ranges only).'));
		o.default = o.enabled;
		o.editable = true;

		o = s.option(form.Flag, 'allow_global', _('Allow global IP/route'),
			_('Allow ZeroTier to set global/public/not-private range IPs and routes.'));
		o.editable = true;

		o = s.option(form.Flag, 'allow_default', _('Allow default route'),
			_('Allow ZeroTier to set the default route on the system.'));
		o.editable = true;

		o = s.option(form.Flag, 'allow_dns', _('Allow DNS'),
			_('Allow ZeroTier to set DNS servers.'));
		o.editable = true;

		o = s.option(form.Flag, 'fw_allow_input', _('Allow input'),
			_('Allow input traffic from the ZeroTier network.'));
		o.editable = true;

		o = s.option(form.Flag, 'fw_allow_forward', _('Allow forward'),
			_('Allow forward traffic from/to the ZeroTier network.'));
		o.editable = true;

		o = s.option(widgets.DeviceSelect, 'fw_forward_ifaces', _('Forward interfaces'),
			_('Leave empty for all.'));
		o.multiple = true;
		o.noaliases = true;
		o.depends('fw_allow_forward', '1');
		o.modalonly = true;

		o = s.option(form.Flag, 'fw_allow_masq', _('Masquerading'),
			_('Enable network address and port translation (NAT) for outbound traffic for this network.'));
		o.editable = true;

		o = s.option(widgets.DeviceSelect, 'fw_masq_ifaces', _('Masquerade interfaces'),
			_('Leave empty for all.'));
		o.multiple = true;
		o.noaliases = true;
		o.depends('fw_allow_masq', '1');
		o.modalonly = true;

		return m.render();
	}
});
