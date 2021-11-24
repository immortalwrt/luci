module("luci.controller.eqos", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/eqos") then
		return
	end
	
	local page
	page = entry({"admin", "network", "eqos"}, cbi("eqos"), "EQoS")
	page.dependent = true
	page.acl_depends = { "luci-app-eqos" }

	entry({"admin", "network", "eqos", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.running = luci.sys.call("tc qdisc | grep htb >/dev/null") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
