# SPDX-License-Identifier: GPL-3.0-only
#
# Copyright (C) 2021 ImmortalWrt.org

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI for CPU Freq Setting
LUCI_DEPENDS:=@(arm||aarch64)
LUCI_PKGARCH:=all

PKG_NAME:=luci-app-cpufreq
PKG_RELEASE:=$(COMMITCOUNT)

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
