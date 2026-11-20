# SPDX-License-Identifier: MIT
#
# Copyright (C) 2026 hakurei kyaru

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI support for ZTE portable WiFi hotspots
LUCI_DESCRIPTION:=Show signal, network and device information of a ZTE portable WiFi \
 (RedCap hotspot, e.g. MU3650 / F40) on the status overview page, plus a settings page \
 for the device address, login password and its wireless switch.
LUCI_DEPENDS:=+luci-base +rpcd +ztewifi
LUCI_PKGARCH:=all

PKG_MAINTAINER:=hakurei kyaru <admin@yuyuko.moe>
PKG_LICENSE:=MIT

define Package/luci-app-ztewifi/conffiles
/etc/config/ztewifi
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
