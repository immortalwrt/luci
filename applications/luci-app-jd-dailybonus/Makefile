include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-jd-dailybonus
PKG_VERSION:=1.0.6
PKG_RELEASE:=20211016

LUCI_TITLE:=Luci for JD dailybonus Script
LUCI_DEPENDS:=+libuci-lua +lua +node +node-request +uclient-fetch +wget
LUCI_PKGARCH:=all

define Package/luci-app-jd-dailybonus/conffiles
/etc/config/jd-dailybonus
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
