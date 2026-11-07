# SPDX-License-Identifier: MIT
#
# Copyright (C) 2026 qt <qingting1016@outlook.com>

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for JLU campus network (DrCOM) login
LUCI_DESCRIPTION:=Web interface for the jluNetworkLogin daemon, which performs the \
	DrCOM challenge/login/keepalive handshake for the JLU campus network and \
	reconnects automatically when the connection drops.
LUCI_DEPENDS:=+jluNetworkLogin
LUCI_PKGARCH:=all
LUCI_URL:=https://github.com/qingting04/jluNetworkLogin

PKG_LICENSE:=MIT
PKG_MAINTAINER:=qt <qingting1016@outlook.com>

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
