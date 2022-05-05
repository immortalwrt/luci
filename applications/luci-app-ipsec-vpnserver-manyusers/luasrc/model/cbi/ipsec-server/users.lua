m = Map("ipsec", translate("IPSec VPN Server"))
m.description = translate("IPSec VPN connectivity using the native built-in VPN Client on iOS or Andriod (IKEv1 with PSK and Xauth)")

s = m:section(TypedSection, "users", translate("Users Manager"))
s.addremove = true
s.anonymous = true
s.template = "cbi/tblsection"

o = s:option(Flag, "enabled", translate("Enabled"))
o.rmempty = false

o = s:option(Value, "username", translate("User name"))
o.placeholder = translate("User name")
o.rmempty = true

o = s:option(Value, "password", translate("Password"))
o.rmempty = true

return m
