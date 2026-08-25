#
# Copyright (C) 2008-2019 Jerrykuku
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Argon Theme
LUCI_DEPENDS:=+wget-any +jsonfilter

PKG_VERSION:=2.4.7
PKG_RELEASE:=20260824

LUCI_MINIFY_CSS:=0

define Package/luci-theme-argon/conffiles
/etc/config/argon
/www/luci-static/argon/background/
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
