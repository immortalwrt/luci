'use strict';
'require view';
'require form';
'require fs';
'require uci';
'require ui';

return view.extend({
	load: function () {
		return Promise.all([
			uci.load('ztewifi'),
			fs.exec('/usr/bin/ztewifi', [ 'wifi', 'status' ]).then(function (res) {
				try { return JSON.parse((res.stdout || '').trim()); }
				catch (e) { return { ok: false, message: (res.stderr || '').trim() }; }
			}).catch(function (e) {
				return { ok: false, message: (e && e.message) ? e.message : String(e) };
			})
		]);
	},

	render: function (data) {
		var m, s, o;
		var wifi = data[1] || {};
		var wifiOn = wifi.on === true;
		var wifiKnown = wifi.ok === true;

		var stateHtml = function (on) {
			return on
				? '<b style="color:#1a7f37">' + _('On') + '</b>'
				: '<b style="color:#c0392b">' + _('Off') + '</b>';
		};

		m = new form.Map('ztewifi', _('ZTE Portable WiFi Settings'),
			_('Configure the web UI address and login password of the portable WiFi. The app only reads status information through the built-in web API.') + '<br />' +
			_('The router itself is not modified.'));

		s = m.section(form.NamedSection, 'main', 'ztewifi', _('General Settings'));
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = '1';
		o.rmempty = false;
		o.description = _('When disabled, the overview panel and the status page stop collecting data.');

		o = s.option(form.Value, 'ip', _('Device IP address'));
		o.datatype = 'ip4addr';
		o.default = '192.168.0.1';
		o.placeholder = '192.168.0.1';
		o.rmempty = false;
		o.description = _('Web UI address of the portable WiFi, usually 192.168.0.1.');

		o = s.option(form.Value, 'password', _('Login password'));
		o.password = true;
		o.rmempty = false;
		o.description = _('Login password of the portable WiFi web UI (stored in plain text in /etc/config/ztewifi).');

		o = s.option(form.Value, 'interval', _('Status refresh interval'));
		o.datatype = 'uinteger';
		o.default = '5';
		o.rmempty = false;
		o.description = _('Unit: seconds.');

		o = s.option(form.Value, 'timeout', _('Request timeout'));
		o.datatype = 'uinteger';
		o.default = '8';
		o.optional = true;
		o.description = _('Unit: seconds. Increase it on slow networks.');

		o = s.option(form.Button, '_test', _('Connection test'));
		o.inputtitle = _('Save and test connection');
		o.inputstyle = 'apply';
		o.onclick = function (ev, section_id) {
			var map = this.map;
			return Promise.resolve(map.save()).then(function () {
				return fs.exec('/usr/bin/ztewifi', [ 'test' ]);
			}).then(function (res) {
				var out = {};
				try { out = JSON.parse((res.stdout || '').trim()); } catch (e) {}
				if (out.ok)
					ui.addNotification(null, E('p', {}, [
						_('Connected') + ': ' + (out.message || '') + '  (' + (out.elapsed || '-') + ')'
					]), 'info');
				else
					ui.addNotification(null, E('p', {}, [
						_('Connection failed') + ': ' + (out.message || (res.stderr || '').trim() || _('Unknown error'))
					]), 'error');
			}).catch(function (e) {
				ui.addNotification(null, E('p', {}, [
					_('Test failed') + ': ' + ((e && e.message) ? e.message : e)
				]), 'error');
			});
		};

		/* ---- Device control: acts on the portable WiFi directly, no UCI ---- */
		var btnClass = function (on) {
			return 'cbi-button cbi-button-' + (on ? 'reset important' : 'apply important');
		};

		var s2 = m.section(form.NamedSection, 'main', 'ztewifi', _('Device Control'));
		s2.anonymous = true;
		s2.description = _('Toggle the wireless radio of the portable WiFi itself. This does not change any router configuration and does not require "Save & Apply".');

		o = s2.option(form.DummyValue, '_wifi_state', _('Device WiFi'));
		o.rawhtml = true;
		o.cfgvalue = function () {
			if (!wifiKnown)
				return '<em>' + _('Read failed') + (wifi.message ? ': ' + wifi.message : '') + '</em>';
			return '<span id="ztewifi-wifi-state">' + stateHtml(wifiOn) + '</span>';
		};

		o = s2.option(form.Button, '_wifi_toggle', _('WiFi switch'));
		o.inputtitle = wifiOn ? _('Turn off') : _('Turn on');
		o.inputstyle = wifiOn ? 'reset important' : 'apply important';
		o.description = _('Same switch as the one in the portable WiFi web UI. The device needs a few seconds to apply it.');
		o.onclick = function (ev, section_id) {
			var btn = ev.currentTarget;
			var target = wifiOn ? 'off' : 'on';

			btn.disabled = true;
			return fs.exec('/usr/bin/ztewifi', [ 'wifi', target ]).then(function (res) {
				var out = {};
				try { out = JSON.parse((res.stdout || '').trim()); } catch (e) {}
				if (!out.ok)
					throw new Error(out.message || (res.stderr || '').trim() || _('Unknown error'));

				wifiOn = out.on === true;
				var el = document.getElementById('ztewifi-wifi-state');
				if (el) el.innerHTML = stateHtml(wifiOn);
				btn.firstChild.data = wifiOn ? _('Turn off') : _('Turn on');
				btn.setAttribute('class', btnClass(wifiOn));

				ui.addNotification(null, E('p', {}, [ out.message || _('Done') ]), 'info');
			}).catch(function (e) {
				ui.addNotification(null, E('p', {}, [
					_('Operation failed') + ': ' + ((e && e.message) ? e.message : e)
				]), 'error');
			}).finally(function () {
				btn.disabled = false;
			});
		};

		return m.render();
	}
});
