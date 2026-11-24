local d = require "luci.dispatcher"
local sys = require "luci.sys"

m = Map("luci-app-openvpn-server", translate("OpenVPN Server"))
m.template = "openvpn-server/index"

s = m:section(NamedSection, "server", "server", "")
s.addremove = false
s.anonymous = true

s:tab("general",  translate("General Settings"))
s:tab("network", translate("Network Settings"))
s:tab("security", translate("Security Settings"))
s:tab("client", translate("Client Settings"))
s:tab("certificate", translate("Certificate"))

o = s:taboption("general", DummyValue, "_status", translate("Current Condition"))
o.template = "openvpn-server/status"
o.value = translate("Collecting data...")

o = s:taboption("general", Flag, "enabled", translate("Enabled"))
o.rmempty = false

o = s:taboption("general", Value, "port", translate("Port"))
o.datatype = "port"
o.default = "1194"
o.rmempty = false

o = s:taboption("general", ListValue, "proto", translate("Protocol"))
o.default = "udp"
o:value("tcp", "TCP")
o:value("udp", "UDP")
o.rmempty = false

if sys.call("command -v ip6tables > /dev/null") == 0 then
	o = s:taboption("general", Flag, "ipv6", translate("Listen IPv6"))
end

o = s:taboption("general", Value, "dev", translate("TUN device name"))
o.default = "ovpn_server"
o.placeholder = "ovpn_server"
o.datatype = "uciname"
o.rmempty = false

o = s:taboption("general", Value, "keepalive_interval", translate("Keepalive interval"))
o.default = "10"
o.placeholder = "10"
o.datatype = "uinteger"
o.rmempty = false

o = s:taboption("general", Value, "keepalive_timeout", translate("Keepalive timeout"))
o.default = "120"
o.placeholder = "120"
o.datatype = "uinteger"
o.rmempty = false

o = s:taboption("general", ListValue, "verb", translate("Log level"))
o.default = "3"
for i = 0, 9 do
	o:value(tostring(i), tostring(i))
end
o.rmempty = false

o = s:taboption("general", Value, "max_clients", translate("Max clients"))
o.placeholder = translate("Unlimited")
o.datatype = "uinteger"
o.rmempty = true

o = s:taboption("network", Value, "ip_segment", translate("IP segment"))
o.datatype = "ipaddr"
o.placeholder = "172.30.1.0"
o.default = o.placeholder
o.rmempty = false

o = s:taboption("network", Value, "subnet_mask", translate("Subnet mask"))
o.datatype = "ipaddr"
o.placeholder = "255.255.255.0"
o.default = o.placeholder
o.rmempty = false

o = s:taboption("network", Flag, "redirect_gateway", translate("Redirect gateway"))
o.default = "1"
o.rmempty = false

o = s:taboption("network", Flag, "client_to_client", translate("Client to client"))
o.default = "1"
o.rmempty = false

o = s:taboption("network", Flag, "masquerade", translate("NAT masquerade"))
o.default = "1"
o.rmempty = false

o = s:taboption("network", Flag, "allow_lan", translate("Allow access to LAN"))
o.default = "1"
o.rmempty = false

o = s:taboption("network", Value, "dns", translate("DNS server"))
o.datatype = "ipaddr"
o.placeholder = "172.30.1.1"
o.rmempty = true

o = s:taboption("network", Value, "dns2", translate("Secondary DNS server"))
o.datatype = "ipaddr"
o.placeholder = "8.8.8.8"
o.rmempty = true

o = s:taboption("network", Value, "dns_search", translate("DNS search domain"))
o.datatype = "hostname"
o.placeholder = "lan"
o.rmempty = true

o = s:taboption("network", DynamicList, "push_routes", translate("Push routes"))
o.placeholder = "192.168.1.0/24"
o.datatype = "ipmask4"
o.rmempty = true

o = s:taboption("security", ListValue, "auth_method", translate("Authentication method"))
o.default = "password"
o:value("password", translate("Username and password"))
o:value("cert_password", translate("Client certificate and password"))
o:value("certificate", translate("Client certificate only"))
o.description = translate("In certificate-only mode, any valid client certificate issued by the trusted CA can connect. User account status, expiry and login times do not restrict access; use the certificate common name for per-client settings.")
o.rmempty = false

o = s:taboption("security", ListValue, "cipher", translate("Cipher"))
o.default = "AES-256-GCM"
o:value("AES-256-GCM")
o:value("AES-128-GCM")
o:value("AES-256-CBC")
o:value("AES-128-CBC")
o:value("CHACHA20-POLY1305")
o:value("none", translate("None"))
o.rmempty = false

o = s:taboption("security", ListValue, "auth", translate("Auth digest"))
o.default = "SHA256"
o:value("SHA1")
o:value("SHA256")
o:value("SHA384")
o:value("SHA512")
o:value("none", translate("None"))
o.rmempty = false

o = s:taboption("security", Flag, "tls_crypt", translate("TLS Crypt"))
o.default = "0"
o.rmempty = false

o = s:taboption("security", Flag, "tls_auth", translate("TLS Auth"))
o.default = "0"
o.rmempty = false
o:depends("tls_crypt", "0")

o = s:taboption("security", Flag, "duplicate_cn", translate("Allow duplicate login"))
o.default = "0"
o.rmempty = false

o = s:taboption("client", Value, "ddns", translate("DDNS or IP"))
o.datatype = "string"
o.default = "example.com"
o.rmempty = false

o = s:taboption("client", DynamicList, "remote_list", translate("Backup remote addresses"))
o.placeholder = "vpn.example.com:1194"
o.datatype = "string"
o.rmempty = true

