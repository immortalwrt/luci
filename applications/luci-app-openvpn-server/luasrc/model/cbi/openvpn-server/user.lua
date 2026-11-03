local d = require "luci.dispatcher"

m = Map("luci-app-openvpn-server", translate("Users Manager"))
m.redirect = d.build_url("admin", "vpn", "openvpn-server")

s = m:section(NamedSection, arg[1], "users", "")
s.addremove = false
s.anonymous = true

o = s:option(Flag, "enabled", translate("Enabled"))
o.default = 1
o.rmempty = false

o = s:option(Value, "username", translate("Username"))
o.placeholder = translate("Username")
o.rmempty = false

o = s:option(Value, "password", translate("Password"))
o.placeholder = translate("Password")
o.rmempty = false

o = s:option(Value, "remark", translate("Remark"))
o.rmempty = true

o = s:option(Value, "ipaddress", translate("IP address"))
o.placeholder = translate("Automatically")
o.datatype = "ip4addr"
o.rmempty = true

o = s:option(DynamicList, "routes", translate("Static Routes"))
o.placeholder = "192.168.10.0/24"
o.datatype = "ipmask4"
o.rmempty = true

o = s:option(Value, "expire_time", translate("Expire time"))
o.placeholder = "2099-12-31"
o.datatype = "string"
o.rmempty = true

o = s:option(Value, "access_time", translate("Allowed login time"))
o.placeholder = "00:00-23:59"
o.datatype = "string"
o.rmempty = true

o = s:option(Value, "upload_limit", translate("Upload limit"))
o.placeholder = "1024"
o.datatype = "uinteger"
o.rmempty = true

o = s:option(Value, "download_limit", translate("Download limit"))
o.placeholder = "1024"
o.datatype = "uinteger"
o.rmempty = true

o = s:option(Flag, "allow_lan", translate("Allow access to LAN"))
o.default = 1
o.rmempty = false

return m
