'use strict';

'require view';
'require form';
'require uci';
'require rpc';
'require poll';
'require ui';
'require tools.widgets as widgets';

var callStatus = rpc.declare({
	object: 'jlu-network-login',
	method: 'status',
	expect: { '': {} }
});

var callReconnect = rpc.declare({
	object: 'jlu-network-login',
	method: 'reconnect',
	expect: { '': {} }
});

var callNetworkReload = rpc.declare({
	object: 'network',
	method: 'reload',
	expect: { '': {} }
});

var callInitAction = rpc.declare({
	object: 'rc',
	method: 'init',
	params: [ 'name', 'action' ]
});

function state_label(state) {
	var map = {
		'idle': _('Idle'),
		'online': _('Online'),
		'challenge': _('Fetching challenge'),
		'login': _('Logging in'),
		'keepalive': _('Keeping alive')
	};

	return map[state] || state || '-';
}

/* 守护进程把「缺哪项配置」写进 last_error（如 ip required），这里翻成可读文案；
 * 未收录的原文照原样显示。 */
function err_label(err) {
	var map = {
		'disabled': _('Service is disabled'),
		'username required': _('Username is required'),
		'password required': _('Password is required'),
		'ip required': _('IP address is required'),
		'mac required': _('MAC address is required'),
		'manual reconnect': _('Manual reconnect')
	};

	return err ? (map[err] || err) : '-';
}

function set_text(id, text) {
	var el = document.getElementById(id);

	if (el)
		el.textContent = text;
}

/*
 * ubus 总线上没有 jlu-network-login 这个对象时，uhttpd 的 ubus 插件会直接回
 * -32000「Object not found」（在 ACL 校验之前），含义只有一个：守护进程没在跑。
 * 把它翻译成人能照着做的话，别让用户只看到一句 RPC 报错。
 */
function rpc_message(e) {
	var msg = String(e);

	if (msg.indexOf('Object not found') > -1)
		return _('the login service is not running (no ubus object) - start it with "/etc/init.d/jlu-network-login restart"');

	return msg;
}

