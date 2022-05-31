module("luci.controller.qbittorrent", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/qbittorrent") then
		return
	end

	local page = entry({"admin", "nas", "qBittorrent"}, cbi("qbittorrent"), _("qBittorrent"), 100)
	page.dependent = true
	page.acl_depends = { "luci-app-qbittorrent" }

	entry({"admin", "nas", "qBittorrent", "status"}, call("act_status")).leaf = true
end

function act_status()
	local e = {}
	e.running = luci.sys.call("pgrep qbittorrent-nox >/dev/null") == 0
	luci.http.prepare_content("application/json")
	luci.http.write_json(e)
end
