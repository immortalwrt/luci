#!/usr/bin/env ucode

// SPDX-License-Identifier: GPL-2.0-only
// Copyright (C) 2026 cocolight
//
// luci-app-liteportal backend.
//
// Loaded by rpcd-mod-ucode, this file provides the `luci.liteportal` ubus object:
//
//     luci.liteportal scan      -> { "lan_ip": "192.168.1.1", "ports": [ { "port": 80, "svc": "http", "web": true } ] }
//     luci.liteportal generate  -> { "ok": true, "title": "My Portal", "links": 2 }
//     luci.liteportal status    -> { "ok": true, "enabled": true, "reachable": true, "path": "/liteportal/", ... }
//     luci.liteportal upload    -> { "ok": true, "name": "bg.jpg" }
//     luci.liteportal rename    -> { "ok": true, "name": "new.jpg" }
//     luci.liteportal remove    -> { "ok": true, "name": "old.jpg", "references": 2 }
//
// The portal is NOT a service of its own: the page lives in the document root
// of the router's existing uhttpd, under a fixed sub-path, so there is no
// second daemon to start, supervise or ask for a port.
//
// Call it over ubus, from /etc/init.d/liteportal, the package post-install script or
// a shell:
//
//     ubus call luci.liteportal generate
//     ubus call luci.liteportal status
//
// It is deliberately a plugin AND NOTHING ELSE. rpcd does not set ARGV when it
// loads a script (uc_vm_execute() passes only the program), so a file that also
// tried to be a command line tool would touch an undefined ARGV at load time,
// rpcd would skip the whole script on the resulting error and the object would
// never register.

'use strict';

import { cursor } from 'uci';
import { chmod, error, mkdir, open, readfile, rename, stat, unlink, writefile } from 'fs';

const CONFIG = 'liteportal';

/*
 * The document root of the main uhttpd instance, with the portal in a
 * subdirectory of it. Serving the page from the server that is already running
 * is the whole point: a second uhttpd would be a second process for the same
 * handful of static files, and it needs a port of its own plus a firewall rule
 * to go with it. The cost is that the location is fixed - it has to sit inside
 * whatever `option home` the main instance was configured with, and the package
 * has no way to place it anywhere else.
 */
const WWW = '/www/liteportal';

/* The URL the page is reachable at, relative to the server root. Every asset
 * path handed to the browser is prefixed with it - without the prefix a
 * document-root relative "/bg/x.jpg" would resolve against the main root and
 * 404, because the portal is not served from the root. */
const URL_BASE = '/liteportal';

const ICON_DIR = WWW + '/icons';
const BG_DIR = WWW + '/bg';

/* The configuration of the server that serves the portal. It is read here, in
 * the backend, because that is where the uci cursor is unrestricted: the LuCI
 * views deliberately have no access to it. */
const UHTTPD = 'uhttpd';

/*
 * Where the browser drops a cgi-upload before the backend moves it into place.
 * The final name is decided server side, so this is the only path a request can
 * ever write to.
 */
const TMP_UPLOAD = '/tmp/liteportal_upload.tmp';

/* Matches the limit the Assets page enforces, so a hand crafted request is
 * rejected the same way the UI rejects one. */
const MAX_UPLOAD = 2 * 1024 * 1024;

/* Well known router services, kept in sync with the previous release.
 * Note that ucode object keys must be quoted - bare numbers are a syntax error. */
const SVC = {
	'22': 'ssh', '53': 'dns', '80': 'http', '443': 'https',
	'3000': 'http-alt', '5000': 'http-alt', '5053': 'dns', '8000': 'http',
	'8080': 'http-alt', '8081': 'http-alt', '8123': 'http', '8181': 'http',
	'8384': 'syncthing', '8443': 'https-alt', '8888': 'http', '9000': 'http',
	'9090': 'cockpit', '6888': 'http', '1194': 'openvpn', '51820': 'wireguard'
};

/* Services a browser cannot open. These are dropped from the scan result
 * outright - a bookmark to port 22 or 53 is never what the user meant.
 * Note that ucode object keys must be quoted, bare numbers are a syntax error. */
const NOT_WEB = {
	'ssh': true, 'dns': true, 'syncthing': true, 'openvpn': true, 'wireguard': true
};

