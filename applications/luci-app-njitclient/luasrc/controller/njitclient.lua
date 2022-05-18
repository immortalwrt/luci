module("luci.controller.njitclient", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/njitclient") then
		return
	end

	local page = entry({"admin", "network", "njitclient"}, cbi("njitclient"), _("NJIT Client"), 100)
	page.dependent = true
	page.acl_depends = { "luci-app-njitclient" }
end
