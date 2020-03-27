-- Licensed to the public under the Apache License 2.0.

module("luci.controller.ttyd", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/ttyd") then
		return
	end

	entry({"admin", "system", "ttyd"}, firstchild(), _("ttyd"))
	entry({"admin", "system", "ttyd", "ttyd"}, view("ttyd/term"), _("Terminal"), 1)
	entry({"admin", "system", "ttyd", "config"}, view("ttyd/config"), _("Config"), 2)
end