/*
 * Services that do answer HTTP. Anything in neither table is reported as
 * 'unknown' rather than guessed at: a port number carries no protocol
 * semantics, so 7890 may be a proxy or an arbitrary TCP service, and 1053 is
 * mDNS rather than a web server. The UI turns those into an explicit
 * "add them anyway" prompt instead of either dropping or guessing.
 */
const IS_WEB = {
	'http': true, 'https': true, 'http-alt': true, 'https-alt': true, 'cockpit': true
};

/* Ports that are certainly not web servers even though /etc/services has no
 * entry for them. Without this an mDNS responder on 5353 shows up as a
 * bookmark target. */
const NOT_WEB_PORTS = {
	'67': true, '68': true, '123': true, '137': true, '138': true,
	'139': true, '1900': true, '5353': true
};

/* Addresses whose listeners are reachable from the LAN. */
const ADDR_ANY4 = '00000000';
const ADDR_ANY6 = '00000000000000000000000000000000';

/* --------------------------------------------------------------- helpers -- */

/*
 * Return the options of the first section of the given type, with the
 * bookkeeping keys (`.name`, `.type`, `.anonymous`) filtered out.
 */
function first_section(uci, type) {
	let options = {};

	uci.foreach(CONFIG, type, (section) => {
		const collected = {};

		for (let key, value in section)
			if (index(key, '.') != 0)
				collected[key] = value;

		options = collected;

		return false; /* stop after the first section */
	});

	return options;
}

/*
 * The name of the first section of the given type, needed to address it in
 * uci.set() / uci.delete(). first_section() cannot be used for that because it
 * deliberately filters the `.name` key out of what it returns.
 */
function first_section_name(uci, type) {
	let name = null;

	uci.foreach(CONFIG, type, (section) => {
		name = section['.name'];
		return false;
	});

	return name;
}

function ensure_dir(path) {
	try {
		mkdir(path, 0o755);
	}
	catch (e) {
		/* Already present, or a path we cannot create - writing the file
		 * below will surface the real error. */
	}
}

/*
 * Map a stored asset option onto the URL the browser has to request.
 *
 * The result is an absolute path below URL_BASE, not below the server root: the
 * portal is served from /liteportal/, so "/bg/x.jpg" would be looked for in the
 * main document root and 404. Values arrive in three shapes - a bare name as
 * written by the previous Lua release, an absolute path as written by the
 * Assets page, and a server-root relative path from a hand edited config.
 */
function asset_path(value, subdir) {
	if (value == null || value == '')
		return '';

	if (index(value, WWW + '/') == 0)
		return URL_BASE + '/' + substr(value, length(WWW) + 1);

	if (index(value, '/') != 0)
		return URL_BASE + '/' + subdir + '/' + value;

	return URL_BASE + value;
}

/*
 * The inverse: the on-disk path a stored option refers to, used to find the
 * file again for renaming, deleting and versioning.
 */
function asset_file(value, subdir) {
	if (value == null || value == '')
		return null;

	if (index(value, '/') == 0)
		return (index(value, WWW + '/') == 0) ? value : null;

	return WWW + '/' + subdir + '/' + value;
}

/*
 * Asset names end up in a device path, so they are restricted to characters
 * that cannot escape the directory. Rejecting is preferred over sanitising:
 * silently rewriting a name the user typed is more surprising than refusing
 * it, and it keeps the stored value and the file name identical.
 *
 * The class is spelled out because ucode matches with POSIX ERE, where \w is
 * not a shorthand - it means the literal letter "w".
 */
function valid_name(name) {
	return (type(name) == 'string' && name != '' && match(name, /^[A-Za-z0-9_.\-]+$/) != null);
}

/* Resolve the `dir` argument of an asset method to a real directory. */
function asset_dir(dir) {
	if (dir == 'icons')
		return ICON_DIR;

	if (dir == 'bg')
		return BG_DIR;

	return null;
}

/*
 * Convert a dotted quad into the representation used by /proc/net/tcp: the
 * address is printed in host (little endian) byte order, so 192.168.1.1 shows
 * up as 0101A8C0, while the port that follows is big endian.
 */
