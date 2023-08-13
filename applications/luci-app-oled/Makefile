#
# Copyright (C) 2020 Nate Ding
#
# This is free software, licensed under the GUN General Public License v3.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

LUCI_Title:=LuCI support for ssd1306 0.91\' 138x32 display
LUCI_DEPENDS:=+i2c-tools +coreutils +coreutils-nohup +libuci
LUCI_PKGARCH:=all

PKG_LICENSE:=GPLv3
PKG_LINCESE_FILES:=LICENSE
PKF_MAINTAINER:=natelol <natelol@github.com>

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
