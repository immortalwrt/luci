# SPDX-License-Identifier: GPL-3.0-only
#
# Copyright (C) 2022 ImmortalWrt.org

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI app for BitSrunLoginGo (Bit Srun auto login tool)
LUCI_DEPENDS:=+bitsrunlogin-go
LUCI_PKGARCH:=all

PKG_NAME:=luci-app-bitsrunlogin-go
PKG_RELEASE:=$(COMMITCOUNT)

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
