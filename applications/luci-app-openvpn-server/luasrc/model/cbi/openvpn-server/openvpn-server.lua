
--require("luci.tools.webadmin")

mp = Map("openvpn", translate("OpenVPN Server"), translate("An easy config OpenVPN Server Web-UI"))

local NXFS = require "nixio.fs"

mp:section(SimpleSection).template = "openvpn/openvpn_status"

s = mp:section(TypedSection, "openvpn")
s.anonymous = true
s.addremove = false

s:tab("basic", translate("Base Setting"))
s:tab("control", translate("Connection Control"))
s:tab("push", translate("Push Settings"))
s:tab("cert", translate("Certificate Files"))
s:tab("debug", translate("Log and Debug"))

o = s:taboption("basic", Flag, "enabled", translate("Enable"))

proto = s:taboption("basic", Value, "proto", translate("Proto"))
proto:value("tcp4", translate("TCP Server IPv4"))
proto:value("udp4", translate("UDP Server IPv4"))
proto:value("tcp6", translate("TCP Server IPv6"))
proto:value("udp6", translate("UDP Server IPv6"))

port = s:taboption("basic", Value, "port", translate("Port"))
port.datatype = "range(1, 65535)"

ddns = s:taboption("basic", Value, "ddns", translate("WAN DDNS or IP"))
ddns.datatype = "string"
ddns.default = "exmple.com"
ddns.rmempty = false

localnet = s:taboption("basic", Value, "server", translate("Client Network"))
localnet.datatype = "string"
localnet.description = translate("VPN Client Network IP with subnet")

max_clients = s:taboption("basic", Value, "max_clients", translate("Max Clients"))
max_clients.datatype = "uinteger"
max_clients.description = translate("Allow maximum connected clients")
function max_clients.validate(self, value)
	local num = tonumber(value)

	if num and num > 0 and math.floor(num) == num then
		return tostring(num)
	end

	return nil, translate("Please enter a positive integer")
end

duplicate_cn = s:taboption("basic", Flag, "duplicate_cn", translate("Allow duplicate certificate login"))
duplicate_cn.description = translate("Allow multiple clients to connect using the same certificate")

client_to_client = s:taboption("control", Flag, "client_to_client", translate("Allow client-to-client traffic"))

comp_lzo = s:taboption("control", ListValue, "comp_lzo", translate("Enable LZO compression"))
comp_lzo:value("yes", "yes")
comp_lzo:value("no", "no")
comp_lzo:value("adaptive", "adaptive")

keepalive = s:taboption("control", Value, "keepalive", translate("Keepalive"))
keepalive.datatype = "string"
keepalive.description = translate("Helper directive to simplify the expression of ping and ping-restart")

topology = s:taboption("control", ListValue, "topology", translate("Topology"))
topology:value("subnet", "subnet")
topology:value("net30", "net30")
topology:value("p2p", "p2p")

redirect_gateway = s:taboption("control", ListValue, "redirect_gateway", translate("Automatically redirect default route"))
redirect_gateway:value("", "-- remove --")
redirect_gateway:value("local", "local")
redirect_gateway:value("def1", "def1")
redirect_gateway:value("local def1", "local def1")

persist_key = s:taboption("control", Flag, "persist_key", translate("Persist key"))
persist_tun = s:taboption("control", Flag, "persist_tun", translate("Persist tun"))

user = s:taboption("control", Value, "user", translate("User"))
group = s:taboption("control", Value, "group", translate("Group"))

list = s:taboption("push", DynamicList, "push")
list.title = translate("Client Settings")
list.datatype = "string"
list.description = translate("Set route 192.168.0.0 255.255.255.0 and dhcp-option DNS 192.168.0.1 base on your router")

local upload_targets = {
	ca = "/etc/openvpn/pki/ca.crt",
	dh = "/etc/openvpn/pki/dh.pem",
	cert = "/etc/openvpn/pki/server.crt",
	key = "/etc/openvpn/pki/server.key"
}

local function copy_uploaded_file(source, target)
	if not source or source == "" then
		return true
	end

	NXFS.mkdirr(target:match("(.+)/[^/]+$"))

	local input = nixio.open(source, "r")
	if not input then
		return nil, translate("Unable to read uploaded file")
	end

	local output = nixio.open(target, "w")
	if not output then
		input:close()
		return nil, translate("Unable to write target file")
	end

	while true do
		local chunk = input:read(nixio.const.buffersize)
		if not chunk or #chunk == 0 then
			break
		end
		output:write(chunk)
	end

	input:close()
	output:close()
	return true
end

local function add_fixed_upload(option, title, description)
	local o = s:taboption("cert", FileUpload, option, title)
	o.root_directory = "/etc/openvpn/pki"
	o.initial_directory = "/etc/openvpn/pki"
	o.description = description

	function o.cfgvalue(self, section)
		return upload_targets[option]
	end

	function o.formvalue(self, section)
		local value = FileUpload.formvalue(self, section)
		return value ~= "" and value or nil
	end

	function o.write(self, section, value)
		local target = upload_targets[option]

		if value and value ~= "" and value ~= target then
			local ok, err = copy_uploaded_file(value, target)
			if ok == nil then
				self:add_error(section, "invalid", err)
				return
			end
		end

		self.map.uci:set("openvpn", section, option, target)
	end

	return o
end

