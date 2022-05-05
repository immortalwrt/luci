module("luci.controller.haproxy", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/haproxy") then
		return
	end

	local page = entry({"admin", "services", "haproxy"}, cbi("haproxy"), _("HAProxy"))
	page.dependent = true
	page.acl_depends = { "luci-app-haproxy-tcp" }

	entry({"admin", "services", "haproxy", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.running = luci.sys.call("pidof haproxy > /dev/null") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
