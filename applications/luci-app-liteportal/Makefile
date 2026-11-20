#
# Copyright (C) 2026 cocolight <sunlit.page@gmail.com>
#
# This is free software, licensed under the GNU General Public License v2.
# See /LICENSE for more information.
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-liteportal
PKG_VERSION:=4.0.1
PKG_RELEASE:=1

PKG_MAINTAINER:=cocolight <sunlit.page@gmail.com>
# luci.mk:170 sets the package metadata from LUCI_MAINTAINER, not from
# PKG_MAINTAINER, and its default (luci.mk:16) is "OpenWrt LuCI community".
LUCI_MAINTAINER:=cocolight <sunlit.page@gmail.com>
PKG_LICENSE:=GPL-2.0-only
PKG_LICENSE_FILES:=LICENSE

LUCI_TITLE:=Portal - static HTML dashboard
LUCI_DESCRIPTION:=Publishes a static HTML navigation portal as a sub-path of \
	the router's existing uhttpd. Bookmarks, icons and the background are \
	managed through LuCI and persisted in uci.
LUCI_DEPENDS:=+luci-base +uhttpd +ucode +ucode-mod-fs +ucode-mod-uci +rpcd-mod-ucode
LUCI_PKGARCH:=all
LUCI_URL:=https://github.com/wrttools/luci-app-liteportal

define Package/luci-app-liteportal/conffiles
/etc/config/liteportal
endef

define Package/luci-app-liteportal/postinst
#!/bin/sh
# $${IPKG_INSTROOT} is set by opkg, $${PKG_INSTROOT} by apk-tools.
[ -z "$${IPKG_INSTROOT}$${PKG_INSTROOT}" ] || exit 0

# The page is handed out by the main uhttpd from its own document root, so that
# is the only tree it can live in. The template files themselves are published
# by /etc/init.d/liteportal start below, which also bakes the first links.json -
# the list of files to publish therefore lives in exactly one place.
mkdir -p /www/liteportal

# Let rpcd pick up the new ucode plugin, then bake the initial links.json.
# If the reload did not rescan the plugin directory the ubus object stays
# missing and every luci.liteportal call fails with "Object not found", so fall back
# to a full restart before generating.
/etc/init.d/rpcd reload 2>/dev/null
ubus list 2>/dev/null | grep -q '^luci\.liteportal$$' || /etc/init.d/rpcd restart 2>/dev/null
sleep 1

# Reported instead of discarded: a silent failure here leaves the portal
# with no bookmarks on it and nothing in the log to explain why.
out=$$(ubus call luci.liteportal generate 2>&1); \
printf '%s' "$$out" | grep -q '"ok"[[:space:]]*:[[:space:]]*true' \
	|| { echo "luci-app-liteportal: links.json not generated: $$out" >&2; \
	     logger -t liteportal "links.json not generated during install: $$out"; }

if ! /etc/init.d/liteportal enable; then \
	echo "luci-app-liteportal: failed to enable the portal service" >&2; \
	logger -t liteportal "failed to enable the portal service"; \
fi
if ! /etc/init.d/liteportal start; then \
	echo "luci-app-liteportal: failed to start the portal service" >&2; \
	logger -t liteportal "failed to start the portal service"; \
fi

rm -f /tmp/luci-indexcache.*
rm -rf /tmp/luci-modulecache/

exit 0
endef

define Package/luci-app-liteportal/prerm
#!/bin/sh
[ -z "$${IPKG_INSTROOT}$${PKG_INSTROOT}" ] || exit 0

if ! /etc/init.d/liteportal stop; then \
	echo "luci-app-liteportal: failed to stop the portal service" >&2; \
	logger -t liteportal "failed to stop the portal service"; \
fi
if ! /etc/init.d/liteportal disable; then \
	echo "luci-app-liteportal: failed to disable the portal service" >&2; \
	logger -t liteportal "failed to disable the portal service"; \
fi

# Remove only what the package published. /www/liteportal/{icons,bg} holds the
# files the user uploaded: uci still points at them after the package is gone,
# so deleting the whole directory means a reinstall comes back with broken
# images and no way to tell why. They go away with the configuration, by hand.
rm -f /www/liteportal/index.html /www/liteportal/liteportal.js \
	/www/liteportal/liteportal.css /www/liteportal/links.json

# /etc/config/liteportal is a conffile and its removal is left to the package
# manager, so that a modified configuration survives a reinstall.

exit 0
endef

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
