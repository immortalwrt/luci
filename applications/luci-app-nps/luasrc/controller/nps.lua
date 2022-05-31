module("luci.controller.nps", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/nps") then
		return
	end

	local page = entry({"admin", "services", "nps"}, cbi("nps"), _("Nps Setting"), 100)
	page.dependent = true
	page.acl_depends = { "luci-app-nps" }

	entry({"admin", "services", "nps", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.running = luci.sys.call("pgrep npc > /dev/null") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
