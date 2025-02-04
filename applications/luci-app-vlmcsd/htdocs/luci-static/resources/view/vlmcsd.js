'use strict';
'require form';
'require poll';
'require rpc';
'require view';
'require fs';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('vlmcsd'), {}).then(function (res) {
		const status = {
			vlmcsd: res?.['vlmcsd']?.['instances']?.['vlmcsd']?.['running']
		};
		return status;
	});
}

function renderStatus(status) {
	const spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
	let renderHTML = [];

	for (let i in status) {
		const color = (status[i] === true) ? 'green' : 'red';
		const service = _('Vlmcsd KMS Server');
		const running = (status[i] === true) ? _('RUNNING') : _('NOT RUNNING');
		renderHTML.push(spanTemp.format(color, service, running));
	}

	return renderHTML;
}

return view.extend({
	render: function () {
		let m, s, o;

		m = new form.Map('vlmcsd', _('Vlmcsd KMS Server'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					const stats = renderStatus(res);
					const srvs = ['vlmcsd_status'];
					for (let i in srvs) {
						let view = document.getElementById(srvs[i]);
						view.innerHTML = stats[i];
					}
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
				E('p', { id: 'vlmcsd_status' }, _('Collecting data…'))
			]);
		}

		s = m.section(form.NamedSection, 'config', 'vlmcsd');
		s.tab('general', _('General Settings'));
		s.tab('config_file', _('Configuration File'), _('Edit the content of the /etc/vlmcsd.ini file.'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enable Vlmcsd Service'));
		o = s.taboption('general', form.Flag, 'auto_activate', _('Auto Activate'));
		o = s.taboption('general', form.Flag, 'internet_access', _('Allow Internet Access'));

		o = s.taboption('config_file', form.TextValue, '_tmpl',
			null,
			_("This is the content of the file '/etc/vlmcsd.ini', you can edit it here, usually no modification is needed."));
		o.rows = 20;
		o.cfgvalue = function (section_id) {
			return fs.trimmed('/etc/vlmcsd.ini');
		};
		o.write = function (section_id, formvalue) {
			return fs.write('/etc/vlmcsd.ini', formvalue.trim().replace(/\r\n/g, '\n') + '\n');
		};

		return m.render();
	}
});
