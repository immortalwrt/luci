# SPDX-Identifier-License: GPL-3.0-only
#
# Copyright (C) 2018 Lean <coolsnowwolf@gmail.com>
# Copyright (C) 2019-2021 ImmortalWrt.org

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-turboacc
PKG_RELEASE:=$(COMMITCOUNT)

PKG_LICENSE:=GPL-3.0-only
PKG_MAINTAINER:=Tianling Shen <cnsztl@immortalwrt.org>

LUCI_TITLE:=LuCI support for flow offloading
LUCI_DEPENDS:=+pdnsd-alt \
	+PACKAGE_TURBOACC_INCLUDE_BBR_CCA:kmod-tcp-bbr \
	+PACKAGE_TURBOACC_INCLUDE_DNSFORWARDER:dnsforwarder \
	+PACKAGE_TURBOACC_INCLUDE_DNSPROXY:dnsproxy \
	+PACKAGE_TURBOACC_INCLUDE_OFFLOADING:kmod-nft-offload
LUCI_PKGARCH:=all

define Package/luci-app-turboacc/config
config PACKAGE_TURBOACC_INCLUDE_OFFLOADING
	bool "Include Flow Offload"
	default y

config PACKAGE_TURBOACC_INCLUDE_BBR_CCA
	bool "Include BBR CCA"
	default n

config PACKAGE_TURBOACC_INCLUDE_DNSFORWARDER
	bool "Include DNSForwarder"
	default n

config PACKAGE_TURBOACC_INCLUDE_DNSPROXY
	bool "Include DNSProxy"
	default n
endef

PKG_CONFIG_DEPENDS:= \
	CONFIG_PACKAGE_TURBOACC_INCLUDE_BBR_CCA \
	CONFIG_PACKAGE_TURBOACC_INCLUDE_DNSFORWARDER \
	CONFIG_PACKAGE_TURBOACC_INCLUDE_DNSPROXY \
	CONFIG_PACKAGE_TURBOACC_INCLUDE_OFFLOADING

include ../../luci.mk

# call BuildPackage - OpenWrt buildroot signature
