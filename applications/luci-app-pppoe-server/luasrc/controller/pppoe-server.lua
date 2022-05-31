-- Copyright 2018-2019 Lienol <lawlienol@gmail.com>

module("luci.controller.pppoe-server", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/pppoe-server") then
		return
	end

	local page = entry({"admin", "services", "pppoe-server"}, alias("admin", "services", "pppoe-server", "settings"), _("PPPoE Server"), 3)
	page.dependent = true
	page.acl_depends = { "luci-app-pppoe-server" }

	entry({"admin", "services", "pppoe-server", "settings"}, cbi("pppoe-server/settings"), _("General Settings"), 10).leaf = true
	entry({"admin", "services", "pppoe-server", "users"}, cbi("pppoe-server/users"), _("Users Manager"), 20).leaf = true
	entry({"admin", "services", "pppoe-server", "online"}, cbi("pppoe-server/online"), _("Online Users"), 30).leaf = true
	entry({"admin", "services", "pppoe-server", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.status = luci.sys.call("pidof %s >/dev/null" % "pppoe-server") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
