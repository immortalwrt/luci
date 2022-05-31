module("luci.controller.release_ram", package.seeall)

function index()
	local page = entry({"admin", "status", "release_ram"}, call("release_ram"), _("Release Ram"), 9999)
	page.dependent = true
	page.acl_depends = { "luci-app-ramfree" }
end

function release_ram()
	luci.sys.call("sync && echo 3 > /proc/sys/vm/drop_caches")
	luci.http.redirect(luci.dispatcher.build_url("admin/status"))
end
