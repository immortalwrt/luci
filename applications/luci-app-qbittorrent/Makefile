# Copyright (C) 2019 Openwrt.org
#
# This is a free software, use it under Apache Licene 2.0 & GNU General Public License v3.0.
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=qbittorrent-nox for LuCI
LUCI_DEPENDS:=+qBittorrent-Enhanced-Edition
LUCI_PKGARCH:=all

define Package/luci-app-qbittorrent/conffiles
/etc/qBittorrent/
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
