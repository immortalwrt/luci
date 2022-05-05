m = Map("ipsec", translate("IPSec VPN Server"))
m.description = translate("IPSec VPN connectivity using the native built-in VPN Client on iOS or Andriod (IKEv1 with PSK and Xauth)")

m:section(SimpleSection).template  = "ipsec/ipsec_status"

s = m:section(NamedSection, "ipsec", "service")
s.anonymouse = true

o = s:option(Flag, "enabled", translate("Enable"))
o.default = 0
o.rmempty = false

o = s:option(Value, "clientip", translate("VPN Client IP"))
o.description = translate("LAN DHCP reserved started IP addresses with the same subnet mask")
o.datatype = "ip4addr"
o.optional = false
o.rmempty = false

o = s:option(Value, "clientdns", translate("VPN Client DNS"))
o.description = translate("DNS using in VPN tunnel.Set to the router's LAN IP is recommended")
o.datatype = "ip4addr"
o.optional = false
o.rmempty = false

o = s:option(Value, "account", translate("Account"))
o.datatype = "string"

o = s:option(Value, "password", translate("Password"))
o.password = true

o = s:option(Value, "secret", translate("Secret Pre-Shared Key"))
o.password = true

return m