function ip4_to_proc_hex(ip) {
	const parts = split(ip ?? '', /\./);

	if (length(parts) != 4)
		return null;

	const octets = [];

	for (let i = 0; i < 4; i++) {
		const octet = int(parts[i]);

		if (octet == null || octet < 0 || octet > 255)
			return null;

		push(octets, octet);
	}

	return sprintf('%02X%02X%02X%02X', octets[3], octets[2], octets[1], octets[0]);
}

/*
 * The LAN address the portal can be reached at.
 *
 * Two things about `ipaddr` are easy to get wrong and both were: it is written
 * in CIDR form on most configurations ("192.168.1.1/24"), which has to be
 * stripped before it is put into a URL, and some ucode builds hand a list value
 * back as an array, which a plain type check then rejects - the address came
 * back empty and the status page showed "unknown" for a portal that was up.
 */
function lan_ip() {
	const uci = cursor();

	uci.load('network');

	let ip = uci.get('network', 'lan', 'ipaddr');

	if (type(ip) == 'array')
		ip = ip[0];

	if (type(ip) != 'string')
		return '';

	return split(ip, '/')[0];
}

/* ----------------------------------------------------------- port scanning -- */

/*
 * Collect the TCP ports listening on a locally reachable address.
 *
 * /proc is parsed instead of probing with `nc`, so there is neither an extra
 * dependency nor a per-port timeout. A port is reported when it is in LISTEN
 * state and bound to the IPv4 wildcard, the IPv6 dual stack wildcard or the
 * LAN address - loopback only services are skipped on purpose, as they cannot
 * be reached through a bookmark pointing at the router address.
 */
function listening_ports(only) {
	const wanted = {};
	const hexlan = ip4_to_proc_hex(lan_ip());

	if (type(only) == 'array')
		for (let port in only)
			wanted[int(port)] = true;

	const found = {};

	for (let file in [ '/proc/net/tcp', '/proc/net/tcp6' ]) {
		let text;

		try {
			text = readfile(file);
		}
		catch (e) {
			continue; /* IPv6 disabled or /proc unavailable */
		}

		if (text == null)
			continue;

		for (let line in split(text, '\n')) {
			const fields = match(line,
				/^\s*\d+:\s+([0-9A-Fa-f]{8,32}):([0-9A-Fa-f]{4})\s+[0-9A-Fa-f]{8,32}:[0-9A-Fa-f]{4}\s+([0-9A-Fa-f]{2})\s/);

			if (fields == null || fields[3] != '0A')
				continue;

			const address = fields[1];
			const port = hex(fields[2]);

			if (address != ADDR_ANY4 && address != ADDR_ANY6 && address != hexlan)
				continue;

			if (length(wanted) > 0 && wanted[port] != true)
				continue;

			found[port] = true;
		}
	}

	const ports = keys(found);

	sort(ports, (a, b) => int(a) - int(b));

	return ports;
}

/* --------------------------------------------------------------- methods -- */

/*
 * The bookmark list as it should appear on the page. Both generate() and
 * status() report the same set, so the count shown in the UI cannot drift from
 * what was actually baked into links.json.
 */
function collect_links(uci) {
	const links = [];

	uci.foreach(CONFIG, 'link', (section) => {
		if (section.enabled == '0')
			return;

		const url = trim(section.url ?? '');

		if (url == '')
			return;

		push(links, {
			name: section.name ?? '',
			url: url,
			icon: asset_path(section.icon, 'icons') || (section.icon_url ?? '')
		});
	});

	return links;
}

/*
 * Every port the main uhttpd instance was told to listen on. There may be more
 * than one section and more than one `list` entry per section, and either
 * family may be absent, so this collects what is actually configured instead of
 * assuming the default 80/443 pair.
 */
function server_ports(uci) {
	const ports = {};

	uci.foreach(UHTTPD, 'uhttpd', (section) => {
		for (let key in [ 'listen_http', 'listen_https' ]) {
			let value = section[key];

			if (value == null)
				continue;

			if (type(value) != 'array')
				value = [ value ];

			for (let item in value) {
				/*
				 * Entries are written "addr:port", but a bare port means
				 * every address, so the colon is optional here.
				 */
				const port = match(item, /:?(\d+)$/);

				if (port != null)
					ports[int(port[1])] = true;
			}
		}
	});

	return ports;
}

