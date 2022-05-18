-- Created By ImmortalWrt
-- https://github.com/immortalwrt

m = Map("naiveproxy", translate("NaiveProxy"))
m.description = translate("NaïveProxy uses Chrome's network stack to camouflage traffic with strong censorship resistance and low detectability. Reusing Chrome's stack also ensures best practices in performance and security.")

m:section(SimpleSection).template  = "naiveproxy/naiveproxy_status"

s = m:section(TypedSection, "naiveproxy")
s.anonymous = true
s.addremove = false

o = s:option(Flag, "enable", translate("Enable"))
o.default = 0
o.rmempty = false

o = s:option(Value, "listen_addr", translate("Listen Address"))
o.description = translate("proto://[addr][:port]")
o.rmempty = false

o = s:option(Value, "server_addr", translate("Server Address"))
o.description = translate("proto://user:pass@hostname[:port]")
o.rmempty = false

o = s:option(Value, "extra_argument", translate("Extra Argument"))
o.description = translate("Appends extra argument to NaiveProxy")

return m
