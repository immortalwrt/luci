# NetWiz (luci-app-netwiz) 🚀

![OpenWrt](https://img.shields.io/badge/OpenWrt-23.05_|_25.x+-blue.svg) ![ImmortalWrt](https://img.shields.io/badge/ImmortalWrt-Supported-orange.svg) ![License](https://img.shields.io/badge/License-GPL--3.0-green.svg) ![Build](https://img.shields.io/badge/Build-Passing-brightgreen.svg)

---
### Description
**NetWiz(luci-app-netwiz)** is a minimalist, safe, and non-destructive network configuration interface for OpenWrt/ImmortalWrt. 

minimalist and ready out of the box. Built with rigorous, well-structured logic, it features an enterprise-grade LAN fail-safe mechanism, intelligent WAN protocol switching, smart validation, and automatic conflict detection for IPs, gateways, WAN, and LAN interfaces. The front-end delivers a smooth, fluid user experience, eliminating the traditional frustrations of “errors after saving” and frequent configuration conflicts.

It is designed to be highly user-friendly for novices setting up secondary routers (DHCP/Static IP) or bypass routers.

### 🌟 Key Features

**🛡️ Enterprise-Grade Fail-Safes**
* **Persistent Power-Loss Recovery:** Backups are written to non-volatile flash (`/etc/config`). An early-boot `init.d` script guarantees an automatic network restoration even if the router loses power mid-test.
* **Smart Concurrency Radar (LAN Auto-Defuse):** The 120-second rollback bomb uses `netstat` to count concurrent connections, accurately distinguishing true browser access from background IoT probes to prevent false-positive defusals.
* **Smart WAN Auto-Detect (Anti-Jitter):** Features a time-based debounce algorithm that requires 3 continuous down-cycles to confirm a physical cable unplug, safely ignoring temporary software interface bounces.
* **Flash-Friendly Safe Logging:** Includes a persistent, auto-trimming logging system (`/etc/netwiz.log`) that survives reboots but strictly caps file size to protect the router's flash memory lifespan.

### 📶 Powerful Smart Wi-Fi Engine
* **Infinite Chip Array Detection:** Breaks the rigid limits of traditional single/dual-chip plugins. Automatically scans and takes over all physical wireless adapters in the system. Perfectly adapts to single-band, dual-band, tri-band, or even multi-band routers, ensuring no hardware is left idle.
* **Ultimate Low-Level Override:** Designed for incomplete, conflicting, or misconfigured underlying settings (e.g., a single chip stuck in 5G mode). Features an exclusive "Will Override Rule" that ignores residual hardware history, forcibly cleansing and rewriting the correct physical protocols and channels to guarantee a 100% successful application.
* **Smart Bandwidth Unleashed:** Say goodbye to crippled networks! When applying configurations, it intelligently identifies hardware limits and silently maximizes channel width (e.g., boosting 2.4G to HT40 and 5G to VHT80). It safely preserves existing Wi-Fi 6 (HE) configurations, ensuring effortless gigabit speeds.
* **Seamless Two-Way Data Sync:** When switching between "Smart Connect" and "Separate Bands", Wi-Fi passwords and SSIDs are intelligently synced back and forth, eliminating repetitive typing. Features historical config memory—retrieve your old password instantly even after disabling and re-enabling Wi-Fi.

**⚙️ Core Architecture & Security**
* **Zero-Zombie `procd` Daemon:** Replaces unreliable `hotplug` tricks with a single, ultra-lightweight native OpenWrt daemon (`netwiz-monitor`) that reads `ubus` states with near 0% CPU footprint.
* **Strict ACL:** The frontend has zero direct write access to UCI. All modifications are safely encapsulated and validated within the backend `rpcd` script.
* **Safe Configuration:** Strictly prevents routing loops and network conflicts (e.g., actively stops users from putting WAN and LAN in the same subnet).

**🚀 Smooth UX & Frontend**
* **Pure CSR Architecture:** Built with modern Client-Side Rendering for a blazing-fast, app-like experience.
* **Asynchronous UI & Hot-Reload:** Eliminates traditional blind wait times. The UI asynchronously "knocks" on the new IP with a real-time stopwatch. The backend applies changes via `reload` instead of a full `restart` to prevent Wi-Fi dropouts.
* **Bypass Router Mode:** One-click deployment that auto-configures complex DHCP, DNS, and gateway settings flawlessly.
* **Multi-language:** Native built-in i18n support, automatically adapting to English, zh-Hans, and zh-Hant.

### Breadcrumb Trail
* 👉 **primary menu entry appearing right before “Logout -> Network Wizard**。
  (Placing the Network Setup Wizard immediately before “Logout” is a deliberate UI decision that benefits both beginners and users seeking quick configuration. It offers a highly visible, easily accessible entry point, eliminating the need to navigate complex OpenWrt menus. Moreover, this layout aligns with the polished, user-centric design conventions adopted by established router brands such as ASUS, TP-Link, and Xiaomi.)

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

📶 **Wi-Fi Settings（Auto-hide when Wi-Fi is unavailable.）**
* **Use Case**: Initial wireless network setup, or modifying the SSID, password, and encryption protocols for your whole-home network.
* **Behavior**: Intelligently detects the number of underlying physical chips to dynamically render the UI. Supports one-click "Smart Connect (All Bands)" to build a seamless roaming network, or splits into independent 2.4G/5G networks. Perfectly backwards compatible with legacy 802.11b IoT devices.

### 💡 Execution Permissions Requirement (For GitHub Actions / Documentation)**

**Required Executable Permissions (chmod +x):**

To ensure the backend daemons and RPC interfaces function correctly, the following files must have executable permissions assigned before building the package:

```bash
chmod +x luci-app-netwiz/root/usr/libexec/rpcd/netwiz
chmod +x luci-app-netwiz/root/usr/libexec/rpcd/netwiz_dev
chmod +x luci-app-netwiz/root/usr/libexec/netwiz-autodetect.sh
chmod +x luci-app-netwiz/root/usr/libexec/netwiz-monitor-loop.sh
chmod +x luci-app-netwiz/root/etc/init.d/netwiz-monitor
chmod +x luci-app-netwiz/root/etc/init.d/netwiz-recovery
chmod +x luci-app-netwiz/root/etc/hotplug.d/dhcp/99-netwiz-guard
```
---

```bash
luci-app-netwiz/
├── README.md                   # Project documentation (Features, Installation, Changelog, OTA updates)
├── LICENSE                     # Open source license
├── Makefile                    # OpenWrt standard Makefile (Package definition, Dependencies)
│
├── htdocs/                     # 🌐 Frontend UI Layer (Static resources)
│   └── luci-static/resources/view/
│       ├── netwiz.css          # Global stylesheet (Modals, Responsive design, UI polishing)
│       ├── netwiz.js           # Frontend Core 1: Wizard Engine (Network config, Smart backup & restore, QR code dispatcher)
│       ├── netwiz_dev.js       # Frontend Core 2: Manager Engine (Device radar, Smart subnetting, UI interactions)
│       └── qrcode.min.js       # Frontend Dependency: Pure local micro QR code generator (Enables scan-to-connect)
│
├── po/                         # 🌍 i18n (Internationalization)
│   ├── zh_Hans/netwiz.po       # Simplified Chinese dictionary
│   └── zh_Hant/netwiz.po       # Traditional Chinese dictionary
│
└── root/                       # ⚙️ Backend System Layer (Mapped to router's / directory upon installation)
    ├── etc/
    │   ├── config/
    │   │   └── netwiz          # Underlying config store (Wizard states, Manager groups, Device timestamps)
    │   │
    │   ├── init.d/             # [Wizard Engine Daemon Modules]
    │   │   ├── netwiz-monitor  # Resident monitor daemon (Starts/Stops monitoring engine)
    │   │   └── netwiz-recovery # Power-loss auto-recovery service (START=15, Prevents disconnects on failed configs)
    │   │
    │   └── hotplug.d/dhcp/     # 🛡️ [Manager Engine Stealth Guard Module]
    │       └── 99-netwiz-guard # Anti-MAC-spoofing trigger (Event-driven microsecond interception)
    │
    └── usr/
        ├── libexec/
        │   ├── netwiz-autodetect.sh   # WAN protocol auto-detection engine
        │   ├── netwiz-monitor-loop.sh # Wizard debounce and fallback loop logic
        │   │
        │   └── rpcd/           # 🔌 RPC Interface Layer (Frontend-Backend communication bridge)
        │       ├── netwiz      # Backend API 1: Wizard dedicated (Underlying protocol mods, Capsule validation)
        │       └── netwiz_dev  # Backend API 2: Manager dedicated (ARP/DHCP ops, Crash self-rescue, Silent cleanup)
        │
        └── share/
            ├── luci/menu.d/
            │   └── luci-app-netwiz.json # System menu entry registration
            └── rpcd/acl.d/
                └── luci-app-netwiz.json # UBUS Access Control List (Authorizes frontend to access backend APIs)
```
---

<img width="680" alt="Image" src="https://github.com/user-attachments/assets/b2fca517-cbd2-4aa0-b557-bac5fd557dba" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/cce37944-d90a-4653-923c-d957812d8f37" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/8cae623d-766f-49a8-8c6c-ab78738d6b88" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/f0bd7bf8-16b7-4955-9a83-55673a7bf66e" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/ea664013-9f76-49e3-b10f-8307dbb6fc24" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/5c0370fc-efd9-4e51-be3c-ed35233786d6" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/bd4afb47-0dec-4606-91a3-da47e99ca6e0" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/51c10c7b-85df-4f69-b456-ea7523696ae5" />
<img width="680" alt="Image" src="https://github.com/user-attachments/assets/8603b708-59c6-4a6d-b953-a83a26b00ef9" />

---
