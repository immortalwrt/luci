--[[
N2N V3 Luci configuration page.
]]--

module("luci.controller.n2n_v3", package.seeall)

function index()
	
	if not nixio.fs.access("/etc/config/n2n_v3") then
		return
	end
	
	entry({"admin", "vpn"}, firstchild(), "VPN", 45).dependent = false
	entry({"admin", "vpn", "n2n_v3", "status"}, call("n2n_status")).leaf = true

	local page
	page = entry({"admin", "vpn", "n2n_v3"}, cbi("n2n_v3"), _("N2N v3 VPN"), 45)
	page.dependent = true
	page.acl_depends = { "luci-app-n2n_v3" }
end

function n2n_status()
	local status = {}
	status.running = luci.sys.call("pgrep edge >/dev/null")==0
	luci.http.prepare_content("application/json")
	luci.http.write_json(status)
end
