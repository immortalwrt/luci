'use strict';
'require form';
'require fs';
'require rpc';
'require uci';
'require ui';
'require view';

const callSystemInfo = rpc.declare({
	object: 'system',
	method: 'info'
});

const callRemoveArgon = rpc.declare({
	object: 'luci.argon',
	method: 'remove',
	params: ['filename'],
	expect: { '': {} }
});

const callRenameArgon = rpc.declare({
	object: 'luci.argon',
	method: 'rename',
	params: ['newname'],
	expect: { '': {} }
});

const bg_path = '/www/luci-static/argon/background/';

const trans_set = [0, 0.1, 0.2, 0.3, 0.4,
	0.5, 0.6, 0.7, 0.8, 0.9, 1 ];

return view.extend({
	load() {
		return Promise.all([
			uci.load('argon'),
			L.resolveDefault(callSystemInfo(), {}),
			L.resolveDefault(fs.list(bg_path), {})
		]);
	},

	render(data) {
		let m, s, o;

		m = new form.Map('argon', _('Argon theme configuration'),
			_('Here you can set the blur and transparency of the login page of argon theme, and manage the background pictures and videos. Chrome is recommended.'));

		s = m.section(form.TypedSection, 'global', _('Theme configuration'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.ListValue, 'online_wallpaper', _('Wallpaper source'));
		o.value('none', _('Built-in'));
		o.value('bing', _('Bing'));
		o.value('ghser', _('GHSer'));
		o.value('unsplash', _('Unsplash'));
		o.value('wallhaven', _('Wallhaven'));
		o.default = 'bing';
		o.rmempty = false;
        o.cfgvalue = function(section_id) {
            let value = uci.get('argon', section_id, 'online_wallpaper');
            if (!value) return 'bing';
            // 分割存储的值，返回wallpaper来源
            return value.split('_')[0];
        }
        o.write = function(section_id, value) {
            // 获取collection_id的值
            let collectionId = this.map.lookupOption('collection_id', section_id)[0].formvalue(section_id);
            // 如果有collection_id，则合并存储
            if (collectionId && (value === 'unsplash' || value === 'wallhaven')) {
                value = value + '_' + collectionId;
            }
            uci.set('argon', section_id, 'online_wallpaper', value);
        }

		o = s.option(form.Value, 'collection_id', _('Collection ID'), _('Collection ID for Unsplash or Wallhaven.'));
		o.depends('online_wallpaper', 'unsplash');
		o.depends('online_wallpaper', 'wallhaven');
        o.datatype = 'uinteger';
        o.rmempty = true;
        o.cfgvalue = function(section_id) {
            let value = uci.get('argon', section_id, 'online_wallpaper');
            if (!value || !value.includes('_')) return '';
            // 分割存储的值，返回collection_id
            return value.split('_')[1];
        }
        o.write = function(section_id, value) {
            // 获取online_wallpaper的值
            let online_wallpaper = this.map.lookupOption('online_wallpaper', section_id)[0].formvalue(section_id);
            // 如果有collection_id，则合并存储
            if (value && (online_wallpaper === 'unsplash' || online_wallpaper === 'wallhaven')) {
                online_wallpaper = online_wallpaper + '_' + value;
            }
            uci.set('argon', section_id, 'online_wallpaper', online_wallpaper);
        }

		o = s.option(form.Value, 'use_api_key', _('API key'), _('Specify API key for Unsplash or Wallhaven.'));
		o.depends('online_wallpaper', 'unsplash');
		o.depends('online_wallpaper', 'wallhaven');

		o = s.option(form.ListValue, 'use_exact_resolution', _('Resolutions Tag'),
            _('Use exact resolution or atleast 1080P for Wallhaven.'));
		o.value('0', _('Atleast'));
		o.value('1', _('Exact'));
		o.default = '1';
        o.depends('online_wallpaper', 'wallhaven');
		o.rmempty = true;

		o = s.option(form.ListValue, 'mode', _('Theme mode'));
		o.value('normal', _('Follow system'));
		o.value('light', _('Light mode'));
		o.value('dark', _('Dark mode'));
		o.default = 'normal';
		o.rmempty = false;

		o = s.option(form.Value, 'primary', _('[Light mode] Primary Color'), _('A HEX color (default: #5e72e4).'))
		o.default = '#5e72e4';
		o.rmempty = false;
		o.validate = function(section_id, value) {
			if (section_id)
				return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value) ||
					_('Expecting: %s').format(_('valid HEX color value'));
			return true;
		}

		o = s.option(form.ListValue, 'transparency', _('[Light mode] Transparency'),
			_('0 transparent - 1 opaque (suggest: transparent: 0 or translucent preset: 0.5).'));
		for (let i of trans_set)
			o.value(i);
		o.default = '0.5';
		o.rmempty = false;

		o = s.option(form.Value, 'blur', _('[Light mode] Frosted Glass Radius'),
			_('Larger value will more blurred (suggest: clear: 1 or blur preset: 10).'));
		o.datatype = 'ufloat';
		o.default = '10';
		o.rmempty = false;

		o = s.option(form.Value, 'dark_primary', _('[Dark mode] Primary Color'),
			_('A HEX Color (default: #483d8b).'))
		o.default = '#483d8b';
		o.rmempty = false;
		o.validate = function(section_id, value) {
			if (section_id)
				return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value) ||
					_('Expecting: %s').format(_('valid HEX color value'));
			return true;
		}

		o = s.option(form.ListValue, 'transparency_dark', _('[Dark mode] Transparency'),
			_('0 transparent - 1 opaque (suggest: black translucent preset: 0.5).'));
		for (let i of trans_set)
			o.value(i);
		o.default = '0.5';
		o.rmempty = false;

		o = s.option(form.Value, 'blur_dark', _('[Dark mode] Frosted Glass Radius'),
			_('Larger value will more blurred (suggest: clear: 1 or blur preset: 10).'))
		o.datatype = 'ufloat';
		o.default = '10';
		o.rmempty = false;

		o = s.option(form.Button, '_save', _('Save settings'));
		o.inputstyle = 'apply';
		o.inputtitle = _('Save current settings');
		o.onclick = function() {
			ui.changes.apply(true);
			return this.map.save(null, true);
		}

		s = m.section(form.TypedSection, null, _('Upload background (available space: %1024.2mB)')
			.format(data[1].root.avail * 1024),
			_('You can upload files such as gif/jpg/mp4/png/webm/webp files, to change the login page background.'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.Button, '_upload_bg', _('Upload background'),
			_('Files will be uploaded to <code>%s</code>.').format(bg_path));
		o.inputstyle = 'action';
		o.inputtitle = _('Upload...');
		o.onclick = function(ev, section_id) {
			let file = '/tmp/argon_background.tmp';
			return ui.uploadFile(file, ev.target).then(function(res) {
				return L.resolveDefault(callRenameArgon(res.name), {}).then(function(ret) {
					if (ret.result === 0)
						return location.reload();
					else {
						ui.addNotification(null, E('p', _('Failed to upload file: %s.').format(res.name)));
						return L.resolveDefault(fs.remove(file), {});
					}
				});
			})
			.catch(function(e) { ui.addNotification(null, E('p', e.message)); });
		};
		o.modalonly = true;

		s = m.section(form.TableSection);
		s.render = function() {
			let tbl = E('table', { 'class': 'table cbi-section-table' },
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, [ _('Filename') ]),
					E('th', { 'class': 'th' }, [ _('Modified date') ]),
					E('th', { 'class': 'th' }, [ _('Size') ]),
					E('th', { 'class': 'th' }, [ _('Action') ])
				])
			);

			cbi_update_table(tbl, data[2].map(L.bind(function(file) {
				return [
					file.name,
					new Date(file.mtime * 1000).toLocaleString(),
					String.format('%1024.2mB', file.size),
					E('button', {
						'class': 'btn cbi-button cbi-button-remove',
						'click': ui.createHandlerFn(this, function() {
							return L.resolveDefault(callRemoveArgon(file.name), {})
							.then(function() { return location.reload(); });
						})
					}, [ _('Delete') ])
				];
			}, this)), E('em', _('No files found.')));

			return E('div', { 'class': 'cbi-map', 'id': 'cbi-filelist' }, [
				E('h3', _('Background file list')),
				tbl
			]);
		};

		return m.render();
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
