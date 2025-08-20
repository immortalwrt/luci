'use strict';
'require dom';
'require form';
'require fs';
'require ui';
'require uci';
'require view';

/*
	Copyright 2022-2025 Rafał Wabik - IceG - From eko.one.pl forum

	Licensed to the GNU General Public License v3.0.
*/

return view.extend({
	handleCommand: function(exec, args) {
		let buttons = document.querySelectorAll('.cbi-button');

		for (let i = 0; i < buttons.length; i++)
			buttons[i].setAttribute('disabled', 'true');

		return fs.exec(exec, args).then(function(res) {
			let out = document.querySelector('.smscommand-output');
			out.style.display = '';

			res.stdout = res.stdout?.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "") || '';
			res.stderr = res.stderr?.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "") || '';

	 		let cut = res.stdout;
			cut = cut.substr(0, 20);
			if ( cut == "sms sent sucessfully" ) {
        		res.stdout = _('SMS sent sucessfully');
			}

			dom.content(out, [ res.stdout || '', res.stderr || '' ]);

		}).catch(function(err) {
			ui.addNotification(null, E('p', [ err ]))
		}).finally(function() {
			for (let i = 0; i < buttons.length; i++)
			buttons[i].removeAttribute('disabled');
		});
	},

	handleGo: function(ev) {
		let phn = document.getElementById('phonenumber').value;
		let sections = uci.sections('sms_tool_js');
		let port = sections[0].sendport;
		let dx = sections[0].delay * 1000;
		let get_smstxt = document.getElementById('smstext').value;

		let elem = document.getElementById('execute');
		let vN = elem.innerText;

		if (vN.includes(_('Send to number')) == true)
		{
				if ( phn.length < 3 )
				{
					ui.addNotification(null, E('p', _('Please enter phone number')), 'info');
					return false;
				}
				else {
					if ( !port )
					{
						ui.addNotification(null, E('p', _('Please set the port for communication with the modem')), 'info');
						return false;
					}
					else {
						if ( get_smstxt.length < 1 )
						{
						    ui.addNotification(null, E('p', _('Please enter a message text')), 'info');
						    return false;
						}
						else {
						    // sms_tool -d /dev/ttyUSB1 send 48500500500 "MSG"
						    return this.handleCommand('sms_tool', [ '-d' , port , 'send' , phn , get_smstxt ]);
						}
					}
		        }
				if ( !port )
				{
					ui.addNotification(null, E('p', _('Please set the port for communication with the modem')), 'info');
					return false;
				}
		}
		else {

			if ( !port )
			{
			ui.addNotification(null, E('p', _('Please set the port for communication with the modem')), 'info');
			return false;
			}
			else {
			if ( get_smstxt.length < 1 )
				{
					ui.addNotification(null, E('p', _('Please enter a message text')), 'info');
					return false;
				}
				else {
				// sms_tool -d /dev/ttyUSB1 send 48500500500 "MSG"
				   		let xs = document.getElementById('pb');

    						let phone, i;
						    res.stdout = '';

							for (let i = 0; i < xs.length; i++) {
  								(function(i) {
    								setTimeout(function() {
		    						phone = xs.options[i].value;

									let out = document.querySelector('.smscommand-output');
									out.style.display = '';

									fs.exec_direct('/usr/bin/sms_tool', [ '-d' , port , 'send' , phone , get_smstxt ]);

									res.stdout += (i+1)+_('/')+xs.length+' * '+_('[Bot] Message sent to number:') + ' ' + phone +'\n';
									res.stdout = res.stdout.replace(/undefined/g, "");

									dom.content(out, [ res.stdout || '' ]);

									}, dx * i);
								})(i);
							}
				    }
			    }
		    }
	},

	handleClear: function(ev) {
		let out = document.querySelector('.smscommand-output');
		out.style.display = '';
		out.style.display = 'none';

		let ovc = document.getElementById('phonenumber');
		let ov2 = document.getElementById('smstext');
		ov2.value = '';

		document.getElementById('counter').innerHTML = '160';

		let prefixnum, sections = uci.sections('sms_tool_js');
		let addprefix = sections[0].prefix;
		if ( addprefix == '1' )
			{
			prefixnum = sections[0].pnumber;
			ovc.value = prefixnum;
			}
		else {
			ovc.value = '';
		}

		document.getElementById('phonenumber').focus();
	},

	handleCopy: function(ev) {
		let out = document.querySelector('.smscommand-output');
		out.style.display = 'none';

		let ov = document.getElementById('phonenumber');
		ov.value = '';
		let x = document.getElementById('pb').value;
		ov.value = x;
	},

	load: function() {
		return Promise.all([
			L.resolveDefault(fs.read_direct('/etc/modem/phonebook.user'), null),
			uci.load('sms_tool_js')
		]);
	},

	render: function (loadResults) {

	let group, prefixnum, sections = uci.sections('sms_tool_js');

	if ( sections[0].sendingroup == '1' )
		{
		group = 1;
	}
	else {
	group = '';
	}

	if ( sections[0].prefix == '1' ) {
		prefixnum = sections[0].pnumber;
	}
	if ( sections[0].information == '1' ) {
		ui.addNotification(null, E('p', _('The phone number should be preceded by the country prefix (for Poland it is 48, without +). If the number is 5, 4 or 3 characters, it is treated as.. short and should not be preceded by a country prefix.') ), 'info');
	}

		let info = _('User interface for sending messages using sms-tool. More information about the sms-tool on the %seko.one.pl forum%s.').format('<a href="https://eko.one.pl/?p=openwrt-sms_tool" target="_blank">', '</a>');

		return E('div', { 'class': 'cbi-map', 'id': 'map' }, [
				E('h2', {}, [ _('SMS Messages') ]),
				E('div', { 'class': 'cbi-map-descr'}, info),
				E('hr'),
				E('div', { 'class': 'cbi-section' }, [
					E('div', { 'class': 'cbi-section-node' }, [
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, [ _('User contacts') ]),
							E('div', { 'class': 'cbi-value-field' }, [
								E('select', { 'class': 'cbi-input-select',
										'id': 'pb',
										'style': 'margin:5px 0; width:100%;',
										'change': ui.createHandlerFn(this, 'handleCopy'),
										'mousedown': ui.createHandlerFn(this, 'handleCopy')
									    },
									(loadResults[0] || "").trim().split("\n").map(function(cmd) {
                                        let fields = cmd.split(/;/);
                                        let name = fields[0];
                                        let code = fields[1] || fields[0];
                                    return E('option', { 'value': code }, name );
                                    })
								)
							])
						]),
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, [ _('Send to') ]),
							E('div', { 'class': 'cbi-value-field' }, [
							E('input', {
								'style': 'margin:5px 0; width:100%;',
								'type': 'text',
								'id': 'phonenumber',
								'value': prefixnum,
								'oninput': "this.value = this.value.replace(/[^0-9.]/g, '');",
								'data-tooltip': _('Press [Delete] to delete the phone number'),
								'keydown': function(ev) {
									 if (ev.keyCode === 46)
										{
										let del = document.getElementById('phonenumber');
											if (del) {
												let ovc = document.getElementById('phonenumber');
												let prefixnum, sections = uci.sections('sms_tool_js');
												let addprefix = sections[0].prefix;
												if ( addprefix == '1' )
													{
													prefixnum = sections[0].pnumber;
													ovc.value = prefixnum;
													}
												else {
													ovc.value = '';
												}
												document.getElementById('phonenumber').focus();
											}
										}
								},
								}),
							])
						]),
						E('div', { 'class': 'cbi-value' }, [
							E('label', { 'class': 'cbi-value-title' }, [ _('Message text') ]),
							E('div', { 'class': 'cbi-value-field' }, [
							E('textarea', {
								'id': 'smstext',
								'style': 'width: 100%; resize: vertical; height:80px; max-height:80px; min-height:80px; min-width:100%;',
								'wrap': 'on',
								'rows': '3',
								'placeholder': _(''),
								'maxlength': '160',
								'data-tooltip': _('Press [Delete] to delete the content of the message'),
								'keydown': function(ev) {
									 if (ev.keyCode === 46)
										{
										let del = document.getElementById('smstext');
											if (del) {
												let ovtxt = document.getElementById('smstext');
												ovtxt.value = '';
												document.getElementById('smstext').focus();
											}
										}
								},
								'keyup': function(ev) {
										document.getElementById('counter').innerHTML = (160 - document.getElementById('smstext').value.length);

											    this.value = this.value.replace(/ą/g, 'a').replace(/Ą/g, 'A');
        										this.value = this.value.replace(/ć/g, 'c').replace(/Ć/g, 'C');
        										this.value = this.value.replace(/ę/g, 'e').replace(/Ę/g, 'E');
        										this.value = this.value.replace(/ł/g, 'l').replace(/Ł/g, 'L');
        										this.value = this.value.replace(/ń/g, 'n').replace(/Ń/g, 'N');
        										this.value = this.value.replace(/ó/g, 'o').replace(/Ó/g, 'O');
        										this.value = this.value.replace(/ś/g, 's').replace(/Ś/g, 'S');
        										this.value = this.value.replace(/ż/g, 'z').replace(/Ż/g, 'Z');
        										this.value = this.value.replace(/ź/g, 'z').replace(/Ź/g, 'Z');
									}
								}),
								E('div', { 'class': 'left' }, [
								E('br'),
								E('label', { 'id': 'counter' }, [ _('160') ])
								])
							]),
						]),

					])
				]),
				E('hr'),
				E('div', { 'class': 'right' }, [
					E('button', {
						'class': 'cbi-button cbi-button-remove',
						'id': 'clr',
						'click': ui.createHandlerFn(this, 'handleClear')
					}, [ _('Clear form') ]),
					'\xa0\xa0\xa0',
						E('span', { 'class': 'diag-action' }, [
							group ? new ui.ComboButton('send', {
								'send': '%s %s'.format(_('Send'), _('to number')),
								'sendg': '%s %s'.format(_('Send'), _('to group')),
							}, {
								'click': ui.createHandlerFn(this, 'handleGo'),
								'id': 'execute',
								'classes': {
									'send': 'cbi-button cbi-button-action important',
									'sendg': 'cbi-button cbi-button-action important',
								},
								'id': 'execute',
							}).render() : E('button', {
								'class': 'cbi-button cbi-button-action important',
								'id': 'execute',
								'click': ui.createHandlerFn(this, 'handleGo')
							}, [ _('Send to number') ]),
						]),
				]),
				E('p', _('Status')),
				E('pre', { 'class': 'smscommand-output', 'id': 'ans', 'style': 'display:none; border: 1px solid var(--border-color-medium); border-radius: 5px; font-family: monospace' }),
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
})
