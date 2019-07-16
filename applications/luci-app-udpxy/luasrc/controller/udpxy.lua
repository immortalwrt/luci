-- Copyright 2014 Álvaro Fernández Rojas <noltari@gmail.com>
-- Licensed to the public under the Apache License 2.0.

module("luci.controller.udpxy", package.seeall)

function index()
	if not nixio.fs.access("/etc/config/udpxy") then
		return
	end

	local page = entry({"admin", "services", "udpxy"}, cbi("udpxy"), _("UDPXY组播"))
	page.dependent = true

end