/*
 * Whether the server that is supposed to serve the portal is actually up.
 *
 * This replaces the old pid hunt. With the page living in the main instance's
 * document root there is no portal process of our own to look for, and a pid
 * would not answer the question that matters anyway - whether the page can be
 * fetched. A listener on a configured port is the honest, passive stand-in: it
 * is what the socket table says, without reaching out over the loopback from
 * inside a synchronous ubus method, which would block every other LuCI page for
 * the length of the timeout.
 */
function server_is_listening(uci) {
	const wanted = server_ports(uci);

	for (let port in listening_ports(null))
		if (wanted[int(port)] == true)
			return true;

	return false;
}

/*
 * The two files that make the sub-path resolve: the entry point the browser
 * loads and the data it then fetches. Either one missing means /liteportal/ is not
 * serving a portal, whatever the configuration says.
 */
function is_published() {
	return (stat(WWW + '/index.html') != null) && (stat(WWW + '/links.json') != null);
}

/*
 * Runtime state of the portal, as shown on the settings page.
 *
 * The question the panel has to answer is "can it be reached", and with the page
 * served by somebody else's server that is not the same as "is our switch on".
 * Two conditions go into it - the files are in place (`published`) and the
 * server is listening on one of its ports (`server_listening`) - and
 * `reachable` is the pair of them. They are reported separately because each
 * failure has a different fix; telling those apart is what the running/pid pair
 * this replaces could never do.
 *
 * `enabled` stays the configuration switch, and stays a different question: a
 * portal the user deliberately switched off is not a fault, so the UI must not
 * paint it red. Absent means enabled, so configurations written before the
 * switch existed keep working.
 *
 * There is no `url` in the result any more. The browser composes the address
 * from its own origin plus `path`, and that origin is by construction the server
 * that is serving the page - a URL guessed from the LAN address and a port
 * number would be wrong behind a reverse proxy or on a non-standard port.
 */
function status() {
	const uci = cursor();

	uci.load(CONFIG);
	uci.load(UHTTPD);

	const general = first_section(uci, 'liteportal');
	const published = is_published();
	const server = server_is_listening(uci);
	const stamp = stat(WWW + '/links.json');

	return {
		ok: true,
		enabled: (general.enabled ?? '1') != '0',
		path: URL_BASE + '/',
		published: published,
		server_listening: server,
		reachable: published && server,
		links: length(collect_links(uci)),
		generated: stamp != null,
		generated_at: stamp?.mtime ?? null
	};
}

/*
 * The appearance options are percentages in uci - that is what the sliders
 * write - but the value is not trusted here: a hand-edited /etc/config/liteportal
 * never went through the form, and something like "90 %" or a stray word would
 * otherwise travel all the way into the stylesheet and quietly break the page.
 * Anything that does not parse falls back to the default, the rest is clamped
 * to 0..100.
 */
function percent(value, fallback) {
	if (value == null || value == '')
		return fallback;

	const n = +value;

	/* A failed conversion yields null; NaN is the only value that is not itself. */
	if (n == null || n != n)
		return fallback;

	return (n < 0) ? 0 : ((n > 100) ? 100 : n);
}

/*
 * The search engine chosen on the settings page, as a URL template.
 *
 * The engine list itself lives in the LuCI form, not here: the form is where
 * the user picks one, and a second copy of the list in the backend would be a
 * second chance to get it wrong. What is stored is either the template of a
 * preset (the form writes it verbatim) or the literal 'custom' plus a hand
 * written template in search_url.
 *
 * A missing or malformed template yields null, and generate() then ships the
 * page without a search box rather than sending the visitor's keywords to an
 * engine nobody chose. Form validation catches a bad template on save; this is
 * the fallback for a hand edited config, and it is the same expression the
 * form uses so the two gates cannot disagree.
 */
function search_template(general) {
	const picked = general.search_engine ?? '';

	if (picked == '')
		return null;

	const tpl = trim((picked == 'custom') ? (general.search_url ?? '') : picked);

	return (match(tpl, /^https?:\/\/[^ \t]+%s/) != null) ? tpl : null;
}

/*
 * Bake WWW/links.json from the uci configuration. The served page is static, so
 * the bookmarks are turned into a plain JSON document that the frontend fetches
 * from the same sub-path it was served from.
 */
