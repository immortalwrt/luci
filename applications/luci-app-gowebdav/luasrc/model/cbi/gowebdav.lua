-- Created By ImmortalWrt
-- https://github.com/immortalwrt

m = Map("gowebdav", translate("GoWebDav"))
m.description = translate("GoWebDav is a tiny, simple, fast WevDav server.")

m:section(SimpleSection).template  = "gowebdav/gowebdav_status"

s = m:section(TypedSection, "gowebdav")
s.addremove = false
s.anonymous = true

o = s:option(Flag, "enable", translate("Enable"))
o.rmempty = false

o = s:option(Value, "listen_port", translate("Listen Port"))
o.placeholder = 6086
o.default = 6086
o.datatype = "port"
o.rmempty = false

o = s:option(Value, "username", translate("Username"))
o.description = translate("Leave blank to disable auth.")
o.placeholder = user
o.default = user
o.datatype = "string"

o = s:option(Value, "password", translate("Password"))
o.description = translate("Leave blank to disable auth.")
o.placeholder = pass
o.default = pass
o.datatype = "string"
o.password = true

o = s:option(Value, "root_dir", translate("Root Directory"))
o.placeholder = "/mnt"
o.default = "/mnt"
o.rmempty = false

o = s:option(Flag, "read_only", translate("Read-Only Mode"))
o.rmempty = false

o = s:option(Flag, "allow_wan", translate("Allow Access From Internet"))
o.rmempty = false

o = s:option(Flag, "use_https", translate("Use HTTPS instead of HTTP"))
o.rmempty = false

o = s:option(Value, "cert_cer", translate("Path to Certificate"))
o.datatype = "file"
o:depends("use_https", 1)

o = s:option(Value, "cert_key", translate("Path to Certificate Key"))
o.datatype = "file"
o:depends("use_https", 1)

o = s:option(DummyValue, "opennewwindow", translate("<input type=\"button\" class=\"cbi-button cbi-button-apply\" value=\"Download Reg File\" onclick=\"window.open('https://raw.githubusercontent.com/1715173329/gowebdav/master/allow_http.reg')\" />"))
o.description = translate("Windows doesn't allow HTTP auth by default, you need to import this reg key to enable it (Reboot needed).")

return m