return view.extend({
	handleOneClick: function(m, ev) {
		return m.save().then(function() {
			var ifname = uci.get('jlu-network-login', 'main', 'interface');
			var ip = uci.get('jlu-network-login', 'main', 'ip');
			var mac = uci.get('jlu-network-login', 'main', 'mac');
			var gw = uci.get('jlu-network-login', 'main', 'gateway');

			/* 缺项：不写任何配置，只提示缺了哪几项 */
			if (!ifname || !ip || !mac || !gw) {
				var missing = [];

				if (!ifname)
					missing.push(_('Interface'));
				if (!ip)
					missing.push(_('IP address'));
				if (!mac)
					missing.push(_('MAC address'));
				if (!gw)
					missing.push(_('Gateway'));

				ui.addNotification(_('One-click setup'),
					E('p', [ _('Fill in these fields first: %s').format(missing.join(' / ')) ]), 'warning');

				return;
			}

			mac = String(mac).toLowerCase();

			return Promise.all([ uci.load('network'), uci.load('dhcp') ]).then(function() {
				if (!uci.get('network', ifname))
					throw new Error(_('Network interface "%s" not found').format(ifname));

				var dnsmasq = uci.sections('dhcp', 'dnsmasq');
				var dnsmasqSid = (dnsmasq && dnsmasq.length) ? dnsmasq[0]['.name'] : null;
				if (!dnsmasqSid)
					dnsmasqSid = uci.add('dhcp', 'dnsmasq');

				var oldProto = uci.get('network', ifname, 'proto');
				var oldIpaddr = uci.get('network', ifname, 'ipaddr');
				var oldNetmask = uci.get('network', ifname, 'netmask');
				var oldGateway = uci.get('network', ifname, 'gateway');
				var oldDns = uci.get('network', ifname, 'dns');
				var oldMacaddr = uci.get('network', ifname, 'macaddr');
				var oldRebind = uci.get('dhcp', dnsmasqSid, 'rebind_protection');

				uci.set('jlu-network-login', 'main', 'backup_ifname', ifname);
				uci.set('jlu-network-login', 'main', 'backup_proto', oldProto || '');
				uci.set('jlu-network-login', 'main', 'backup_ipaddr', oldIpaddr || '');
				uci.set('jlu-network-login', 'main', 'backup_netmask', oldNetmask || '');
				uci.set('jlu-network-login', 'main', 'backup_gateway', oldGateway || '');
				uci.set('jlu-network-login', 'main', 'backup_dns', oldDns || '');
				uci.set('jlu-network-login', 'main', 'backup_macaddr', oldMacaddr || '');
				uci.set('jlu-network-login', 'main', 'backup_rebind_protection', (oldRebind != null) ? String(oldRebind) : '');
				uci.set('jlu-network-login', 'main', 'backup_time', String(Date.now()));

				uci.set('network', ifname, 'proto', 'static');
				uci.set('network', ifname, 'ipaddr', ip);
				uci.set('network', ifname, 'macaddr', mac);
				uci.set('network', ifname, 'gateway', gw);
				uci.set('network', ifname, 'dns', [ '10.10.10.10', '202.98.18.3' ]);
				if (!uci.get('network', ifname, 'netmask'))
					uci.set('network', ifname, 'netmask', '255.255.255.0');

				uci.set('dhcp', dnsmasqSid, 'rebind_protection', '0');

				return uci.save();
			}).then(function() {
				return Promise.all([
					callNetworkReload().catch(function(e) {
						ui.addNotification(null, E('p', [ _('Failed to reload the network: %s').format(String(e)) ]), 'warning');
					}),
					callInitAction('dnsmasq', 'restart').catch(function(e) {
						ui.addNotification(null, E('p', [ _('Failed to restart dnsmasq: %s').format(String(e)) ]), 'warning');
					})
				]);
			}).then(function() {
				ui.addNotification(null, E('p', [ _('One-click setup applied (static IP, MAC address, gateway and DNS are set, DNS rebind protection is disabled).') ]), 'info');
			});
		}).catch(function(e) {
			ui.addNotification(null, E('p', [ String((e && e.message) ? e.message : e) ]), 'danger');
		});
	},

	handleRestore: function(m, ev) {
		ui.showModal(_('Restore the previous settings?'), [
			E('p', [ _('This restores the interface settings that were backed up before the last one-click setup and re-enables DNS rebind protection.') ]),
			E('div', { 'class': 'right' }, [
				E('button', {
					'class': 'btn',
					'click': ui.createHandlerFn(this, ui.hideModal)
				}, [ _('Cancel') ]), ' ',
				E('button', {
					'class': 'btn cbi-button-action important',
					'click': ui.createHandlerFn(this, 'handleRestoreConfirm')
				}, [ _('Continue') ])
			])
		]);
	},

	handleRestoreConfirm: function(ev) {
		ui.hideModal();

		return Promise.all([ uci.load('jlu-network-login'), uci.load('network'), uci.load('dhcp') ]).then(function() {
			var ifname = uci.get('jlu-network-login', 'main', 'backup_ifname');
			if (!ifname)
				throw new Error(_('No backup found - run the one-click setup first.'));
			if (!uci.get('network', ifname))
				throw new Error(_('Network interface "%s" not found').format(ifname));

			var setOrUnset = function(conf, sid, opt, val) {
				if (Array.isArray(val)) {
					if (!val.length)
						return uci.unset(conf, sid, opt);
					return uci.set(conf, sid, opt, val);
				}
				if (val == null || val === '')
					return uci.unset(conf, sid, opt);
				return uci.set(conf, sid, opt, val);
			};

			setOrUnset('network', ifname, 'proto', uci.get('jlu-network-login', 'main', 'backup_proto'));
			setOrUnset('network', ifname, 'ipaddr', uci.get('jlu-network-login', 'main', 'backup_ipaddr'));
			setOrUnset('network', ifname, 'netmask', uci.get('jlu-network-login', 'main', 'backup_netmask'));
			setOrUnset('network', ifname, 'gateway', uci.get('jlu-network-login', 'main', 'backup_gateway'));
			setOrUnset('network', ifname, 'dns', uci.get('jlu-network-login', 'main', 'backup_dns'));
			setOrUnset('network', ifname, 'macaddr', uci.get('jlu-network-login', 'main', 'backup_macaddr'));

			var dnsmasq = uci.sections('dhcp', 'dnsmasq');
			var dnsmasqSid = (dnsmasq && dnsmasq.length) ? dnsmasq[0]['.name'] : null;
			if (dnsmasqSid) {
				var rp = uci.get('jlu-network-login', 'main', 'backup_rebind_protection');
				uci.set('dhcp', dnsmasqSid, 'rebind_protection', (rp != null && rp !== '') ? rp : '1');
			}

			return uci.save();
		}).then(function() {
			return Promise.all([
				callNetworkReload().catch(function(e) {
					ui.addNotification(null, E('p', [ _('Failed to reload the network: %s').format(String(e)) ]), 'warning');
				}),
				callInitAction('dnsmasq', 'restart').catch(function(e) {
					ui.addNotification(null, E('p', [ _('Failed to restart dnsmasq: %s').format(String(e)) ]), 'warning');
				})
			]);
		}).then(function() {
			ui.addNotification(null, E('p', [ _('Restore applied.') ]), 'info');
		}).catch(function(e) {
			ui.addNotification(null, E('p', [ String((e && e.message) ? e.message : e) ]), 'danger');
		});
	},

	handleReconnect: function(ev) {
		var btn = ev.currentTarget;

		/* 没启用时守护进程根本不会启动，点重连没有意义 —— 直接提示并刷新状态 */
		if (uci.get('jlu-network-login', 'main', 'enabled') != '1') {
			ui.addNotification(_('Reconnect'),
				E('p', [ _('The service is disabled - enable it and apply the settings first.') ]), 'warning');

			return this.refresh_status();
		}

		btn.disabled = true;

		return callReconnect().then(function(res) {
			if (res && res.result)
				ui.addNotification(_('Reconnect'),
					E('p', [ _('The login service is authenticating again now. Check "logread -e jlu-network-login" for details.') ]), 'info');
			else
				ui.addNotification(_('Reconnect'),
					E('p', [ _('Reconnect failed: %s').format((res && res.error) || _('unknown error')) ]), 'warning');
		}).catch(function(e) {
			ui.addNotification(_('Reconnect'),
				E('p', [ _('Reconnect failed: %s').format(rpc_message(e)) ]), 'warning');
		}).then(function() {
			btn.disabled = false;

			return this.refresh_status();
		}.bind(this));
	},

	/* 守护进程没在跑（ubus 对象不存在）时禁用「重连」按钮：
	 * 此时点它只会拿到一句 RPC 报错，按钮状态本身就把问题说清楚了。 */
	set_available: function(up) {
		var btn = document.getElementById('jlu-reconnect');

		if (btn)
			btn.disabled = !up;
	},

	refresh_status: function() {
		/* 只显示连接状态与最近错误。优先级：设置没启用 > 守护进程上报的最近错误 >
		 * RPC 失败原因。没启用时守护进程不会启动，提示「先启用」比任何日志都有用。 */
		var disabled = (uci.get('jlu-network-login', 'main', 'enabled') != '1')
			? _('The service is disabled - enable it and apply the settings first.')
			: null;

		return callStatus().then(function(st) {
			set_text('jlu-status-state', state_label(st.state));
			set_text('jlu-status-err', disabled || err_label(st.last_error));
			this.set_available(true);
		}.bind(this)).catch(function(e) {
			set_text('jlu-status-state', _('Service not running'));
			set_text('jlu-status-err', disabled || rpc_message(e));
			this.set_available(false);
		}.bind(this));
	},

	load: function() {
		return uci.load('jlu-network-login');
	},

	render: function(data) {
		var m = new form.Map('jlu-network-login', _('JLU Network Login'));

		var s = m.section(form.NamedSection, 'main', 'main');
		s.addremove = false;

		var o;
		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;

		o = s.option(form.Value, 'username', _('Username'));
		o.datatype = 'string';

		o = s.option(form.Value, 'password', _('Password'));
		o.password = true;
		o.datatype = 'string';

		o = s.option(widgets.NetworkSelect, 'interface', _('Interface'));
		o.nocreate = true;
		o.default = 'wan';

		o = s.option(form.Value, 'ip', _('IP address'));
		o.datatype = 'ip4addr';
		o.placeholder = '10.100.61.100';

		o = s.option(form.Value, 'gateway', _('Gateway'));
		o.datatype = 'ip4addr';
		o.placeholder = '10.100.61.1';

		o = s.option(form.Value, 'mac', _('MAC address'));
		o.datatype = 'macaddr';
		o.placeholder = 'aa:bb:cc:dd:ee:ff';

		return m.render().then(function(mapEl) {
			var reconnectBtn = E('button', {
				'id': 'jlu-reconnect',
				'class': 'cbi-button cbi-button-action',
				'click': ui.createHandlerFn(this, 'handleReconnect')
			}, [ _('Reconnect') ]);

			var box = E('div', { 'class': 'cbi-section' }, [
				E('h3', {}, [ _('Service status') ]),
				E('div', { 'class': 'table' }, [
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left' }, [ _('Connection state') ]),
						E('div', { 'class': 'td left', 'id': 'jlu-status-state' }, [ '-' ])
					]),
					E('div', { 'class': 'tr' }, [
						E('div', { 'class': 'td left' }, [ _('Last error') ]),
						E('div', { 'class': 'td left', 'id': 'jlu-status-err' }, [ '-' ])
					])
				]),
				E('div', { 'class': 'cbi-page-actions' }, [
					E('button', {
						'class': 'cbi-button cbi-button-positive',
						'click': ui.createHandlerFn(this, function(ev) {
							var btn = ev.currentTarget;
							btn.disabled = true;
							return this.handleOneClick(m, ev).catch(function() {}).then(function() {
								btn.disabled = false;
							});
						})
					}, [ _('One-click setup') ]),
					' ',
					E('button', {
						'class': 'cbi-button cbi-button-negative',
						'click': ui.createHandlerFn(this, function(ev) { return this.handleRestore(m, ev); })
					}, [ _('One-click restore') ]),
					' ',
					reconnectBtn
				])
			]);

			/* 先问一次状态再放开「重连」按钮：守护进程没在跑时按钮保持禁用，
			 * 用户看到的是「服务未运行 + 原因」，而不是一串 RPC 报错。
			 * （与 hustNetworkLogin 的写法保持一致。） */
			reconnectBtn.disabled = true;
			this.refresh_status();
			poll.add(L.bind(this.refresh_status, this));

			/*
			 * 状态区必须放在 map 元素【外面】，所以这里返回一个容器把两者并排：
			 * 页脚的「保存 / 保存并应用 / 重置」最终都会走到 Map.save()/reset()，
			 * 而它们结尾必定调用 Map.renderContents()（form.js）—— 那里用
			 * dom.content(mapEl, null) 把 map 元素内部清空后重画。map 元素本身由
			 * this.root 复用、不会换，所以只有插在 map 【内部】的节点会被冲掉：
			 * 表现就是点完「保存并应用 / 一键配置 / 一键恢复」状态区和按钮突然消失，
			 * 刷新页面才回来。放进一个外层容器里就不会被清掉。
			 * （写法与 hustNetworkLogin 保持一致。）
			 */
			return E('div', {}, [ box, mapEl ]);
		}.bind(this));
	}
});