function generate() {
	const uci = cursor();

	uci.load(CONFIG);

	const general = first_section(uci, 'liteportal');

	/*
	 * Search is baked only when it is usable - the switch on and a template
	 * that validates - and null otherwise. The frontend builds the form from
	 * the template alone, so the engine list stays in one place (the LuCI
	 * form) and the page holds no engine knowledge of its own.
	 */
	const search = ((general.search_enabled ?? '0') != '0') ? search_template(general) : null;

	const data = {
		title: general.title ?? 'Portal',
		background: '',
		background_v: '',
		/*
		 * Appearance, straight from uci as percentages. The frontend turns them
		 * into CSS custom properties; 78/0/45 are the values liteportal.css used to
		 * hard-code, so a configuration written before these options existed
		 * keeps rendering exactly as it did.
		 */
		bg_veil: percent(general.bg_veil, 78),
		bg_blur: percent(general.bg_blur, 0),
		card_transparency: percent(general.card_transparency, 45),
		search: (search != null) ? { template: search } : null,
		links: collect_links(uci)
	};

	/*
	 * The image takes precedence over the plain colour, so the file is
	 * consulted first - and a configured-but-missing file must not be handed
	 * to the browser as if it were there. It used to be: stat() below only
	 * left background_v empty, while data.background kept pointing at the
	 * gone file, so the page rendered its solid fallback colour with no hint
	 * that anything was wrong. The Assets page, which lists the directory
	 * itself, showed nothing - the two views disagreed and the user had no
	 * way to tell that the background had silently stopped existing.
	 *
	 * Falling back to `background` when the file is gone makes the page say
	 * what it is actually showing, and matches what the settings page reports.
	 */
	const bgfile = asset_file(general.background_file, 'bg');
	const bginfo = (bgfile != null) ? stat(bgfile) : null;

	if (bginfo != null) {
		data.background = asset_path(general.background_file, 'bg');

		/*
		 * Replacing the background keeps the URL unchanged, so the browser would
		 * keep showing the cached copy. The file's modification time rides
		 * along as a cache buster and makes a plain reload pick up the new
		 * image.
		 *
		 * The size is part of the version on purpose. mtime has one second
		 * resolution, and an upload renames a freshly written file into place,
		 * which preserves that file's own timestamp - so two changes within
		 * the same second would otherwise share a version. Including the size
		 * covers the common case (a different picture), and the pair is still
		 * a short token in the URL.
		 */
		data.background_v = sprintf('%d-%d', bginfo.mtime, bginfo.size);
	}
	else if (general.background != null && general.background != '')
		data.background = general.background;

	ensure_dir(WWW);

	const fd = open(WWW + '/links.json', 'w', 0o644);

	if (fd == null)
		return { ok: false, error: 'unable to write ' + WWW + '/links.json' };

	fd.write(sprintf('%J', data));
	fd.close();

	/*
	 * The mode passed to open() is masked by the process umask, and rpcd
	 * inherits umask 077 from procd - so the file came out 0600 instead of
	 * 0644, and only the owner could read it. uhttpd runs as root today and
	 * reads it anyway, but the portal page then depends on that: as soon as
	 * the server is started as a non-root user, or the file is fetched by
	 * anything else, links.json answers 403 and the page silently shows no
	 * bookmarks at all.
	 *
	 * chmod() is not subject to the umask, so this is what actually pins the
	 * mode - the same thing the upload paths below do for the files they
	 * store.
	 */
	chmod(WWW + '/links.json', 0o644);

	return { ok: true, title: data.title, links: length(data.links) };
}

/*
 * Classify a listening port for the scan result.
 *
 * A port number says nothing about the protocol spoken on it, so this can only
 * report what is actually known: `false` for services a browser cannot open,
 * `true` for the ones it can, and the string 'unknown' for everything else.
 * The caller decides what to do with 'unknown' - guessing either way would be
 * wrong, since a self hosted service on an unusual port is perfectly valid.
 */
function classify_port(port) {
	const key = sprintf('%d', port);
	const svc = SVC[port] ?? '';

	if (NOT_WEB_PORTS[key] == true || NOT_WEB[svc] == true)
		return { web: false, svc: svc };

	if (IS_WEB[svc] == true)
		return { web: true, svc: svc };

	return { web: 'unknown', svc: svc };
}

