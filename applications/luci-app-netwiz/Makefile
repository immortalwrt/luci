include $(TOPDIR)/rules.mk

# 明确声明包名与版本
PKG_NAME:=luci-app-netwiz
PKG_VERSION:=1.7.2
PKG_RELEASE:=1

# LuCI 核心定义
LUCI_TITLE:=LuCI Support for Network Setup Wizard
LUCI_DEPENDS:=+luci-base +iwinfo +rpcd +rpcd-mod-iwinfo +luci-compat +ppp-mod-pppoe
# 声明为纯脚本架构，生成的 IPK/APK 可以在任何 CPU 路由上通用安装
LUCI_PKGARCH:=all

# 使用绝对路径引入 luci.mk，保证任何目录下都能成功触发多国语言编译
include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