ca = add_fixed_upload("ca", translate("CA certificate"), translate("Upload and overwrite /etc/openvpn/pki/ca.crt"))
dh = add_fixed_upload("dh", translate("Diffie-Hellman parameters"), translate("Upload and overwrite /etc/openvpn/pki/dh.pem"))
cert = add_fixed_upload("cert", translate("Server certificate"), translate("Upload and overwrite /etc/openvpn/pki/server.crt"))
key = add_fixed_upload("key", translate("Server private key"), translate("Upload and overwrite /etc/openvpn/pki/server.key"))

verb = s:taboption("debug", ListValue, "verb", translate("Set output verbosity"))
for i = 0, 11 do
	verb:value(tostring(i))
end

status = s:taboption("debug", Value, "status", translate("Status file"))
log = s:taboption("debug", Value, "log", translate("Log file"))

local o
o = s:taboption("basic", Button, "certificate", translate("OpenVPN Client config file"))
o.inputtitle = translate("Download .ovpn file")
o.description = translate("If you are using IOS client, please download this .ovpn file and send it via QQ or Email to your IOS device")
o.inputstyle = "reload"
o.write = function()
	luci.sys.call("sh /etc/openvpn/genovpn.sh 2>&1 >/dev/null")
	Download()
end

local o
o = s:taboption("basic", Button, "renew_certificate", translate("Renew OpenVPN certificate files"))
o.inputtitle = translate("Renew")
o.inputstyle = "reload"
o.write = function()
	luci.sys.call("sh /etc/openvpn/renewcert.sh 2>&1 >/dev/null &")
end

s:tab("code", translate("Special Code"))

local conf = "/etc/openvpn-addon.conf"
o = s:taboption("code", TextValue, "conf")
o.description = translate("(!)Special Code you know that add in to client .ovpn file")
o.rows = 13
o.wrap = "off"
o.cfgvalue = function(self, section)
	return NXFS.readfile(conf) or ""
end
o.write = function(self, section, value)
	NXFS.writefile(conf, value:gsub("\r\n", "\n"))
end

local pid = luci.util.exec("/usr/bin/pgrep openvpn")

function openvpn_process_status()
	local status = "OpenVPN is not running now "

	if pid ~= "" then
		status = "OpenVPN is running with the PID " .. pid .. ""
	end

	local status = { status=status }
	local table = { pid=status }
	return table
end

function Download()
	local t,e
	t=nixio.open("/tmp/my.ovpn","r")
	luci.http.header('Content-Disposition','attachment; filename="my.ovpn"')
	luci.http.prepare_content("application/octet-stream")
	while true do
		e=t:read(nixio.const.buffersize)
		if(not e)or(#e==0)then
			break
		else
			luci.http.write(e)
		end
	end
	t:close()
	luci.http.close()
end

local function shellquote(value)
	return "'" .. tostring(value):gsub("'", "'\\''") .. "'"
end

local sync_options = {
	enabled = "disabled",
	proto = "ovpnproto",
	port = "port",
	dev = "dev",
	topology = "topology",
	server = "server",
	comp_lzo = "comp_lzo",
	ca = "ca",
	dh = "dh",
	cert = "cert",
	key = "key",
	persist_key = "persist_key",
	persist_tun = "persist_tun",
	user = "user",
	group = "group",
	max_clients = "max_clients",
	duplicate_cn = "duplicate_cn",
	client_to_client = "client_to_client",
	redirect_gateway = "redirect_gateway",
	keepalive = "keepalive",
	verb = "verb",
	status = "status",
	log = "log",
	push = "push"
}

local function write_uci_option(uci, config, section, option, value)
	if type(value) == "table" then
		uci:set_list(config, section, option, value)
	elseif value ~= nil and value ~= "" then
		uci:set(config, section, option, value)
	else
		uci:delete(config, section, option)
	end
end

local function get_network_sync_value(uci, section, option)
	if option == "enabled" then
		return uci:get("openvpn", section, option) == "1" and "0" or "1"
	end

	return uci:get("openvpn", section, option)
end

local function sync_network_openvpn_options(uci, section)
	if uci:get("network", section, "proto") ~= "openvpn" then
		return false, false
	end

	uci:delete("network", section, "enabled")
	uci:delete("network", section, "ddns")

	for source_option, network_option in pairs(sync_options) do
		write_uci_option(
			uci,
			"network",
			section,
			network_option,
			get_network_sync_value(uci, section, source_option)
		)
	end

	uci:commit("network")
	return true, uci:get("openvpn", section, "enabled") == "1"
end

function mp.on_after_commit(self)
	local uci = require("luci.model.uci").cursor()

	uci:foreach("openvpn", "openvpn", function(section)
		local name = section[".name"]
		local port = uci:get("openvpn", name, "port")
		local network_synced, network_enabled = sync_network_openvpn_options(uci, name)

		if port ~= nil and port ~= "" then
			uci:set("firewall", "openvpn", "dest_port", port)
			uci:commit("firewall")
			os.execute("/etc/init.d/firewall restart")
		end

		if network_synced then
			if network_enabled then
				os.execute("ifdown " .. shellquote(name) .. " >/dev/null 2>&1; ifup " .. shellquote(name) .. " >/dev/null 2>&1")
			else
				os.execute("ifdown " .. shellquote(name) .. " >/dev/null 2>&1")
			end
		end
	end)

	if NXFS.access("/etc/init.d/openvpn") then
		os.execute("/etc/init.d/openvpn restart")
	end
end

return mp