/*
 * Report the locally reachable listening TCP services. The optional `ports`
 * array restricts the result to those ports.
 */
function scan(request) {
	const requested = (type(request) == 'object' && request != null) ? request.ports : null;
	const result = [];

	for (let key in listening_ports(requested)) {
		const port = int(key);
		const verdict = classify_port(port);

		push(result, { port: port, svc: verdict.svc, web: verdict.web });
	}

	return { lan_ip: lan_ip(), ports: result };
}

/* --------------------------------------------------------- asset handling -- */

/*
 * Read and validate the { dir, name } pair every asset method takes. Returns
 * either { dir: <path>, name: <file> } or { error: <message> }.
 */
function asset_target(request) {
	const body = (type(request) == 'object' && request != null) ? request : {};
	const dir = asset_dir(body.dir);

	if (dir == null)
		return { error: 'unknown asset directory' };

	if (!valid_name(body.name))
		return { error: 'invalid file name' };

	return { dir: dir, name: body.name };
}

/*
 * The errno text of the last failed fs operation, appended to a message.
 *
 * ucode keeps the reason in a slot that fs.error() clears as soon as it is
 * read, so this has to run immediately after the failure - another fs call in
 * between would overwrite it. Without the text every failure looks alike,
 * which is what made the cross-device rename below look like a mystery.
 */
function with_errno(message) {
	const reason = error();

	return (reason != null) ? message + ': ' + reason : message;
}

/*
 * Move an uploaded file from the temporary path into the asset directory.
 *
 * The browser can only write to TMP_UPLOAD, and the destination is resolved
 * here, which keeps the decision about where a file lands on the server.
 *
 * The bytes are copied rather than renamed into place: the upload lands in
 * /tmp, a tmpfs of its own, while the asset directories live on the overlay.
 * rename(2) cannot cross a mount and fails with EXDEV ("Cross-device link"),
 * which is what made every upload answer "unable to store the file". The
 * payload is capped at 2 MiB above, so copying it through memory is cheap.
 *
 * Named upload_asset() rather than upload() so it cannot be confused with the
 * rename() imported from fs - a local function of the same name would shadow
 * the import for the whole file.
 */
function upload_asset(request) {
	const target = asset_target(request);

	if (target.error != null)
		return { ok: false, error: target.error };

	const tmp = stat(TMP_UPLOAD);

	if (tmp == null)
		return { ok: false, error: 'no uploaded file found' };

	if ((tmp.size ?? 0) > MAX_UPLOAD) {
		unlink(TMP_UPLOAD);
		return { ok: false, error: 'file exceeds the 2 MiB limit' };
	}

	const dst = target.dir + '/' + target.name;

	if (stat(dst) != null)
		return { ok: false, error: 'a file of that name already exists' };

	ensure_dir(target.dir);

	const data = readfile(TMP_UPLOAD);

	if (data == null)
		return { ok: false, error: with_errno('unable to read the uploaded file') };

	if (writefile(dst, data) == null) {
		/* Read the reason before touching the filesystem again. */
		const reason = with_errno('unable to store the file');

		/* A half written file would block the retry as "already exists". */
		unlink(dst);

		return { ok: false, error: reason };
	}

	unlink(TMP_UPLOAD);

	chmod(dst, 0o644);

	return { ok: true, name: target.name };
}

/*
 * Drop every uci reference to a file that is about to disappear: the current
 * background and the icon of each bookmark using it. Leaving them behind would
 * point the portal at a file that no longer exists.
 */
function clear_references(uci, path) {
	let touched = 0;

	uci.foreach(CONFIG, 'liteportal', (section) => {
		if (section.background_file != path)
			return;

		uci.delete(CONFIG, section['.name'], 'background_file');
		touched++;
	});

	uci.foreach(CONFIG, 'link', (section) => {
		if (section.icon != path)
			return;

		uci.delete(CONFIG, section['.name'], 'icon');
		touched++;
	});

	return touched;
}

/*
 * Write the cursor's changes back to /etc/config/liteportal.
 *
 * commit(), not save(). rpcd hands a plugin a cursor with no session savedir,
 * so save() has nowhere to stage into and silently leaves the file untouched -
 * verified: set() + save() writes nothing, set() + commit() rewrites the file.
 * An asset operation is not something the user can undo by reverting a staged
 * change, so the result has to be on disk.
 */
