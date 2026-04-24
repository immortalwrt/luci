# NetWiz (luci-app-netwiz) 🚀

**NetWiz**网络设置向导-极简，开箱即用，「纯净 · 安全 · 零破坏」。化繁为简，聚焦三大高频接入场景，实现高效完成配置与最小干预部署。

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.05_|_25.x+-blue.svg) ![ImmortalWrt](https://img.shields.io/badge/ImmortalWrt-Supported-orange.svg) ![License](https://img.shields.io/badge/License-GPL--3.0-green.svg) ![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

[English](#english) | [简体中文](#简体中文)

---

## English

### Description
`luci-app-netwiz` (Network Setup Wizard) is a minimalist, safe, and non-destructive network configuration interface for OpenWrt/ImmortalWrt. 

It is designed to be highly user-friendly for novices setting up secondary routers (DHCP/Static IP) or bypass routers.

### Key Features
* **Pure CSR Architecture:** Built with modern Client-Side Rendering.
* **Safe Configuration:** Prevents routing loops and network conflicts (e.g., stops users from putting WAN and LAN in the same subnet).
* **Bypass Router Mode (旁路由):** Auto-configures DHCP and gateway settings safely.
* **Smooth UX:** Replaces traditional dirty hacks with standard `ubus call luci reload` to solve SPA cache issues without interrupting the user session.
* **Multi-language:** Built-in i18n support (English, zh-Hans, zh-Hant).
* **Strict ACL:** Frontend has zero direct write access to UCI. All modifications are safely encapsulated within the backend `rpcd` script.

### Breadcrumb Trail
* 👉 **System -> Network Wizard**。

🌐 **Secondary Router Mode (DHCP / Static IP)**
   * Use Case: When the upstream modem (ONT) already handles PPPoE dialing, or an existing primary router is present. This device operates as a secondary router or segmented subnet router.
   * Behavior: Supports both dynamic IP assignment (DHCP) and static IP configuration. Automatically provisions WAN interface settings and performs intelligent subnet validation to prevent routing loops or address conflicts.

🔌 **Broadband Dial-Up (PPPoE)**
   * Use Case: When the modem is configured in full bridge mode and this router is responsible for establishing the PPPoE connection, acting as the primary network gateway.
   * Behavior: Accurately applies PPPoE credentials (username and password), removes residual gateway configurations, and safely restarts the underlying dialer process to ensure a clean connection.

🏠 **LAN Configuration (Primary / Bypass Router Switching)**
   * Use Case: For modifying the device’s LAN management IP, or when a primary router already exists and this device functions as an auxiliary gateway (bypass router).
   * Behavior: One-click activation of “Bypass Router Mode” automatically disables the local DHCP service and enforces manual configuration of the upstream gateway. In primary router mode, safeguards ensure the gateway field remains empty, preventing disruption to the existing LAN topology.

   A bypass router lets you add advanced features without touching the main network. The primary router keeps handling DHCP and NAT, while the bypass router processes selected traffic for tasks like policy routing or proxies. This keeps the network stable while giving you more control.

**A simple, common example:**
   
   * You have a main router providing Wi-Fi and DHCP for your home. You add a bypass router and set only your laptop’s gateway to it. Now, your laptop’s traffic goes through the bypass router (e.g., for proxy or special routing), while all other devices continue using the main router normally. This way, you get advanced control on one device without affecting the rest of the network.

---

```bash
luci-app-netwiz/
├── Makefile
├── htdocs/
│   └── luci-static/
│       └── resources/
│           └── view/
│               └── netwiz.js              # Pure frontend JS code
├── root/
│   ├── etc/                               # 🌟 [NEW] System-level config directory(WIP)
│   │   ├── hotplug.d/
│   │   │   └── iface/
│   │   │       └── 99-netwiz-autoswitch   # 🌟 1. WAN cable hotplug listener(WIP)
│   │   └── init.d/
│   │       └── netwiz-recovery            # 🌟 2. Power-loss fail-safe recovery service (Requires chmod +x)(WIP)
│   └── usr/
│       ├── libexec/
│       │   ├── netwiz-autodetect.sh       # 🌟 3. Core auto-detection logic engine (Requires chmod +x)
│       │   └── rpcd/
│       │       └── netwiz                 # Pure backend RPC script
│       └── share/
│           ├── luci/
│           │   └── menu.d/
│           │       └── luci-app-netwiz.json
│           └── rpcd/
│               └── acl.d/
│                   └── luci-app-netwiz.json
└── po/
    ├── zh_Hans/
    │   └── netwiz.po
    └── zh_Hant/
        └── netwiz.po
```
 
---

## 简体中文

### 📖简介

`luci-app-netwiz` (网络设置向导) 是一款专为 OpenWrt / ImmortalWrt 设计的极简、安全且“零破坏”的网络配置界面。

它极其适合新手用户，能够一键安全地配置二级路由（动态/静态 IP）以及旁路由环境。对于刚装完系统的玩家，需要网络设置才能上网，但自带的设置隐藏比较深，且容易配置错误，无脑和暴力重置整个网络配置文件，清空路由的已配置清单，会导致精心设置的网桥（Bridge）、VLAN 和物理网卡绑定瞬间崩溃或引发**莫名其妙**的网络断流。**NetWiz 专为解决此痛点而生。**

### ✨核心特性
* **纯 CSR 架构：** 采用现代前端渲染技术构建，响应迅速。
* **防呆与冲突拦截：** 严格的输入校验，防止网段冲突或路由死循环（例如：拦截 WAN 口与 LAN 口处于同一网段的错误操作）。
* **旁路由向导：** 自动化处理旁路由的网关与 DHCP 设置，避免全屋断网。
* **无缝刷新体验：** 摒弃了传统的暴力刷新手段，采用标准 `ubus call luci reload` 解决缓存问题，配置生效全程平滑过渡。
* **多语言支持：** 原生支持自动切换英文、简体中文与繁体中文。
* **严格的权限控制 (ACL)：** 前端页面剥离了 UCI 写入权限，所有底层修改均由后端的 `rpcd` 脚本安全执行，彻底杜绝越权风险。

### 导航路径
👉 **系统 (System) -> 网络向导**。

---

### 核心支持的三大模块：

1. 🌐 **二级路由模式 (DHCP / 静态 IP)**
   * **适用场景**：光猫已经负责拨号，或者上级有主路由，本设备作为二级路由或子网段路由接入。
   * **行为**：可自由选择“动态获取”或“静态绑定”，自动接管 WAN 口配置，智能校验网段避免死循环。

2. 🔌 **宽带拨号 (PPPoE)**
   * **适用场景**：光猫为纯桥接模式，由本路由器直接进行宽带拨号上网，承担全屋网络枢纽。
   * **行为**：精准写入宽带账号与密码，剥离多余网关遗留，安全重启底层拨号进程。

3. 🏠 **局域网设置 (主路由 / 旁路由切换)**
   * **适用场景**：仅需修改设备内网管理 IP；或者网络内已有主路由，本设备仅作为辅助网关。
   * **行为**：一键开启“旁路由模式”，系统将自动关闭本机 DHCP 服务，并要求必须填写主路由网关；若为主路由，则防呆提示网关留空，绝不破坏现有局域网拓扑。

---

<img width="680" alt="Image" src="https://github.com/user-attachments/assets/40905f7e-fa8b-4bc6-8bc8-846f81b3673c" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/7d056b14-9a88-4d0e-a0ea-2fae7a5f8233" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/2254dffb-bd82-40e0-9d58-0c9f90d60512" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/f2bd9091-2a1d-4b37-9104-3071dbf9d71a" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/01bbdd3a-ab4c-493f-adbd-09a5087f2de4" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/e02aefe9-51f8-4c15-8a93-932b48e4594d" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/52e42b52-11e3-4c61-87e6-17a689451be7" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/d55ff995-4e19-4fca-9059-60779777c4d9" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/a1593cdb-1384-4b78-af35-107fa7ed4f60" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/6b3b6aeb-8ed0-4612-a187-c7d8a40b0d67" />

---
