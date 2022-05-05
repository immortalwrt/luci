module("luci.controller.guest-wifi", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/guest-wifi") then
		return
	end

	local page = entry({"admin", "network", "guest-wifi"}, cbi("guest-wifi"), _("Guest-wifi"), 19)
	page.dependent = true
	page.acl_depends = { "luci-app-guest-wifi" }
end