function commit_references(uci) {
	return uci.commit(CONFIG) == true;
}

/* Remove an asset and clean up the references pointing at it. */
function remove_asset(request) {
	const target = asset_target(request);

	if (target.error != null)
		return { ok: false, error: target.error };

	const path = target.dir + '/' + target.name;

	if (stat(path) == null)
		return { ok: false, error: 'no such file' };

	const uci = cursor();

	uci.load(CONFIG);

	const references = clear_references(uci, path);

	/*
	 * Delete the file only after the references are known; a failed commit
	 * must not leave the configuration pointing at a file that is still there
	 * but no longer wanted - the safe order is to keep both or neither.
	 */
	if (references > 0 && !commit_references(uci))
		return { ok: false, error: 'unable to update the configuration' };

	if (unlink(path) != true)
		return { ok: false, error: 'unable to delete the file' };

	return { ok: true, name: target.name, references: references };
}

/*
 * Rename an asset in place. Going through rename(2) rather than a read and a
 * write is what makes this usable for the multi-megabyte backgrounds - there is
 * no size ceiling involved at all.
 *
 * A rename has to carry the references along with it, otherwise the background
 * or the bookmark icons would point at the old name.
 *
 * Named rename_asset() for the same reason as upload_asset().
 */
function rename_asset(request) {
	const body = (type(request) == 'object' && request != null) ? request : {};
	const target = asset_target(body);

	if (target.error != null)
		return { ok: false, error: target.error };

	if (!valid_name(body.new_name))
		return { ok: false, error: 'invalid file name' };

	if (body.new_name == target.name)
		return { ok: false, error: 'the name is unchanged' };

	const src = target.dir + '/' + target.name;
	const dst = target.dir + '/' + body.new_name;

	if (stat(src) == null)
		return { ok: false, error: 'no such file' };

	if (stat(dst) != null)
		return { ok: false, error: 'a file of that name already exists' };

	const uci = cursor();

	uci.load(CONFIG);

	/* Work out what has to follow the file before moving it, so a failed
	 * rename cannot leave the configuration naming a file that is gone. */
	const general = first_section_name(uci, 'liteportal');
	const follows = (general != null && uci.get(CONFIG, general, 'background_file') == src);
	const links = [];

	uci.foreach(CONFIG, 'link', (section) => {
		if (section.icon == src)
			push(links, section['.name']);
	});

	if (rename(src, dst) != true)
		return { ok: false, error: 'unable to rename the file' };

	chmod(dst, 0o644);

	/* Only touch the configuration when something actually refers to the old
	 * name - an unused icon should leave the config untouched. */
	if (follows)
		uci.set(CONFIG, general, 'background_file', dst);

	for (let i = 0; i < length(links); i++)
		uci.set(CONFIG, links[i], 'icon', dst);

	if ((follows || length(links) > 0) && !commit_references(uci)) {
		/* Put the file back so the configuration and the directory agree. */
		rename(dst, src);
		return { ok: false, error: 'unable to update the configuration' };
	}

	return { ok: true, name: body.new_name };
}

/*
 * The rpcd method signature.
 *
 * Every method that is called with named arguments has to declare them here.
 * rpcd derives the ubus argument policy from this `args` dictionary and rejects
 * a call carrying a name the dictionary does not list with
 * UBUS_STATUS_INVALID_ARGUMENT before the callback runs. A method without an
 * `args` entry therefore accepts no arguments at all - which is why upload(),
 * remove(), rename() and scan() used to come back as "Invalid argument" while
 * the view still reported success.
 *
 * The values are type hints, not defaults: rpcd only uses their ucode type to
 * build the policy (string below, an array for the port list), and the callback
 * reads whatever actually arrived from `request.args`.
 */
const methods = {
	generate: { call: () => generate() },
	scan: { args: { ports: [] }, call: (request) => scan(request?.args) },
	status: { call: () => status() },
	upload: { args: { dir: '', name: '' }, call: (request) => upload_asset(request?.args) },
	remove: { args: { dir: '', name: '' }, call: (request) => remove_asset(request?.args) },
	rename: { args: { dir: '', name: '', new_name: '' }, call: (request) => rename_asset(request?.args) }
};

return { 'luci.liteportal': methods };
