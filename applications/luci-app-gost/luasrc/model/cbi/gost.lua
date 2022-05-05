-- Created By ImmortalWrt
-- https://github.com/immortalwrt

m = Map("gost", translate("Gost"))
m.description = translate("A simple security tunnel written in Golang.")

m:section(SimpleSection).template  = "gost/gost_status"

s = m:section(TypedSection, "gost")
s.anonymous = true
s.addremove = false

o = s:option(Flag, "enable", translate("Enable"))
o.default = 0
o.rmempty = false

o = s:option(Value, "run_command", translate("Command"))
o.rmempty = false

return m