o = s:taboption("client", Value, "ovpn_name", translate("Client config file name"))
o.default = "openvpn"
o.placeholder = "openvpn"
o.datatype = "string"
o.rmempty = false

o = s:taboption("client", TextValue, "extra_client_config", translate("Extra client config"))
o.datatype = "string"
o.rows = 3
o.wrap = "off"

o = s:taboption("general", TextValue, "extra_config", translate("Extra Config"))
o.datatype = "string"
o.rows = 3
o.wrap = "off"

o = s:taboption("client", Button, "certificate", translate("OpenVPN Client config file"))
o.inputtitle = translate("Download .ovpn file")
o.inputstyle = "reload"
o.description = translate("Certificate authentication requires a client certificate and private key supplied separately; the downloaded file contains neither.")
o.write = function()
	if luci.sys.call("sh /usr/share/openvpn-server/script/gen_client_config.sh >/dev/null 2>&1") ~= 0 then
		luci.http.status(500, "Failed to generate client configuration")
		return
	end
	local filename = m.uci:get("luci-app-openvpn-server", "server", "ovpn_name") or "openvpn"
	filename = filename:gsub("[^%w%._%-]", "_")
	if filename == "" then filename = "openvpn" end
	if not filename:match("%.ovpn$") then filename = filename .. ".ovpn" end
	local t,e
	t = nixio.open("/tmp/openvpn.ovpn","r")
	luci.http.header('Content-Disposition','attachment; filename="' .. filename .. '"')
	luci.http.prepare_content("application/octet-stream")
	while true do
		e = t:read(nixio.const.buffersize)
		if (not e) or (#e==0) then
			break
		else
			luci.http.write(e)
		end
	end
	t:close()
	os.remove("/tmp/openvpn.ovpn")
	luci.http.close()
end

ca = s:taboption("certificate", Value, "_ca", translate("CA certificate"))
ca.template = "cbi/tvalue"
ca.rows = 15
function ca.cfgvalue(self, section)
	return nixio.fs.readfile("/usr/share/openvpn-server/ca.crt")
end

function ca.write(self, section, value)
	nixio.fs.writefile("/usr/share/openvpn-server/ca.crt", value)
end

server_crt = s:taboption("certificate", Value, "_server_crt", translate("Server certificate"))
server_crt.template = "cbi/tvalue"
server_crt.rows = 15
function server_crt.cfgvalue(self, section)
	return nixio.fs.readfile("/usr/share/openvpn-server/server.crt")
end

function server_crt.write(self, section, value)
	nixio.fs.writefile("/usr/share/openvpn-server/server.crt", value)
end

server_key = s:taboption("certificate", Value, "_server_key", translate("Server private key"))
server_key.template = "cbi/tvalue"
server_key.rows = 15
function server_key.cfgvalue(self, section)
	return nixio.fs.readfile("/usr/share/openvpn-server/server.key")
end

function server_key.write(self, section, value)
	nixio.fs.writefile("/usr/share/openvpn-server/server.key", value)
end

tls_crypt_key = s:taboption("certificate", Value, "_tls_crypt_key", translate("TLS Crypt key"))
tls_crypt_key.template = "cbi/tvalue"
tls_crypt_key.rows = 8
function tls_crypt_key.cfgvalue(self, section)
	return nixio.fs.readfile("/usr/share/openvpn-server/tls-crypt.key")
end

function tls_crypt_key.write(self, section, value)
	nixio.fs.writefile("/usr/share/openvpn-server/tls-crypt.key", value)
end

tls_auth_key = s:taboption("certificate", Value, "_tls_auth_key", translate("TLS Auth key"))
tls_auth_key.template = "cbi/tvalue"
tls_auth_key.rows = 8
function tls_auth_key.cfgvalue(self, section)
	return nixio.fs.readfile("/usr/share/openvpn-server/tls-auth.key")
end

function tls_auth_key.write(self, section, value)
	nixio.fs.writefile("/usr/share/openvpn-server/tls-auth.key", value)
end

renew = s:taboption("certificate", Button, "_renew", translate("Renew certificate"), translate("Please wait a moment after clicking..."))
renew.inputstyle = "apply"
function renew.write(self, section, value)
	luci.sys.call("sh /usr/share/openvpn-server/script/ca_renew.sh > /dev/null 2>&1 &")
	luci.http.redirect(d.build_url("admin", "vpn", "openvpn-server"))
end

s = m:section(TypedSection, "users", translate("Users Manager"))
s.addremove = true
s.anonymous = true
s.template = "cbi/tblsection"
s.extedit = d.build_url("admin", "vpn", "openvpn-server", "user", "%s")
function s.create(e, t)
    t = TypedSection.create(e, t)
    luci.http.redirect(e.extedit:format(t))
end

o = s:option(Flag, "enabled", translate("Enabled"))
o.default = 1
o.rmempty = false

o = s:option(Value, "username", translate("Username"))
o.placeholder = translate("Username")
o.description = translate("In certificate-only mode, use the client certificate common name for per-client settings.")
o.rmempty = false

o = s:option(Value, "password", translate("Password"))
o.placeholder = translate("Password")
o.rmempty = m.uci:get("luci-app-openvpn-server", "server", "auth_method") == "certificate"

o = s:option(Value, "ipaddress", translate("IP address"))
o.placeholder = translate("Automatically")
o.datatype = "ip4addr"
o.rmempty = true

o = s:option(Value, "remark", translate("Remark"))
o.rmempty = true

return m
