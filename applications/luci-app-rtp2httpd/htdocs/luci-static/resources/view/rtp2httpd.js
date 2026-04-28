// SPDX-License-Identifier: Apache-2.0

'use strict';
'require view';
'require form';
'require tools.widgets as widgets';

return view.extend({
	render() {
		let m, s, o;

		m = new form.Map('rtp2httpd', _('rtp2httpd'),
			_('Multicast RTP/RTSP to Unicast HTTP stream converter.'));

		s = m.section(form.TypedSection, 'instance');
		s.anonymous = true;
		s.addremove = true;
		s.addbtntitle = _('Add instance');

		s.tab('general', _('General settings'));

		o = s.taboption('general', form.Flag, 'enabled', _('Enable'));

		o = s.taboption('general', form.DynamicList, 'listen', _('Bind address'));
		o.datatype = 'ipaddrport(1)';
		o.rmempty = false;

		o = s.taboption('general', form.ListValue, 'verbose', _('Log level'),
			_('syslog severity level.'));
		o.value('0', _('Fatal'));
		o.value('1', _('Error'));
		o.value('2', _('Warn'));
		o.value('3', _('Info'));
		o.value('4', _('Debug'));
		o.default = '1';

		o = s.taboption('general', widgets.DeviceSelect, 'upstream_interface', _('Upstream interface'),
			_('Default interface for all upstream traffic.'));
		o.noaliases = true;
		o.nocreate = true;
		o.optional = true;

		o = s.taboption('general', form.Value, 'mcast_rejoin_interval', _('Multicast rejoin interval'),
			_('Periodic multicast rejoin interval in seconds.'));
		o.datatype = 'and(uinteger, range(0,86400))';
		o.placeholder = '0';

		o = s.taboption('general', form.Value, 'maxclients', _('Max clients'),
			_('Serve max N requests simultaneously.'));
		o.datatype = 'and(uinteger, range(1,5000))';
		o.placeholder = '5';

		o = s.taboption('general', form.Value, 'workers', _('Worker processes'),
			_('Number of worker processes with <code>SO_REUSEPORT</code>.'));
		o.datatype = 'and(uinteger, range(1,64))';
		o.placeholder = '1';

		o = s.taboption('general', form.Flag, 'zerocopy_on_send', _('Zero-copy on send'),
			_('Enable zero-copy send with <code>MSG_ZEROCOPY</code> for better performance.'));

		s.tab('web', _('Web settings'));

		o = s.taboption('web', form.Value, 'hostname', _('Hostname'),
			_('HTTP host header will be checked and must match this value to allow access when configured.'));
		o.datatype = 'host';

		o = s.taboption('web', form.Value, 'r2h_token', _('R2H token'),
			_('Authentication token for HTTP requests.'));

		o = s.taboption('web', form.Value, 'cors_allow_origin', _('CORS allowed origin'),
			_('Set <code>Access-Control-Allow-Origin</code> header to enable CORS.'));

		o = s.taboption('web', form.Flag, 'xff', _('Accept X-Forwarded-For header'),
			_('Use <code>X-Forwarded-For</code> header as client address, also accepts <code>X-Forwarded-Host</code> / <code>X-Forwarded-Proto</code> headers as the base URL for M3U playlist conversion.'));

		o = s.taboption('web', form.Value, 'external_m3u', _('External M3U playlist URL'),
			_('External M3U playlist URL (file://, http://, https:// supported).'));

		o = s.taboption('web', form.Value, 'external_m3u_update_interval', _('External M3U playlist update interval'),
			_('External M3U playlist update interval in seconds.'));
		o.datatype = 'uinteger';
		o.placeholder = '7200';
		o.depends({ 'external_m3u': '', '!reverse': true });

		o = s.taboption('web', form.Value, 'player_page_path', _('Player page path'),
			_('HTTP path for player UI.'));
		o.placeholder = '/player';

		o = s.taboption('web', form.Value, 'status_page_path', _('Status page path'),
			_('HTTP path for status UI.'));
		o.placeholder = '/status';

		s.tab('advanced', _('Advanced settings'));

		o = s.taboption('advanced', form.Flag, 'noudpxy', _('Disable udpxy compatibility'));

		o = s.taboption('advanced', widgets.DeviceSelect, 'upstream_interface_fcc', _('Upstream FCC interface'),
			_('Interface for FCC unicast traffic (overrides upstream interface).'));
		o.noaliases = true;
		o.nocreate = true;
		o.optional = true;

		o = s.taboption('advanced', widgets.DeviceSelect, 'upstream_interface_http', _('Upstream HTTP interface'),
			_('Interface for HTTP proxy upstream traffic (overrides upstream interface).'));
		o.noaliases = true;
		o.nocreate = true;
		o.optional = true;

		o = s.taboption('advanced', widgets.DeviceSelect, 'upstream_interface_multicast', _('Upstream multicast interface'),
			_('Interface for multicast traffic (overrides upstream interface).'));
		o.noaliases = true;
		o.nocreate = true;
		o.optional = true;

		o = s.taboption('advanced', widgets.DeviceSelect, 'upstream_interface_rtsp', _('Upstream RTSP interface'),
			_('Interface for RTSP unicast traffic (overrides upstream interface).'));
		o.noaliases = true;
		o.nocreate = true;
		o.optional = true;

		o = s.taboption('advanced', form.Value, 'fcc_listen_port_range', _('FCC listen port range'),
			_('Restrict FCC UDP listen sockets to specific ports.'));
		o.datatype = 'or(port,portrange)';

		o = s.taboption('advanced', form.Value, 'http_proxy_user_agent', _('HTTP proxy User-Agent'),
			_('Override the User-Agent header sent to upstream HTTP proxy requests.'));

		o = s.taboption('advanced', form.Value, 'rtsp_stun_server', _('RTSP STUN server'),
			_('STUN server for RTSP NAT traversal.'));
		o.datatype = 'or(host,hostport)';

		o = s.taboption('advanced', form.Value, 'rtsp_user_agent', _('RTSP User-Agent'),
			_('User-Agent header for upstream RTSP requests.'));

		o = s.taboption('advanced', form.Value, 'buffer_pool_max_size', _('Buffer pool max size'),
			_('Maximum number of buffers in zero-copy pool.'));
		o.datatype = 'and(uinteger, range(1024,1048576))';
		o.placeholder = '16384';

		o = s.taboption('advanced', form.Value, 'udp_rcvbuf_size', _('UDP receive buffer size'),
			_('UDP socket receive buffer size (in bytes) for multicast/FCC/RTSP.'));
		o.datatype = 'and(uinteger, range(65536,16777216))';
		o.placeholder = '524288';

		o = s.taboption('advanced', form.Flag, 'video_snapshot', _('Video snapshot'),
			_('Enable video snapshot feature. Clients can request snapshots with <code>snapshot=1</code> query parameter.'));

		o = s.taboption('advanced', form.Value, 'ffmpeg_path', _('FFmpeg path'),
			_('Path to FFmpeg executable.'));
		o.placeholder = 'ffmpeg';
		o.depends('video_snapshot', '1');

		o = s.taboption('advanced', form.Value, 'ffmpeg_args', _('FFmpeg arguments'),
			_('Additional FFmpeg arguments for snapshot generation.'));
		o.placeholder = '-hwaccel none';
		o.depends('video_snapshot', '1');

		return m.render();
	}
});
