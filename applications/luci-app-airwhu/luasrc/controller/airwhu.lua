module("luci.controller.airwhu", package.seeall)

function index()
        entry({"admin", "services", "AirWHU"}, cbi("airwhu"), _("AirWHU"), 100).acl_depends = { "luci-app-airwhu" }
        end
