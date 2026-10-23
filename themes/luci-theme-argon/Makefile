#
# Copyright (C) 2008-2019 Jerrykuku
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=Argon Theme
LUCI_DEPENDS:=+wget-any +jsonfilter +ucode-mod-math +flock +coreutils +coreutils-timeout
LUCI_BASENAME:=argon-config

PKG_VERSION:=3.1.0
PKG_RELEASE:=20261022
PKG_PROVIDES:=luci-app-argon-config

PKG_LICENSE:=Apache-2.0 MIT

LUCI_MINIFY_CSS:=0
# Ship template source across stable and snapshot runtimes. Precompiled
# bytecode would require the SDK's ucode format (see issue #715).
# Disable this package's build step as well, avoiding LuCI's opt-out warning.
CONFIG_LUCI_UTMIN:=
LUCI_MINIFY_UT:=0

define Package/luci-theme-argon/conffiles
/etc/config/argon
/www/luci-static/argon/background/
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
