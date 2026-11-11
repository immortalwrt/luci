# SPDX-License-Identifier: MIT
#
# Copyright (C) 2026 qt <qingting1016@outlook.com>

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for HUST campus network auto login
LUCI_DESCRIPTION:=Web interface for the hustNetworkLogin daemon, which logs in to \
	the HUST (Srun ePortal) campus network and re-authenticates automatically \
	when the connection drops.
LUCI_DEPENDS:=+hustNetworkLogin
LUCI_PKGARCH:=all
LUCI_URL:=https://github.com/qingting04/hustNetworkLogin

PKG_LICENSE:=MIT
PKG_MAINTAINER:=qt <qingting1016@outlook.com>

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
