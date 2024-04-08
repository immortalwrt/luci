'use strict';
'require view';
'require form';
'require fs';

return view.extend({
		render: function(data) {
					var m, s, o;
					var mac;
					m = new form.Map('etherwake', _('WakeUp On Lan'),
									_('WakeUp On Lan'));
					s = m.section(form.GridSection, 'target');
					s.nodescriptions = true;
					s.anonymous = true;
					s.addremove = true;

					o = s.option(form.Value, 'name', _('Name'),
									_('the Name of device'));

					mac = s.option(form.Value, 'mac', _('MAC'), _('the MAC of device'));

					o = s.option(form.Button, '_apply', _('WakeUp'));
					o.editable = true;
					o.modalonly = false;
					o.inputstyle = 'apply';
					o.onclick = function(ev, section_id) {
						var val=mac.cfgvalue(section_id);
						return fs.exec('/usr/bin/etherwake',['-D','-i','br-lan',val]
						).then(function(res){alert(res.stdout+res.stderr)})
						
							 .catch(function(err) {alert(err)});
					}
					return m.render();
				},

});
