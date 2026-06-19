/*
 * Copyright (C) 2026 huchd0 <https://github.com/huchd0/luci-app-netwiz>
 * Licensed under the GNU General Public License v3.0
 */
'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var T = {
    'Network_Wizard': _('Network Wizard'),
    'TITLE': _('Netwiz NETWORK SETUP'),
    'SUBTITLE': _('Pure · Secure · Non-destructive Minimalist Config'),
    'APP_VERSION': 'v1.4.0', 
    'MODE_ROUTER_TITLE': _('Secondary Router Mode'),
    'MODE_ROUTER_DESC': _('Upstream network dials up, this device acts as a secondary router.'),
    'MODE_PPPOE_TITLE': _('PPPoE Dial-up'),
    'MODE_PPPOE_DESC': _('Dial up directly using account and password on this device.'),
    'MODE_LAN_TITLE': _('LAN Settings'),
    'MODE_LAN_DESC': _('Change device LAN IP, switch to AP Wired Relay mode, or one-click IPv6 distribution.'),
    'MODE_WIFI_TITLE': _('Wi-Fi Settings'),
    'MODE_WIFI_DESC': _('Set Wi-Fi name, password, enable Wireless Relay (WISP) and Seamless Roaming.'),
    'TITLE_WIFI': _('Configure Wi-Fi'),
    'LBL_SMART_CONN': _('Smart Connect (All Bands)'),
    'LBL_WIFI_SWITCH': _('Enable Wi-Fi'),
    'LBL_WIFI_2G_EN': _('Enable 2.4G Wi-Fi'),
    'LBL_WIFI_5G_EN': _('Enable 5G Wi-Fi'),
    'PH_WIFI_SSID': _('e.g., My_WiFi'),
    'LBL_SSID': _('Network Name (SSID)'),
    'LBL_WIFI_PASS': _('Wi-Fi Password'),
    'LBL_WIFI_ENC': _('Encryption'),
    'LBL_5G2_SSID': _('Network Name (5G_Game)'),
    'LBL_5G2_PWD': _('Wi-Fi Password (5G_Game)'),
    'LBL_ADVANCED': _('Advanced Settings'),
    'LBL_ADVANCED_CLOSE': _('Hide Advanced'),
    'LBL_HIDE_SSID': _('Hide Wi-Fi Name (SSID)'),
    'LBL_CHANNEL': _('Channel'),
    'LBL_BANDWIDTH': _('Channel Width'),
    'LBL_MODE': _('Wireless Mode'),
    'OPT_AUTO': _('Auto'),
    'LBL_LEGACY_B': _('Enable 802.11b (Legacy Mode)'),
    'DESC_LEGACY_B': _('Only enable if very old IoT devices cannot connect.'),
    'OPT_NONE': _('No Password (Open)'),
    'OPT_PSK2': _('WPA2-PSK (Stable)'),
    'OPT_SAE': _('WPA3-SAE (Secure)'),
    'OPT_PSK2SAE': _('WPA2/WPA3 Mixed (Recommended)'),
    'TAB_2G': _('2.4G Wi-Fi'),
    'TAB_5G': _('5G Wi-Fi'),
    'M_INC_WIFI': _('SSID cannot be empty.'),
    'M_PWD_SHORT': _('Wi-Fi password must be at least 8 characters.'),
    'ACT_WIFI': _('Applying Wi-Fi Settings'),
    'M_MODE_WARN_TIT': '⚠️ ' + _('Severe Warning'),
    'M_MODE_WARN_MSG': _('Forcibly modifying the wireless physical mode may cause the hardware driver to crash or the Wi-Fi to disappear permanently if the chip does not support it! It is highly recommended to keep it on [Auto].<br><br>Are you absolutely sure you want to change this?'),
    'LOADING_CONFIG': _('Reading underlying config...'),
    'BTN_HOME': _('Back to Home'),
    'TITLE_WAN': _('Configure WAN'),
    'LBL_CONN_TYPE': _('Connection Type'),
    'OPT_DHCP': _('DHCP (Auto)'),
    'OPT_STATIC': _('Static IP'),
    'LBL_IP': _('Static IP'),
    'LBL_GW': _('Gateway'),
    'PH_IP': _('e.g., 192.168.1.2'),
    'PH_GW': _('e.g., 192.168.1.1'),
    'TITLE_PPPOE': _('PPPoE Credentials'),
    'LBL_USER': _('PPPoE Username'),
    'PH_USER': _('Enter PPPoE username'),
    'LBL_PASS': _('PPPoE Password'),
    'PH_PASS': _('Enter PPPoE password'),
    'TITLE_LAN': _('Configure LAN'),
    'LBL_IPV6': _('Enable IPv6 (DHCPv6)'),
    'TIP_IPV6_DESC': _('When enabled, [Terminal Device & IP Binding] can assign short IPv6 addresses to PCs.'), 
    'LBL_FORCE_APPLY': _('Safe Mode (Recommended ON)'),
    'DESC_FORCE_APPLY': _('If enabled, the system will auto-revert if you lose connection within 120s.'),
    'MSG_SAFE_OFF': _('Safe mode disabled. Applying immediately without rollback protection...'),
    'LBL_BYPASS': _('Enable AP Wired Relay'),
    'WARN_BYPASS': _('<b style="font-size: 16px;">AP Wired Relay Enabled:</b><br>1. DHCP will be disabled. <b style="color: #059669;">Devices must use static IPs or get IPs from upstream.</b><br>2. If LAN IP changes, ensure your client is in the same subnet to avoid <b style="color: #059669;">losing access</b>.'),
    'WARN_MAIN': _('<b style="font-size: 16px;">Main Router Mode Enabled:</b><br>1. DHCP will be enabled. This device assigns IPs.<br>2. If LAN IP changes, ensure your client is in the same subnet to avoid <b style="color: #ef4444;">losing access</b>.'),
    'LBL_LAN_IP': _('Device LAN IP'),
    'LBL_LAN_GW': _('LAN Gateway'),
    // ===== 一键探测与拦截防呆新增 =====
    'BTN_AUTO_DETECT': _('Auto Detect'),
    'MSG_DETECT_SUCC': _('Upstream subnet detected, recommended IP assigned'),
    'MSG_DETECT_FAIL': _('Detection failed, cannot get upstream gateway'),
    'M_DETECT_OP_INV_TIT': _('Invalid Operation'),
    'M_DETECT_OP_INV_MSG': _('In Main Router mode, LAN Gateway MUST be empty.<br><br>"Auto Detect" is only for AP/Relay mode!'),
    'M_DETECT_PPPOE_TIT': _('Critical Intercept'),
    'M_DETECT_PPPOE_MSG': _('System detected WAN is <b style="color:#3b82f6;">PPPoE Dial-up</b>.<br><br>The acquired <b>{gw}</b> is the ISP BRAS gateway!<br><b style="color:#ef4444;">NEVER set this as LAN gateway</b>, or your network will crash!'),
    
    'PH_LAN_GW': _('Blank for Main, required for AP Wired Relay'),
    'BTN_BACK': _('Back'),
    'BTN_NEXT': _('Next Step'),
    'BTN_EDIT': _('Back to Edit'),
    'TITLE_CONFIRM': _('Confirm Configuration'),
    'DESC_CONFIRM': _('The following settings will be applied, please verify:'),
    'NOTE_TITLE': _('Application Notes:'),
    'NOTE_1': _('After confirmation, the network will restart and apply new settings.'),
    'NOTE_2': _('The system will auto-refresh or redirect in 15 seconds.'),
    'BTN_APPLY': _('Apply Settings'),
    'STAT_BYPASS': _('AP Wired Relay'),
    'CURRENT_MODE': _('Current:'),
    'STAT_MAIN_PPPOE': _('Main Router (PPPoE)'),
    'STAT_SEC_DHCP': _('Secondary Router (DHCP)'),
    'STAT_SEC_STATIC': _('Secondary Router (Static IP)'),
    'STAT_LAN': _('LAN Mode'),
    'TXT_DEV_IP': _('Device IP:'),
    'TXT_UP_GW': _('Upstream GW:'),
    'TXT_PUB_IP': _('Public IP:'),
    'TXT_REM_GW': _('Remote GW:'),
    'TXT_LAN_IP': _('LAN IP:'),
    'TXT_STATUS': _('Status:'),
    'TXT_WAIT_REM': _('Waiting for remote response'),
    'TXT_WAN_IP': _('WAN IP:'),
    'TXT_GET_IP': _('Getting IP...'),
    'TXT_DHCP_SRV': _('DHCP Service:'),
    'TXT_ON': _('Enabled'),
    'TXT_OFF': _('Disabled'),
    'BDG_SUCC': _('Dial Success'),
    'BDG_DIAL': _('Dialing / Disconnected'),
    'BDG_GOT': _('IP Acquired'),
    'BDG_WAIT': _('Waiting for IP...'),
    'BDG_CONN': _('Interface Connected'),
    'BDG_UNPLUG': _('Cable Unplugged'),
    'TXT_GETTING': _('Getting...'),
    'TXT_NOT_GOT': _('Not acquired'),
    'TXT_NOT_SET': _('Not set'),
    'M_INC_TIT': _('Incomplete info'),
    'M_INC_IP': _('Device IP cannot be empty.'),
    'M_INC_WAN': _('Static IP and Gateway cannot be empty.'),
    'M_INC_PPPOE': _('PPPoE username and password cannot be empty.'),
    'M_FMT_TIT': _('Format Error'),
    'M_FMT_IP': _('The device IP is invalid, please check!'),
    'M_FMT_WAN': _('WAN IP is invalid, please check!'),
    'M_FMT_GW': _('Gateway IP is invalid, please check!'),
    'M_LOGIC_TIT': _('Logic Error'),
    'M_LOGIC_BYP': _('AP Wired Relay requires an upstream gateway IP.'),
    'M_SAME_GW': _('WAN Static IP MUST NOT be the same as the gateway!'),
    'M_SAME_BYP': _('In AP/Relay mode, the device IP MUST NOT be the exact same as the Gateway! (') + '💡 ' + _('Tip: The Gateway should be the LAN IP of your upstream main router, and this device needs its own unique IP)'),
    'M_NO_MOD_TIT': _('No Changes Needed'),
    'M_NO_MOD_MSG': _('Your settings match the current router config exactly.'),
    'M_EXIT': _('Exit to Home'),
    'M_CFLT_TIT': _('Conflict Blocked'),
    'M_CFLT_IP': _('The WAN IP cannot be the same as the current LAN IP ({ip})!'),
    'M_CFLT_SUB1': _('The WAN port cannot be in the same subnet as the LAN ({ip})!'),
    'M_CFLT_SUB2': _('This causes a routing loop.'),
    'M_CFLT_SUGGEST': _('Suggestion: Your upstream network uses the same IP subnet. Please go to [LAN Settings] first and change your Device LAN IP (e.g. to 192.168.10.1) to prevent network crash.'),
    'M_SUB_ERR_TIT': _('Subnet Error'),
    'M_SUB_ERR_WAN1': _('The WAN Static IP must be in the same subnet as the Gateway!'),
    'M_SUB_ERR_WAN2': _('e.g., if gateway is {gw}, the IP must be {ip}.x'),
    'M_SUB_ERR_BYP': _('In AP/Relay mode, the device IP must be in the same subnet as the Gateway! (') + '💡 ' + _('Tip: The Gateway should be the LAN IP of your upstream main router)'),
    'M_WARN_TIT': _('Config Warning'),
    'M_WARN_MSG': _('You selected [Main Router Mode] but filled in the [Gateway].<br><br><b>For a standard main router, the gateway must be blank.</b> Entering a gateway may cause the device to fail at distributing network, leading to a total outage!<br><br>Are you sure you want to do this?'),
    'M_WARN_BTN': _('Force Apply'),
    'M_SYS_ERR': _('System Exception'),
    'M_SYS_MSG': _('Cannot read underlying config for validation, please refresh.'),
    'M_APP_MSG': _('Writing request, please wait...'),
    'M_RST_TIT': _('Applying Configuration'),
    'M_CLOSE': _('Close'),
    'M_ACCT': _('Account'),
    'M_PWD': _('Password'),
    'M_IP_GW': _('IP & Gateway'),
    'M_AUTO_UP': _('Auto-assigned by upstream router'),
    'LBL_TARGET': _('Target:'),
    'ACT_LAN': _('Modifying LAN IP'),
    'ACT_BYPASS': _('Switching to AP Wired Relay'),
    'ACT_WAN_DHCP': _('Switching WAN to DHCP'),
    'ACT_WAN_STATIC': _('Switching WAN to Static IP'),
    'ACT_PPPOE': _('Applying PPPoE Dial-up'),
    'MSG_WRITING': _('Writing configuration to system, please do not close the page...'),
    'MSG_KNOCKING': _('Connecting to new IP... Config will auto-rollback upon timeout.'),
    'MSG_WAIT_NET': _('Waiting for network service to restart... Elapsed: {sec}s'),
    'MSG_WAIT_OLD': _('Waiting for router to safely restore... Elapsed: {sec}s'),
    'MSG_TIMER': _('Rollback countdown: <b style="color:#f59e0b;">{sec}</b> / {total} s'),
    'MSG_MANUAL_VISIT': _('If IP changed, please update PC IP. Auto-redirecting when connected...'),
    'MSG_ABANDONING': _('Waiting for router to abort changes and restore network...'),
    'TXT_WIFI_STATUS': _('Wi-Fi Status'),
    'TXT_5G_ACCT': _('5G Wi-Fi Account'),
    'TXT_2G_ACCT': _('2.4G Wi-Fi Account'),
    'TXT_NO_PASS': _('No Password'),
    // 中继功能词条
    'LBL_WISP_EN': _('Enable Wireless Relay (WISP)'),
    'DESC_WISP': _('Receive upstream Wi-Fi and broadcast your own network.'),
    'BTN_SCAN': '🔄 ' + _('Scan Nearby Wi-Fi'),
    'MODAL_WISP_TITLE': _('Select Upstream Network'),
    'WISP_PWD_PROMPT': _('Password for upstream:'),
    'TXT_WISP_ON': _('WISP Enabled'),
    // 扫描与错误提示词条
    'TXT_SCANNING': '⏳ ' + _('Scanning...'),
    'TXT_NO_NETWORKS': _('No networks found.'),
    'TXT_SCAN_FAILED': _('Scan failed. Driver might be busy.'),
    'LBL_ROAMING': _('802.11k/v/r Fast Roaming'),
    'DESC_ROAMING': _('Enable seamless roaming between routers with one click (Prerequisite: Same SSID, password, and LAN). Note: May cause connection issues with older smart home (IoT) devices.'),
    'TXT_TARGET_SSID': _('Target Wi-Fi'),
    'PH_WISP_PWD': _('Upstream Wi-Fi Password'),
    'TXT_ROAM_DIRTY': '⚠️ ' + _('Manual Configuration Warning'),
    'DESC_ROAM_DIRTY': _('Underlying parameter mismatch detected, which may cause roaming failures. Please toggle this switch off and on again, then save to apply the standard seamless roaming profile.'),
    'TXT_ROAMING': _('Roaming'),
    'TXT_ROAMING_ON': _('Roaming Enabled'),
    'TXT_CLICK_FIX': _('Click to Fix'),
    'TXT_CLICK_GOTO': _('Click to Settings'),
    'MSG_WAN_AUTODETECT': _('WAN Blind-Switch: Unplug the WAN cable for 10 seconds and reconnect to auto-detect and switch the connection type (takes about 2 mins).'),
    'TXT_NEW_MOD': _('New Config'),
    'TXT_MODIFIED': _('Modified'),
    'M_OPEN_WARN_TIT': _('Security Warning'),
    'M_OPEN_WARN_MSG': _('You are setting up an Open Wi-Fi network without a password. Anyone nearby will be able to connect and access your network.<br><br>Are you sure you want to continue?'),
    // ===== 向导词条 =====
    'WIZ_TITLE': _('Quick Setup Wizard'),
    'WIZ_PWD': _('Step 1: Admin Password'),
    'WIZ_WAN': _('Step 2: Internet Setup'),
    'WIZ_WIFI': _('Step 3: Wi-Fi Setup'),
    'WIZ_CONFIRM': _('Step 4: Confirm & Apply'),
    'LBL_CONFIRM_PWD': _('Confirm Password'),
    'PH_CONFIRM_PWD': _('Enter password again'),
    'M_PWD_MISMATCH': _('Passwords do not match, please try again!'),
    'WIZ_SKIP': _('Skip this time'),
    'TXT_NOT_CONFIGURED': _('Not configured (Keep current)'),
    'WIZ_WIFI_DESC': _('Set your wireless network name and password.'),
    'WIZ_HIDE': _("Don't show this again"),
    'WIZ_REOPEN': '✨ ' + _('Reopen Wizard'),
    'WIZ_SKIP_WIFI': _('Skip Wi-Fi Setup (Keep current)'),
    'TXT_UNSET': _('Not set'),
    'TXT_NO_PWD_OPEN': _('No Password (Open)'),
    'BTN_DEV_BIND': _('Terminal Device & IP Binding'),
    'TXT_DNS1': _('Primary DNS:'),
    'TXT_DNS2': _('Secondary DNS:'),
    'TIP_IPV6_WARN':_('Non-standard parameters (Default configuration recommended)'),
    'PH_PWD_TIP': '💡 ' + _('This password will be used for logging into the router web interface and SSH. Setting it now is highly recommended.'),
    // ===== 新增防呆与冲突拦截词条 =====
    'M_WAN_DOWN_TIT': _('Cable Unplugged or Wrong Port'),
    'M_WAN_DOWN_MSG': _('System detected NO SIGNAL on the <b>WAN port</b>!<br><br><b style="color:#ef4444;">') + '💡 ' + _('Troubleshooting:</b><br>1. Did you plug the upstream cable into the <b>LAN port</b>?<br>2. Are both ends plugged in tightly? Is the modem powered on?<br>'),
    'M_WAN_DOWN_WAIT': _('Detecting in background... This will close automatically once connected.'),
    'BTN_IGNORE_WAN': _('I am an AP / Ignore for now'),
    'M_CFLT_GLOBAL_TIT': _('Severe Warning: Routing Loop'),
    'M_CFLT_GLOBAL_MSG': _('System detected that the upstream network (<b style="color:#ef4444;">{wan_ip}</b>) and the LAN (<b style="color:#ef4444;">{lan_ip}</b>) are in the same subnet!<br><br>This will crash the router. <b style="color:#059669;">Please confirm or modify the new LAN IP below and click auto-evade:</b><br><br>'),
    'BTN_FIX_CONFLICT': _('Modify and Restart Network'),
    'M_INVALID_IP_FMT': '❌ ' + _('Invalid IP format! System restored safe default, please confirm.'),
    'M_STILL_CONFLICT': '❌ ' + _('Still conflicting! The modified IP is still in the same subnet as upstream.\nSystem restored safe default, please change the 3rd number!'),
    'M_WARN_UNSAVED': _('IMPORTANT:\n\nTo resolve the fatal network loop, the system must change LAN IP and restart immediately.\n\nChanges you made on this page will NOT be saved.\nPlease reconfigure after the network restarts and redirects to the new IP.\n\nContinue to fix conflict?'),
    'M_CFLT_INTERCEPT_TIT': _('Network Conflict Blocked'),
    'M_CFLT_WIZ_MSG': _('Upstream network ({wan_ip}) conflicts with local LAN ({lan_ip})!<br><br>Please click below to safely evade to: <b>{safe_ip}</b> to finish setup.'),
    'BTN_AUTO_EVADE': _('Auto Evade'),
    'M_CFLT_CROSS_TIT': _('Cross-Subnet Loop Blocked'),
    'M_CFLT_CROSS_MSG': _('The LAN IP ({ip}) you set is in the same subnet as your upstream network ({wan_ip}), which will crash the router!<br><br>Suggested evasion to: <b>{safe_ip}</b>'),
    'BTN_FIX_APPLY': _('Fix and Apply'),
    'BTN_EDIT_MYSELF': _('Edit Manually'),
    'M_CFLT_ROUTER_MSG': _('Upstream network ({wan_ip}) conflicts with local LAN ({lan_ip})!<br><br>You MUST change device LAN IP. Suggested evasion to: <b>{safe_ip}</b>'),
    'M_CFLT_PHYSICAL_TIT': _('Severe Physical Conflict'),
    'M_CFLT_PHYSICAL_WAN_MSG': _('The WAN Static IP ({ip}) you set is exactly the same as the upstream Gateway!<br><br>This causes a severe physical loop. Please change your Static IP (e.g., {suggest_ip}).'),
    'M_CFLT_PHYSICAL_BYP_MSG': _('The AP IP ({ip}) you set is exactly the same as the upstream Gateway!<br><br>This will paralyze the network. Please change to another free IP (e.g., {suggest_ip}).'),
    'LBL_NEW_PWD': _('Router Admin Password (Optional)'),
    'PH_NEW_PWD': _('Keep empty to retain current password'),
    'WIZ_SKIP_TITLE': _('Skip Wizard'),
    'WIZ_SKIP_MSG': _('Releasing wizard lock, entering official dashboard...'),
    'M_PWD_REQ': _('Please enter a new password or check "Skip Password Setup"!'),
    'TAG_SMART': _('Smart Connect'),
    'TAG_SPLIT': _('Independent Bands'),
    'TAG_WISP': _('WISP Repeater'),
    'TAG_DISABLED': _('Disabled'),
    'MSG_SYS_NOT_READY': _('The underlying network status is not fully loaded. Please wait before submitting to prevent configuration loss.'),
    'MSG_SETUP_DONE': _('Configuration complete! Automatically logging you in...'),
    'MSG_PWD_FAIL': _('Password setup failed: '),
    'MSG_NO_WIFI_TIP': _('No Wi-Fi hardware detected, this step will be skipped automatically.<br>Please click [Next Step] directly.'),
    
    // 高级与实验室功能词条
    'LBL_LAB_TITLE': _('Advanced & Lab Features'),
    'LBL_LAB_BETA': _('Beta'),
    'TXT_FULL_BACKUP_TIT': _('Full Software Backup & Restore'),
    'TXT_FULL_BACKUP_DESC': _('Resolves traditional backup soft-brick risks. Smart backup is cross-version compatible. After flashing new firmware, upload backup to <span style=\"color:#ef4444; font-weight:bold;\">rapidly reinstall all software and losslessly restore configs (Requires Internet)</span>. Does not delete current software during restore. For absolute purity, factory reset the router first.<br><span style=\"color:#ef4444; font-weight:bold;\">Tip: If the backup shows Missing packages, manually place the installation packages in the /etc/netwiz/custom_pkgs/ directory.</span><br>If Netwiz is missing after a reset or needs an upgrade, connect to the internet and run this in SSH:'),
    'BTN_SMART_BACKUP': '📦 ' + _('Generate Backup'),
    'BTN_SMART_RESTORE': '⚡ ' + _('Restore System'),
    'TXT_COPY_TIP': '📋 ' + _('Click to Copy'),
    'TXT_COPIED': '✅ ' + _('Copied'),
    'TXT_COPY_FAIL': '❌ ' + _('Copy Failed'),

    // 备份提示
    'M_BAK_SEL_TIT': '📦 ' + _('Select Backup Mode'),
    'M_BAK_LIGHT_TIT': _('Lightweight Backup'),
    'M_BAK_LIGHT_SUB': _('Recommended'),
    'M_BAK_FULL_TIT': _('Full Backup'),
    'M_BAK_FULL_SUB': _('Includes Dependencies'),
    'M_BAK_LIGHT_DESC': _('<b style="color: #F00;">Lightweight Backup:</b> Only packs core configs (Passwords/Wi-Fi/IP) and main plugin packages. Fast and requires no extra RAM. Requires internet or built-in dependencies when restoring.'),
    'M_BAK_FULL_DESC': _('<b style="color: #F00;">Full Backup:</b> Packs core configs and recursively downloads ALL underlying dependencies for third-party plugins. Large size, slower generation. <b style="color: #F00;">NO internet required</b> during restore. Recommended for devices with >256MB RAM.'),
    'BTN_START_BAK': _('Start Backup'),
    'M_BAK_GEN_TIT': '📦 ' + _('Generating Backup'),
    'M_BAK_GEN_MSG': _('Extracting configs and packing files in background...'),
    'M_BAK_HINT_FULL': _('Note: Full mode selected, downloading all dependencies. Takes 1-3 mins, please wait.'),
    'M_BAK_HINT_LIGHT': _('Note: Lightweight mode selected, packing is very fast (~30s).'),
    'M_BAK_SUCC_TIT': '✅ ' + _('Backup Successful'),
    'M_BAK_SUCC_MSG': _('Backup capsule downloaded. Upload this file after flashing new firmware to restore.'),
    'M_BAK_FAIL_TIT': '❌ ' + _('Backup Failed'),
    'M_BAK_FAIL_MSG': _('Unable to start background backup task.'),

    // 恢复提示
    'M_RST_CONFIRM_TIT': '⚡ ' + _('Confirm System Restore'),
    'M_RST_CONFIRM_MSG': _('<span style="color:#ef4444; font-weight:bold;">WARNING: This will overwrite current configs and reinstall plugins!</span><br><br>Router will auto-reboot upon completion. Ensure file is correct.<br><br><span style="color:#059669; font-size: 14px;">') + '🛡️ ' + _('Safe Mode: Auto-rollback if connection is lost for 300s.</span><br><br>'),
    'M_RST_REGRET_PILL': _('Auto-download current state backup before restore (Regret Pill)'),
    'BTN_CONFIRM_SEL': _('Confirm & Select File'),
    'M_RST_NATIVE_TIT': '⚡ ' + _('Native Fast Restore Mode'),
    'MSG_RESTORE_UPLOADING': _('Transferring capsule via high-speed system channel...<br><br><b style="color:#ef4444;">DO NOT power off. Router will auto-reboot upon completion.</b><br><br><span style="color:#059669; font-size: 14px;">') + '🛡️ ' + _('Safe Mode: Auto-rollback if connection is lost for 300s.</span>'),
    'M_ERR_WIZ_FAILED': _('Wizard execution failed'),
    'M_ERR_DATA_PROC': _('Configuration data processing failed'),
    'M_ERR_VALIDATE': _('Input validation failed'),
    'M_RST_DELIVERED': '✅ ' + _('Capsule delivered, preparing offline task...'),
    'M_RST_BLOCKED_TIT': '❌ ' + _('Restore Blocked by Security'),
    'M_RST_BLOCKED_MSG': _('Self-healing mechanism triggered. Garbage cleared, router is safe and unharmed.'),
    'M_RST_TRANS_FAIL': '❌ ' + _('Transfer Failed'),
    'M_RST_TRANS_REJECT': _('Interface rejected reception, status code: '),
    'M_RST_NET_ERR': '❌ ' + _('Network Error'),
    'M_RST_NET_INTR': _('File transfer interrupted unexpectedly, check network!'),
    'M_RST_PILL_TIT': '💊 ' + _('Preparing Regret Pill'),
    'M_RST_PILL_MSG': _('Backing up current state to prevent regrets...<br><br><span style="font-size:12px; color:#10b981;">Tip: Restore will begin automatically after download</span>'),
    'M_RST_PROBE_TIT': '🔍 ' + _('Probing Environment'),
    'M_RST_PROBE_MSG': _('Calculating system available RAM and storage...'),
    'M_BAK_OOM_TIT': '⚠️ ' + _('Critical RAM Shortage'),
    'M_RST_OOM_MSG': _('Your full capsule size is <b style="color:#ef4444;">{size} MB</b>.<br><br>But /tmp (RAM) only has <b style="color:#ef4444;">{avail} MB</b> free!<br><br>Force uploading will <b style="color:#f00;">cause OOM, crash, and network drop</b>.<br><br><b>Solution:</b> Please <b style="color:#10b981;">reboot the router</b> once to clear RAM fragments, then retry.'),
    'BTN_CANCEL_RST': _('Cancel Restore'),

    // 后端执行状态映射代码
    'MSG_RST_WAIT': _('Waiting for background task to start...'),
    'MSG_RST_INIT': _('Capsule delivered, initializing restore environment...'),
    'MSG_RST_SCAN': _('Scanning capsule structure to estimate uncompressed size (5-10s)...'),
    'MSG_RST_OOM_INTERCEPT': _('Uncompressed size reaches {u}MB, but RAM only has {a}MB left! Intercepted to prevent router crash.'),
    'MSG_RST_SAFE': _('Size safe! Extracting backup capsule...'),
    'MSG_RST_FAIL': _('Extraction failed! Capsule may be corrupted, initiating self-healing...'),
    'MSG_RST_CONF': _('Extraction successful, applying core configs...'),
    'MSG_RST_PKGS': _('Force offline installing plugins (this takes a while, please wait)...'),
    'MSG_RST_DONE': _('Restore thoroughly complete! Router will auto-reboot!'),
    'MSG_RST_INVALID': _('Invalid capsule file! NetWiz signature missing, intercepted for security.'),
    'V6_NAT_ERR_TIT1': '🚨 ' + _('Severe Network Topology Conflict!'),
    'V6_NAT_ERR_MSG1': _('System detected that IPv6 and LAN "Masquerading (NAT)" are <b>BOTH enabled</b>!This will paralyze IPv6 allocation and cause routing loops.<br>👉 <b>Fix:</b> Please go to <code>Network -> Firewall</code> to disable LAN Masquerading, or <b style="color:#ef4444;">Disable IPv6</b> in the LAN settings on the Netwiz homepage.'),
    'V6_NAT_ERR_TIT2': '⚠️ ' + _('IPv6 Configuration Blocked'),
    'V6_NAT_ERR_MSG2': _('Detected that LAN "IP Masquerading (NAT)" is enabled. Forcing IPv6 on under a double-NAT topology will cause network disconnection.<br>👉 <b>Fix:</b> Please go to <code>Network -> Firewall -> Zones</code> to disable LAN Masquerading first.'),
    'MSG_REBOOTING': _('System is rebooting, please wait...'),
    'MSG_WAIT_OFFLINE': _('Waiting for device to disconnect...'),
    'TIT_IP_CONFLICT': _('IP Conflict Warning'),
    'MSG_IP_IN_USE': _('is already used by another device!'),
    'MSG_SUGGEST_FIX': _('We strongly recommend changing it to avoid network crashes.'),
    'BTN_FIX_IP': _('Fix to'),
    'MSG_SCAN_PKGS': _('Scanning installed plugins...'),
    'TIT_PKG_CHECK': _('Plugin Backup Status'),
    'MSG_CUSTOM_PKG_DESC': _('Please verify backup packages:'),
    'MSG_CUSTOM_PKG_ACT': _('If you proceed, missing plugins WILL NOT be restored automatically!'),
    'MSG_CUSTOM_PKG_TIP': _('Tip: Manually place missing packages .ipk/.apk into the /etc/netwiz/custom_pkgs/ directory via SSH to ensure they are automatically reinstalled during future restorations.'),
    'BTN_IGNORE_BAK': _('Ignore & Backup'),
    'TIT_ARCH_CONFLICT': _('Architecture Conflict Warning'),
    'MSG_RESTORE_ARCH_TIP': _('Architecture Safety Lock: Cross-package manager restoration (e.g., IPK to APK) is strictly prohibited. The underlying network and firewall configurations differ significantly across these system versions. Forcing a restore will cause severe network failure and brick your router!'),
    'BTN_FORCE_RESTORE': _('Force Restore Config'),
    'TXT_MISSING_PKGS': _('Missing packages:'),
    'TXT_PROVIDED_PKGS': _('Manually placed in custom_pkgs:'),
    'TIT_CUSTOM_PKG_READY': _('Custom Plugins Ready'),
    'MSG_CUSTOM_PKG_READY_DESC': _('Great! Your custom plugins are safely stored in the local directory and will be included in the backup capsule.'),
    'BTN_CONFIRM_BACKUP': _('Confirm Backup'),
    'TXT_OFFICIAL_PKGS': _('Auto-backup plugins:'),
    'TIT_OFFICIAL_PKG_READY': _('Plugin Scan Complete'),
    'MSG_OFFICIAL_PKG_READY_DESC': _('System scan complete! All your installed plugins are from the official repository and will be safely recorded for automatic restoration.'),
    'M_OOM_TITLE': '⚠️ ' + _('Backup Interrupted Warning'),
    'M_OOM_HEAD': _('Out of Memory (OOM Protection)!'),
    'M_OOM_DESC': _('The files you are trying to pack are too large and exceed the available memory.<br><br>To prevent device crash, the backup task has been safely canceled. Please clear unnecessary core files and try again.'),
    'M_I_KNOW': _('I Got It'),
    'M_SCAN_TIMEOUT_TITLE': '⚠️ ' + _('Scan Timeout Warning'),
    'M_SCAN_TIMEOUT_HEAD': _('Communication Timeout or Network Error'),
    'M_SCAN_TIMEOUT_DESC': _('Communication with the router timed out (possibly due to slow network source retrieval or network fluctuations).<br><br>To ensure backup integrity, the task has been safely canceled. Please try again later, or manually run opkg update via SSH.'),
    'TXT_WISP_WAITING': _('Connecting...'),
    'MSG_WISP_STUCK': '⚠️ ' + _('Connecting to upstream... (Check password or signal strength if stuck)'),
    'M_FIRST_SYNC_TITLE': '🔄 ' + _('First Time Syncing'),
    'M_FIRST_SYNC_SUB': _('Syncing lists in the background...'),
    'M_FIRST_SYNC_DESC': _('Verifying the list of plugins for automatic backup...<br><br>Depending on the network, this usually takes <b>15 to 20 seconds</b>.<br>The system is verifying, please wait...'),
    'M_SYNC_OK': _('OK, I will try again later'),
    'MSG_RST_PKG_ERR': '🚨 ' + _('RESTORE FAILED: Package manager mismatch (apk vs ipk). Please use firmware with the same underlying system.'),
    'MSG_RST_ARCH_ERR': '🚨 ' + _('RESTORE FAILED: CPU Architecture mismatch. Forcing this restore will brick your router! Process aborted.'),
    'TIT_PKG_CONFLICT': _('Package Manager Conflict'),
    'TIT_ARCH_CONFLICT': _('CPU Architecture Conflict'),
    'MSG_PKG_ERR_APK':  '🚨 ' + _('Your current system uses the apk architecture, but you are trying to flash an ipk backup!'),
    'MSG_PKG_ERR_OPKG':  '🚨 ' + _('Your current system uses the opkg architecture, but you are trying to flash an apk backup!'),
    'MSG_ARCH_ERR_UI': _('Architecture mismatch! (Current router: {arch})'),
    'MSG_ARCH_ERR_DESC': _('The backup package you selected belongs to a different hardware architecture. Forcing this restore will brick your router!'),
    'MSG_FAST_BLOCK': _('The frontend security system has instantly blocked this dangerous operation.'),
    'TIT_ARCH_WARN': _('Architecture Warning'),
    'MSG_ARCH_WARN_1': _('No architecture identifier ({arch}) detected in the selected backup filename.'),
    'MSG_ARCH_WARN_2': _('If you have <b>manually renamed</b> this file, please ignore this warning.<br><br><span style="color:#ef4444;">If it is the wrong package, the system\'s underlying security mechanism will forcibly intercept the restoration later!</span>'),
    'BTN_WARN_CONTINUE': _('I understand, continue'),
    'TXT_SCAN_TO_CONN': _('Scan to Connect'),
    'WARN_PPPOE_INVALID': '⚠️ ' + _('Current WAN is in Secondary Router mode. PPPoE dial-up will not take effect until applied.'),
    'WARN_ROUTER_INVALID': '⚠️ ' + _('Current WAN is in PPPoE mode. Secondary Router mode will not take effect until applied.'),
    // ===== 高级设置 =====
    'LBL_ADV_UTILS_TITLE': '⚙️ ' + _('Advanced Utilities'),
    'LBL_MAC_CLONE_LINK': '🔗 ' + _('MAC Address Clone'),
    'LBL_CRON_REBOOT_LINK': '⏱️ ' + _('Scheduled Reboot'),
    'LBL_WEB_ACCESS_TOGGLE': '🌐 ' + _('Allow WAN Web Access'),
    
    'MSG_MAC_CLONE_TIP': '💡 ' + _('<b>Tip:</b> Some ISPs or campus networks bind to a specific device MAC. If dial-up fails, enter the cloned MAC here.'),
    'BTN_GET_MAC': '⚡ ' + _('Auto-fill MAC'),
    'MSG_MAC_NOT_FOUND': _('No active device connection detected, please enter MAC address manually.'),
    
    'LBL_CRON_ENABLE': _('Enable Scheduled Reboot'),
    'LBL_CRON_TIME': _('Reboot Time:'),
    'LBL_CRON_DAYS': _('Repeat Days (Multi-select):'),
    'MSG_CRON_NO_DAY': _('Please select at least one day!'),
    
    'LBL_DAY_1': _('Mon'),
    'LBL_DAY_2': _('Tue'),
    'LBL_DAY_3': _('Wed'),
    'LBL_DAY_4': _('Thu'),
    'LBL_DAY_5': _('Fri'),
    'LBL_DAY_6': _('Sat'),
    'LBL_DAY_0': _('Sun'),
    
    'BTN_ADV_HIDE': _('Advanced Settings') + ' ▲',
    'BTN_ADV_SHOW': _('Advanced Settings') + ' ▼',

    'LBL_CRON_REBOOT': _('Scheduled Reboot'),
    'LBL_MAC_CLONE': _('MAC Clone'),
    'BTN_CLEAR': '🗑️ ' + _('Clear (Restore Default)'),
    'TXT_NET_OK': _('Internet Connected'),
    'TXT_NET_FAIL': _('Internet Disconnected'),
    'BTN_CANCEL': _('Cancel'),
    'BTN_OK': _('OK'),
    'M_CANCEL': _('Ignore'),
    'M_FMT_MAC':_('Invalid MAC address format!'),
    'PH_MAC': _('e.g., AA:BB:CC:DD:EE:FF'),
    'MSG_MULTI_WAN':'💡 ' + _('Multi-WAN detected. You can modify the account and password for each line separately (other settings remain unchanged).'),
    'MSG_WIZ_MULTI_WAN':'💡 ' + _('Multi-WAN detected. Only the primary WAN will be configured here, other lines remain unchanged.'),
    'LBL_IFACE':_('Interface:'),
    'LBL_HOSTS_LINK': '✏️ ' + _('Custom Hosts'),
    'LBL_HOSTS_TITLE': _('Custom <a href="javascript:void(0)" id="nw-hosts-raw-toggle" style="color:red; text-decoration:underline dashed; transition:color 0.2s;" title="Click to toggle pure text advanced mode">Hosts</a>') + '👈 ' + _('(Domain Hijack)'),
    'LBL_HOSTS_VISUAL': '💡 ' + _('Quick Add:'),
    'BTN_HOSTS_ADD': '➕ ' + _('Add'),
    'TXT_HOSTS_EMPTY': _('No custom Hosts, please add below.'),
    'PH_HOSTS_IP': _('IP (e.g., 127.0.0.1 or ::1)'),
    'PH_HOSTS_DOMAIN': _('Domain (e.g., abc.com)'),
    'PH_HOSTS_CMT': _('Comment (Optional)'),
    'LBL_HOSTS_RAW_TIP': '💡 ' + _('<b>Pure Text Mode</b>: <b>Paste</b> to import, <b>Copy</b> to export. Format: <code>IP Domain #Comment</code>'),
    'MSG_HOSTS_REQ': _('IP and Domain cannot be empty!'),
    'M_FMT_IP': _('Invalid IP address format!'),
    'M_FMT_DOMAIN': _('Invalid domain! Spaces, wildcards (*), and special characters are not allowed.'),
    'MSG_NO_CHANGE': _('No changes have been made.'),
    'M_INC_TIT': _('Notice'),
    'MSG_WAIT': _('Please wait...'),
    'MSG_HOSTS_DUP': _('This IP and Domain combination already exists!'),
    'MSG_HOSTS_DUP_RAW': _('Duplicate records found in Hosts! Please remove them before continuing.'),
    'LBL_SMART_ADD': _('Smart Auto-fill'),
    'TIP_SMART_ADD': _('Auto-fill IPv4/v6 & www domain combinations'),
    'LBL_HOSTS_DESC': '💡 ' + _('This feature forces specific domains to resolve to designated IPs. Commonly used for blocking domain access or local device redirection.'),
    'MSG_RAW_ERR_1': _('Found invalid or duplicate records:'),
    'MSG_RAW_ERR_2': _('Click [OK] to automatically discard them and continue, or [Cancel] to manually fix them.'),
    // --- 插件修复急救箱 ---
    'LBL_REPAIR_BTN': '🚑 ' + _('Plugin Repair'),
    'M_REP_SCAN_TIT': _('Please wait'),
    'M_REP_SCAN_MSG': _('Scanning for repairable plugins...'),
    'M_REP_DESC': _('Standard uninstallation does not remove plugin configuration files. If a plugin malfunctions after reinstallation, select it below to reset it to its initial state.'),
    'M_REP_OPT': _('Factory Default'),
    'M_REP_TIT': '🚑 ' + _('Plugin Repair Toolkit'),
    'M_REP_OK': _('Repair Now'),
    'M_REP_PROC_TIT': _('Processing'),
    'M_REP_PROC_MSG1': _('Repairing and restarting'),
    'M_REP_SUCC_TIT': _('Repair Successful'),
    'M_REP_SUCC_MSG': _('has been successfully restored'),
    'M_REP_FAIL_TIT': _('Repair Failed'),
    'M_REP_FAIL_MSG': _('Unable to repair this plugin'),
    'M_REP_ERR_TIT': _('System Error'),
    'M_REP_ERR_MSG': _('Request timeout or error'),
    'M_REP_NOTICE_TIT': _('Notice'),
    'M_REP_EMPTY_MSG': _('No repairable plugins found'),
    'M_REP_GET_ERR': _('Failed to get plugin list'),
    // ---------------------------
    'M_PORT_RANGE': '⚠️ ' + _('Port number must be between 1 and 65535'),
    'M_PORT_ERR1': '⚠️ ' + _('For system security, do not use'),
    'M_PORT_ERR2': _('as the external port. It is a reserved high-risk port.'),
    'M_PORT_SUGG': _('It is recommended to use 8080 or a port above 10000.'),
    'LBL_WEB_PORT_TITLE': _('Enter custom external port number'),
    'M_PORT_CONFLICT_P1': _('Port'),
    'M_PORT_CONFLICT_P2': _('is already in use by another application!'),
};

var callNetSetup = rpc.declare({ object: 'netwiz', method: 'set_network', params: ['mode', 'arg1', 'arg2', 'arg3', 'arg4', 'arg5', 'arg6'], expect: { result: 0 } });
var callNetDefuse = rpc.declare({ object: 'netwiz', method: 'confirm', expect: { result: 0 } });
// 调用系统底层 iwinfo 扫描 Wi-Fi
var callIwinfoScan = rpc.declare({ object: 'iwinfo', method: 'scan', params: ['device'], expect: { results: [] } });
var getWanStatus = rpc.declare({ object: 'network.interface', method: 'dump', expect: { '': {} } });
var callNetCheckWifi = rpc.declare({ object: 'netwiz', method: 'check_wifi', expect: { '': {} } });
var callSetPassword = rpc.declare({ object: 'netwiz', method: 'set_password', params: ['password'], expect: { result: 0 } });
var callSystemBoard = rpc.declare({ object: 'system', method: 'board', expect: { '': {} } });
// 增加智能备份和恢复的接口声明
var callSmartBackup = rpc.declare({ object: 'netwiz', method: 'smart_backup', params: ['type'], expect: { '': {} } });
var callCheckBackup = rpc.declare({ object: 'netwiz', method: 'check_backup', expect: { '': {} } });
var callSmartRestoreExec = rpc.declare({ object: 'netwiz', method: 'smart_restore_exec', params: ['filepath'], expect: { result: 0 } });
var callCheckStorage = rpc.declare({ object: 'netwiz', method: 'check_storage', expect: { '': {} } });
var callCheckRestoreStatus = rpc.declare({ object: 'netwiz', method: 'check_restore_status', expect: { '': {} } });
var callCheckIpConflict = rpc.declare({ object: 'netwiz', method: 'check_ip_conflict', params: ['ip'], expect: { '': {} } });
var callCheckMissingPkgs = rpc.declare({ object: 'netwiz', method: 'check_missing_pkgs', expect: { '': {} } });
var callCheckInternet = rpc.declare({ object: 'netwiz', method: 'check_internet', expect: { '': {} } });
var callGetClientMac = rpc.declare({ object: 'netwiz', method: 'get_client_mac', expect: { '': {} } });
var callGetAdvSettings = rpc.declare({ object: 'netwiz', method: 'get_adv_settings', expect: { '': {} } });
var callSetAdvSettings = rpc.declare({ object: 'netwiz', method: 'set_adv_settings', params: ['mac', 'web', 'cron', 'hosts'], expect: { '': {} } });

return view.extend({
    handleSaveApply: null,
    handleSave: null,
    handleReset: null,

    render: function () {
        // 落地自动拆弹！只要页面跳到新 IP 并加载，立刻解除 120 秒防砖炸弹
        if (typeof callNetDefuse === 'function') {
            callNetDefuse().catch(function(){});
        }

        if (!document.querySelector('meta[name="viewport"]')) {
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
            document.head.appendChild(meta);
        }

        var container = dom.create('div', { id: 'netwiz-container' });

        var htmlTemplate = [
            '<link rel="stylesheet" type="text/css" href="' + L.resource('view/netwiz.css') + '?v=' + Date.now() + '">',
            '<style>',
            '  .nw-badge svg { width: 24px; height: 24px; }',
            '  .nw-top-back svg { width: 25px; height: 25px; }',
            '  .nw-step-line svg { width: 20px; height: 20px; display: block; }',
            '  body #view #netwiz-container #wiz-step-indicator .nw-step-line svg, body #maincontent #netwiz-container #wiz-step-indicator .nw-step-line svg { background: transparent !important; background-color: transparent !important; border: none !important; box-shadow: none !important; }',
            '  body #view #netwiz-container .nw-badge svg, body #maincontent #netwiz-container .nw-badge svg { background: transparent !important; background-color: transparent !important; }',
            '  .alert-message, .alert-danger, .alert, #sysmsg { display: none !important; }', 
  
            '  #nw-wizard-modal .nw-wiz-modal-box > div:nth-child(2) { flex: 1 1 auto !important; overflow-y: auto !important; padding: 20px 25px 10px !important; }',
            '  #nw-wizard-modal .nw-value-field input[type="text"], #nw-wizard-modal .nw-value-field input[type="password"], #nw-wizard-modal .nw-value-field input[type="search"] { height: 46px !important; line-height: 44px !important; padding: 0 16px !important; font-size: 15.5px !important; border-radius: 8px !important; border: 1px solid #cbd5e1 !important; box-sizing: border-box !important; width: 100% !important; background: #fff !important; color: #334155 !important; transition: all 0.25s ease !important; margin: 0 !important; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02) !important; }',
            '  #nw-wizard-modal .nw-value-field input[type="text"]:focus, #nw-wizard-modal .nw-value-field input[type="password"]:focus, #nw-wizard-modal .nw-value-field input[type="search"]:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15), inset 0 1px 2px rgba(0,0,0,0.02) !important; outline: none !important; }',
            '  @media screen and (min-width: 769px) { #nw-wizard-modal .nw-wiz-modal-box { max-width: 660px !important; } }',
            '  @media screen and (max-width: 768px) { #nw-wizard-modal .nw-wiz-modal-box > div:nth-child(2) { padding: 15px 15px 10px !important; } }',
            '  @keyframes pulse { 0% { opacity: 1; box-shadow: 0 0 8px rgba(16,185,129,0.8); transform: scale(1); } 50% { opacity: 0.4; box-shadow: 0 0 2px rgba(16,185,129,0.2); transform: scale(0.85); } 100% { opacity: 1; box-shadow: 0 0 8px rgba(16,185,129,0.8); transform: scale(1); } }',
            '  @keyframes wifi-wave { 0% { clip-path: inset(100% 0 0 0); } 20% { clip-path: inset(66% 0 0 0); } 40% { clip-path: inset(33% 0 0 0); } 60% { clip-path: inset(0 0 0 0); } 100% { clip-path: inset(0 0 0 0); } }',
            '  .wifi-active-anim { animation: wifi-wave 2s infinite; }',
            '  .nw-modal-btn-wrap .nw-u-btn { height: auto !important; min-height: 44px !important; white-space: normal !important; word-break: break-word !important; line-height: 1.4 !important; padding: 10px 8px !important; }',
            '  .nw-qr-hover:hover { color: #3b82f6 !important; }',

            '@media screen and (max-width: 600px) {' +
            '    .nw-hide-mob { display: none !important; }' + 
            '}' +
            '</style>',

            '<div class="nw-wrapper">',
            '   <div id="nw-hover-qr-box" style="display:none; position:fixed; z-index:999999; background:#fff; padding:5px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.25); border:1px solid #e2e8f0; text-align:center; transform: translate(-50%, -100%); margin-top:-20px; pointer-events:none;">',
            '      <div id="nw-hover-qr-code" style="margin:0 auto; background:#fff; padding:5px;"></div>',
            '      <div style="font-size:13px; color:#3b82f6; margin-bottom:2px; font-weight:bold;">📱 {{TXT_SCAN_TO_CONN}}</div>',
            '   </div>',
            '   <div class="nw-header">',
            '    <div class="nw-title-wrap">',
            '      <div class="nw-main-title">{{TITLE}}</div>',
            '      <div class="nw-version-tag">v1.7.2 <div class="nw-version-dot" style="display: none;"></div></div>',
            '    </div>',
            '    <p>{{SUBTITLE}}</p>',
            '    <div id="btn-reopen-wizard" class="nw-reopen-btn">{{WIZ_REOPEN}}</div>',
            '  </div>',
            '  <div id="nw-global-modal" style="display:none;">',
            '    <div class="nw-modal-box">',
            '      <div id="nw-global-spinner" class="nw-spinner" style="display:none;"></div>',
            '      <h3 id="nw-global-title"></h3>',
            '      <p id="nw-global-msg"></p>',
            '      <div id="nw-global-btn-wrap" class="nw-modal-btn-wrap" style="display:none;">',
            '        <button id="nw-global-btn-cancel" class="nw-u-btn nw-u-btn-gray" style="display:none;"></button>',
            '        <button id="nw-global-btn-ok" class="nw-u-btn nw-u-btn-blue" style="display:none;"></button>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div id="wisp-scan-modal" class="nw-wisp-modal" style="display:none;">',
            '    <div class="nw-wisp-modal-box">',
            '      <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 20px; background:#5e72e4;">',
            '         <div style="flex:1;"></div>',
            '         <h3 style="flex:2; margin:0; padding:0; text-align:center; font-size:16px; font-weight:600; color:#fff; background:transparent;">{{MODAL_WISP_TITLE}}</h3>',
            '         <div style="flex:1; display:flex; justify-content:flex-end;">',
            '            <span id="wisp-modal-close" class="nw-pointer" style="font-size:40px; cursor:pointer; color:#fff; line-height:1;">&times;</span>',
            '         </div>',
            '      </div>',
            '      <div style="padding:0; overflow-y:auto; flex:1;">',
            '         <ul id="wisp-scan-list" style="list-style:none; padding:0; margin:0;"></ul>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div id="nw-wizard-modal" class="nw-wisp-modal" style="display:none;">',
            '    <div class="nw-wiz-modal-box">',
            '      <div class="nw-wiz-modal-header nw-wiz-header-responsive" style="background:#5e72e4;">',
            '         <div class="nw-wiz-step-wrap">',
            '            <div id="wiz-step-indicator" style="display: flex; align-items: center; gap: 2px;">',
            '               <div class="nw-step-dot" style="width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-sizing:border-box;">1</div>',
            '               <div class="nw-step-line" style="display:flex; align-items:center; justify-content:center; margin:0 2px; transition:all 0.3s;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>',
            '               <div class="nw-step-dot" style="width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-sizing:border-box;">2</div>',
            '               <div class="nw-step-line" style="display:flex; align-items:center; justify-content:center; margin:0 2px; transition:all 0.3s;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>',
            '               <div class="nw-step-dot" style="width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-sizing:border-box;">3</div>',
            '               <div class="nw-step-line" style="display:flex; align-items:center; justify-content:center; margin:0 2px; transition:all 0.3s;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>',
            '               <div class="nw-step-dot" style="width:22px; height:22px; border-radius:50%; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-sizing:border-box;">4</div>',
            '            </div>',
            '         </div>',
            '         <h3 class="nw-wiz-modal-title nw-wiz-title-responsive">{{WIZ_TITLE}}</h3>',
            '         <div class="nw-wiz-close-wrap">',
            '            <span id="wiz-modal-close" class="nw-pointer" style="color: #fff; font-size: 40px; opacity: 0.8; line-height: 1;">&times;</span>',
            '         </div>',
            '      </div>',
            '      <div style="padding: 10px 10px 5px; overflow-y: auto;">',
            '         <div id="wiz-step-1-area">',
            '            <div class="nw-step-title" style="margin-bottom: 20px; font-size: 19px;">{{WIZ_PWD}}</div>',

            // 密码输入核心区
            '            <div id="wiz-pwd-input-area" style="margin-bottom: 20px; padding-bottom: 20px;">',
            '               <div class="nw-value"><label class="nw-value-title" style="color:#ef4444; font-weight:bold;">🛡️ {{LBL_NEW_PWD}}</label>',
            '               <div class="nw-value-field"><input type="password" id="nw-admin-pwd" placeholder="{{PH_NEW_PWD}}"></div></div>',
            '               <div class="nw-value" style="margin-top:12px;"><label class="nw-value-title" style="color:#ef4444; font-weight:bold;">🛡️ {{LBL_CONFIRM_PWD}}</label>',
            '               <div class="nw-value-field"><input type="password" id="nw-admin-pwd-confirm" placeholder="{{PH_CONFIRM_PWD}}"></div></div>',
            '               <div style="font-size: 14.5px; color: #64748b; margin-top: 8px; text-align: left; line-height: 1.4;">{{PH_PWD_TIP}}</div>',
            '            </div>',
            '         </div>',
            '         <div id="wiz-step-2-area" style="display:none;">',
            '            <div class="nw-step-title" style="margin-bottom: 20px; font-size: 19px;">{{WIZ_WAN}}</div>',
            '            <div style="width: 100%; margin-bottom: 15px;">',
            '              <div class="nw-radio-group">',
            '                <label class="nw-radio-btn"><input type="radio" name="wiz_wan_type" value="dhcp"> <span class="nw-radio-btn-text">{{OPT_DHCP}}</span></label>',
            '                <label class="nw-radio-btn"><input type="radio" name="wiz_wan_type" value="pppoe" checked> <span class="nw-radio-btn-text">{{MODE_PPPOE_TITLE}}</span></label>',
            '              </div>',
            '            </div>',
            '            <iframe name="dummy_wiz_frame" style="display:none;"></iframe>',
            '            <form id="wiz-pppoe-fields" target="dummy_wiz_frame" action="about:blank" method="POST" style="display:block; margin-top: 15px;">',
            '               <div class="nw-value"><label class="nw-value-title">{{LBL_USER}}</label><div class="nw-value-field">',
            '                  <input type="search" id="wiz-pppoe-user" name="search_q1" class="nd-input" placeholder="{{PH_USER}}" autocomplete="on">',
            '                  <div id="wiz-user-mirror" style="display:none; margin-top:8px; padding:8px 10px; background:#eff6ff; border-radius:8px; font-size:13.5px; color:#1e3a8a; word-break:break-all; line-height:1.4; border:1px dashed #93c5fd; text-align:left;"></div>',
            '               </div></div>',
            '               <div class="nw-value"><label class="nw-value-title">{{LBL_PASS}}</label><div class="nw-value-field"><input type="search" id="wiz-pppoe-pass" name="search_q2" class="nd-input" placeholder="{{PH_PASS}}" autocomplete="on"></div></div>',
            '               <button type="submit" id="wiz-pppoe-submit" style="display:none;">{{BTN_APPLY}}</button>',
            '            </form>',
            '         </div>',
            '         <div id="wiz-step-3-area" style="display:none;">',
            '            <div class="nw-step-title" style="margin-bottom: 20px; font-size: 19px;">{{WIZ_WIFI}}</div>',
            '            <p style="color: #64748b; font-size: 14.5px; margin: 0 0 20px 0; text-align: center;">{{WIZ_WIFI_DESC}}</p>',
            '            <div style="text-align: center; margin-bottom: 15px; padding: 14px 10px; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; width: 100%; box-sizing: border-box;">',
            '               <label class="nw-wiz-cb-wrap" style="display: inline-flex; align-items: center; justify-content: center; font-size: 16.5px; color: #3b82f6; font-weight: bold; margin: 0 auto;">',
            '                  <input type="checkbox" id="wiz-skip-wifi-checkbox">',
            '                  <span class="nw-wiz-checkmark"></span>',
            '                  <span style="line-height: 1.3; display: inline-block;">{{WIZ_SKIP_WIFI}}</span>',
            '               </label>',
            '            </div>',
            '            <div id="wiz-wifi-input-area">',
            '               <div class="nw-value"><label class="nw-value-title">{{LBL_SSID}}</label><div class="nw-value-field"><input type="text" id="wiz-wifi-ssid" placeholder="{{PH_WIFI_SSID}}"></div></div>',
            '               <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_PASS}}</label><div class="nw-value-field"><input type="text" id="wiz-wifi-key" placeholder="{{M_PWD_SHORT}}"></div></div>',
            '            </div>',
            '         </div>',
            '         <div id="wiz-step-4-area" style="display:none;">',
            '            <div class="nw-step-title" style="margin-bottom: 20px; font-size: 19px;">{{WIZ_CONFIRM}}</div>',
            '            <div id="wiz-confirm-text" class="nw-confirm-mode-text" style="margin-top: 0; padding: 20px; background: #0f172a;"></div>',
            '            <div class="nw-warn-main" style="margin-top: 15px; margin-bottom: 0;">{{NOTE_1}}</div>',
            '         </div>',
            '      </div>',
            '      <div style="padding: 15px 25px 25px; border-top: 1px solid #f1f5f9; background: #f8fafc;">',
            '         <div class="nw-modal-btn-wrap" style="margin-top: 0;">',
            '            <button id="wiz-btn-prev" class="nw-u-btn nw-u-btn-red" style="display:none;">{{BTN_BACK}}</button>',
            '            <button id="wiz-btn-next" class="nw-u-btn nw-u-btn-green">{{BTN_NEXT}}</button>',
            '            <button id="wiz-btn-apply" class="nw-u-btn nw-u-btn-green" style="display:none;">{{BTN_APPLY}}</button>',
            '         </div>',
            '         <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">',
            '            <label class="nw-wiz-cb-wrap" style="font-size: 13.5px; color: #64748b; font-weight: 500; margin: 0;">',
            '               <input type="checkbox" id="wiz-hide-checkbox">',
            '               <span class="nw-wiz-checkmark"></span>',
            '               <span style="line-height: 1.3; display: inline-block;">{{WIZ_HIDE}}</span>',
            '            </label>',
            '            <span id="wiz-btn-skip" style="font-size: 13.5px; color: #94a3b8; cursor: pointer; text-decoration: underline;">{{WIZ_SKIP}}</span>',
            '         </div>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div id="step-1" class="nw-step">',
            '    <div class="nw-card-group">',
            '      <div class="nw-card" data-mode="pppoe"><div class="nw-badge nw-badge-pppoe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></div>',
            '        <div class="nw-card-title">{{MODE_PPPOE_TITLE}}</div><span>{{MODE_PPPOE_DESC}}</span></div>',
            '<div class="nw-card" id="card-wifi" data-mode="wifi" style="display: none; position: relative;">',
            '  ',
            '  <div class="nw-badge nw-badge-wifi" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: center; padding: 0;">',
            '    ',
            '    <div style="position: relative; width: 28px; height: 28px; transform: translate(1.5px, 1.5px);">',
            '      ',
            '      <svg style="position: absolute; top: 0; left: 0; width: 28px; height: 28px;" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
            '      ',
            '      <svg class="wifi-active-anim nw-wifi-anim-layer" style="position: absolute; top: 0; left: 0; width: 28px; height: 28px; display: none;" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
            '    </div>',
            '  </div>',

            '  <div class="nw-card-title">{{MODE_WIFI_TITLE}}</div><span style="display:block; margin-bottom:10px;">{{MODE_WIFI_DESC}}</span>',
            '  ',
            '  <div id="nw-wifi-tags" style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px; min-height:22px; width:100%;"></div>',
            '</div>',
            '      <div class="nw-card" data-mode="router"><div class="nw-badge nw-badge-dhcp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg></div>',
            '        <div class="nw-card-title">{{MODE_ROUTER_TITLE}}</div><span>{{MODE_ROUTER_DESC}}</span></div>',
            '      <div class="nw-card" data-mode="lan"><div class="nw-badge nw-badge-bypass"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>',
            '        <div class="nw-card-title">{{MODE_LAN_TITLE}}</div><span>{{MODE_LAN_DESC}}</span></div>',
            '    </div>',
            '    <div id="current-mode-display" class="nw-current-mode-display">',
            '       <div id="current-mode-text" style="color: #fff;"><div class="nw-spinner" style="width:30px; height:30px; border-width:3px; margin: 0 auto; border-top-color: #fff;"></div><div style="margin-top:10px; font-size:15px; font-weight:bold; color:#fff;">{{LOADING_CONFIG}}</div></div>',
            '    </div>',
            // 实验室功能区块
            // --- 在此插入代码 ---
            '    <div style="margin: 20px auto 0; width: 100%; max-width: 820px; box-sizing: border-box; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">',
            // --- 高级设置 ---
            '    <div style="margin-top: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; padding: 15px; text-align: left;">',
            '        <div style="font-size:14px; font-weight:bold; color:#475569; margin-bottom:12px;">{{LBL_ADV_UTILS_TITLE}}</div>',
            '        <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom: 1px dashed #cbd5e1;">',
            '            <a href="javascript:void(0)" id="link-cron-reboot" style="color:#0284c7; text-decoration:none; font-size:14.5px; font-weight:500;">{{LBL_CRON_REBOOT_LINK}}</a>',
            '            <a href="javascript:void(0)" id="link-mac-clone" style="color:#0284c7; text-decoration:none; font-size:14.5px; font-weight:500;">{{LBL_MAC_CLONE_LINK}}</a>',
            '            <a href="javascript:void(0)" id="link-modify-hosts" style="color:#0284c7; text-decoration:none; font-size:14.5px; font-weight:500;">{{LBL_HOSTS_LINK}}</a>',
            '            <a href="javascript:void(0)" id="link-repair-plugin" style="color:#ef4444; text-decoration:none; font-size:14.5px; font-weight:500;">{{LBL_REPAIR_BTN}}</a>',
            '        </div>',
            '        <div style="display:flex; justify-content:space-between; align-items:center;">',
            '            <div style="display:flex; align-items:center; gap:0;">',
            '                <div style="font-size:14.5px; font-weight:500; color:#0284c7;">{{LBL_WEB_ACCESS_TOGGLE}}</div>',
            '                <input type="number" id="adv-web-port" placeholder="80" title="{{LBL_WEB_PORT_TITLE}}" style="width:70px; height:26px; border:1px solid #cbd5e1; border-radius:4px; padding:0 8px; font-size:13px; outline:none; background-color: #fff; color: #000;" min="1" max="65535">',
            '            </div>',
            '            <label class="nw-switch"><input type="checkbox" id="adv-web-toggle"><span class="nw-slider"></span></label>',
            '        </div>',
            '    </div>',
            // --- 结束 ---
            '    ',
            '        <div style="background: linear-gradient(90deg, #5E72E4 0%, #f1f5f9 100%); padding: 12px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">',
            '            <div style="display: flex; align-items: center; gap: 8px;">',
            '                <span style="font-size: 18px;">🧪</span>',
            '                <span style="font-size: 15px; font-weight: bold; color: #FFF;">{{LBL_LAB_TITLE}}</span>',
            '            </div>',
            '            <span style="font-size: 12px; color: #FFF; background: #5E72E4; padding: 2px 8px; border-radius: 12px; font-weight: bold;">{{LBL_LAB_BETA}}</span>',
            '        </div>',
            '        <div style="padding: 20px;">',
            '            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">',
            '                <div style="font-size: 16.5px; font-weight: bold; color: #0f172a;">{{TXT_FULL_BACKUP_TIT}}</div>',
            '                <div style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: left;">',
            '                    {{TXT_FULL_BACKUP_DESC}}',
            '                    <div onclick="var t=this.querySelector(\'#nw-copy-tip\'); var el=document.createElement(\'textarea\'); el.value=\'if wget -qO /tmp/nw_inst.sh https://raw.githubusercontent.com/huchd0/luci-app-netwiz/master/install.sh; then sh /tmp/nw_inst.sh; else sh /etc/netwiz/custom_pkgs/install.sh; fi\'; el.style.position=\'absolute\'; el.style.left=\'-9999px\'; document.body.appendChild(el); el.select(); var ok=false; try{ ok=document.execCommand(\'copy\'); }catch(e){} document.body.removeChild(el); if(ok){ t.innerHTML=\'{{TXT_COPIED}}\'; t.style.color=\'#10b981\'; setTimeout(function(){ t.innerHTML=\'{{TXT_COPY_TIP}}\'; t.style.color=\'#64748b\'; }, 2000); }else{ t.innerHTML=\'{{TXT_COPY_FAIL}}\'; setTimeout(function(){ t.innerHTML=\'{{TXT_COPY_TIP}}\'; }, 2000); }" style="margin-top: 10px; padding: 12px 15px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s ease;" onmouseover="this.style.background=\'#f1f5f9\'; this.style.borderColor=\'#5E72E4\';" onmouseout="this.style.background=\'#f8fafc\'; this.style.borderColor=\'#cbd5e1\';">',
            '                       <code style="font-family: monospace; color: #334155; font-size: 13.5px; word-break: break-all; font-weight: bold; background: #e9ecef;">if wget -qO /tmp/nw_inst.sh https://raw.githubusercontent.com/huchd0/luci-app-netwiz/master/install.sh; then sh /tmp/nw_inst.sh; else sh /etc/netwiz/custom_pkgs/install.sh; fi</code>',
            '                       <span id="nw-copy-tip" style="flex-shrink: 0; margin-left: 15px; font-size: 12px; font-weight: bold; color: #64748b; transition: color 0.2s;">{{TXT_COPY_TIP}}</span>',
            '                    </div>',
            '                </div>',
            '            </div>',
            '            <div style="display: flex; flex-wrap: wrap; gap: 12px;">',
            '                <button id="btn-smart-backup" class="nw-u-btn nw-u-btn-blue" style="flex: 1; min-width: 200px; padding: 12px; font-size: 14.5px; box-shadow: 0 4px 12px rgba(59,130,246,0.25);">{{BTN_SMART_BACKUP}}</button>',
            '                <button id="btn-smart-restore" class="nw-u-btn nw-u-btn-gray" style="flex: 1; min-width: 200px; padding: 12px; font-size: 14.5px;">{{BTN_SMART_RESTORE}}</button>',
            '                <input type="file" id="file-smart-restore" style="display:none;" accept=".tar.gz">',
            '            </div>',
            '        </div>',
            '    </div>',

            '  </div>',

            '  <div id="step-2" class="nw-step" style="display: none;">',
            '    <div class="nw-form-area">',
            '      <div class="nw-top-back" id="top-back-1" title="{{BTN_HOME}}">',
            '         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
            '      </div>',
            '      <div id="fields-router" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_WAN}}</div>',
            '        <div class="nw-radio-group-wrap">',
            '          <div class="nw-value-title nw-radio-title">{{LBL_CONN_TYPE}}</div>',
            '          <div class="nw-radio-group">',
            '            <label class="nw-radio-btn"><input type="radio" name="router_type" value="dhcp" checked> <span class="nw-radio-btn-text">{{OPT_DHCP}}</span></label>',
            '            <label class="nw-radio-btn"><input type="radio" name="router_type" value="static"> <span class="nw-radio-btn-text">{{OPT_STATIC}}</span></label>',
            '          </div>',
            '        </div>',
            '        <div id="router-static-fields" class="nw-router-static-fields" style="display: none;">',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_IP}}</label><div class="nw-value-field"><input type="text" id="router-ip" placeholder="{{PH_IP}}"></div></div>',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_GW}}</label><div class="nw-value-field"><input type="text" id="router-gw" placeholder="{{PH_GW}}"></div></div>',
            '        </div>',
            '      </div>',
            '      <div id="fields-pppoe" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_PPPOE}}</div>',
            '        <iframe name="dummy_main_frame" style="display:none;"></iframe>',
            '        <form id="main-pppoe-fields" target="dummy_main_frame" action="about:blank" method="POST" style="margin:0; padding:0;">',
            '           <div class="nw-value"><label class="nw-value-title">{{LBL_USER}}</label><div class="nw-value-field">',
            '              <input type="search" id="pppoe-user" name="search_q3" class="nd-input" placeholder="{{PH_USER}}" autocomplete="on">',
            '           </div></div>',
            '           <div class="nw-value"><label class="nw-value-title">{{LBL_PASS}}</label><div class="nw-value-field"><input type="search" id="pppoe-pass" name="search_q4" class="nd-input" placeholder="{{PH_PASS}}" autocomplete="on"></div></div>',
            '           <button type="submit" id="main-pppoe-submit" style="display:none;">{{BTN_APPLY}}</button>',
            '        </form>',
            '        <div class="nw-warn-text">{{MSG_WAN_AUTODETECT}}</div>',
            '      </div>',
            '      <div id="fields-wifi" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_WIFI}}</div>',
            '        <div id="wifi-smart-row" class="nw-setting-row">',
            '           <div class="nw-setting-row-label">{{LBL_SMART_CONN}}</div>',
            '           <label class="nw-switch"><input type="checkbox" id="wifi-smart-toggle"><span class="nw-slider"></span></label>',
            '        </div>',
            '        <div id="wifi-smart-ui" style="display: none;">',
            '          <div class="nw-switch-row-padded">',
            '             <label class="nw-value-title nw-m0">{{LBL_WIFI_SWITCH}}</label>',
            '             <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-smart-en" checked><span class="nw-slider"></span></label>',
            '          </div>',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_SSID}}</label><div class="nw-value-field"><input type="text" id="wifi-smart-ssid" placeholder="{{PH_WIFI_SSID}}"></div></div>',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_PASS}}</label><div class="nw-value-field"><input type="text" id="wifi-smart-key" placeholder="min 8 chars"></div></div>',
            '          <div class="nw-adv-btn">▼ {{LBL_ADVANCED}}</div>',
            '          <div class="nw-adv-panel" style="display:none;">',
            '             <div class="nw-adv-setting-row">',
            '                <label class="nw-value-title nw-m0">{{LBL_HIDE_SSID}}</label>',
            '                <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-smart-hidden"><span class="nw-slider"></span></label>',
            '             </div>',
            '             <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_ENC}}</label><div class="nw-value-field">',
            '               <select id="wifi-smart-enc"><option value="sae-mixed">{{OPT_PSK2SAE}}</option><option value="psk2+ccmp">{{OPT_PSK2}}</option><option value="sae">{{OPT_SAE}}</option><option value="none">{{OPT_NONE}}</option></select>',
            '             </div></div>',
            '             <div class="nw-roam-row">',
            '                <div class="nw-flex-1">',
            '                   <div class="nw-roam-title">{{LBL_ROAMING}}</div>',
            '                   <div class="nw-roam-desc">{{DESC_ROAMING}}</div>',
            '                   <div id="roam-warn-smart" class="nw-roam-warn" style="display:none;">{{DESC_ROAM_DIRTY}}</div>',
            '                </div>',
            '                <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-smart-roaming" checked><span class="nw-slider"></span></label>',
            '             </div>',
            '          </div>',
            '        </div>',
            '        <div id="wifi-split-ui" style="display: block;">',
            '           <div class="nw-split-header-row" style="display: flex; margin-bottom: 10px;">',
            '              <div class="nw-split-header-item" style="display: flex; align-items: center; justify-content: center; gap: 5px;">',
            '                 <label class="nw-switch nw-flex-shrink-0 nw-scale-switch" style="margin: 0;"><input type="checkbox" id="wifi-2g-en" checked><span class="nw-slider"></span></label>',
            '                 <label class="nw-value-title nw-m0 nw-pointer" style="display: inline-block !important; margin: 0 !important; line-height: 1 !important;">{{LBL_WIFI_2G_EN}}</label>',
            '              </div>',
            '              <div class="nw-split-header-item" style="display: flex; align-items: center; justify-content: center; gap: 2px;">',
            '                 <label class="nw-switch nw-flex-shrink-0 nw-scale-switch" style="margin: 0;"><input type="checkbox" id="wifi-5g-en" checked><span class="nw-slider"></span></label>',
            '                 <label class="nw-value-title nw-m0 nw-pointer" style="display: inline-block !important; margin: 0 !important; line-height: 1 !important;">{{LBL_WIFI_5G_EN}}</label>',
            '              </div>',
            '              <div id="hdr-5g2" class="nw-split-header-item" style="display: none; align-items: center; justify-content: center; gap: 2px;">',
            '                 <label class="nw-switch nw-flex-shrink-0 nw-scale-switch" style="margin: 0;"><input type="checkbox" id="wifi-5g2-en"><span class="nw-slider"></span></label>',
            '                 <label class="nw-value-title nw-m0 nw-pointer" style="display: inline-block !important; margin: 0 !important; line-height: 1 !important;">5G_Game</label>',
            '              </div>',
            '           </div>',
            '           <div id="wifi-tab-buttons" class="nw-wifi-tabs">',
            '              <button id="tab-2g" class="nw-tab-btn" style="background:#3b82f6; color:#fff;">{{TAB_2G}}</button>',
            '              <button id="tab-5g" class="nw-tab-btn" style="background:#f1f5f9; color:#475569;">{{TAB_5G}}</button>',
            '              <button id="tab-5g2" class="nw-tab-btn" style="display:none; background:#f1f5f9; color:#475569;">5G_Game</button>',
            '           </div>',
            '           <div id="wifi-2g-form">',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_SSID}} (2.4G{{M_ACCT}})</label><div class="nw-value-field"><input type="text" id="wifi-2g-ssid"></div></div>',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_PASS}} (2.4G)</label><div class="nw-value-field"><input type="text" id="wifi-2g-key"></div></div>',
            '              <div class="nw-adv-btn">▼ {{LBL_ADVANCED}}</div>',
            '              <div class="nw-adv-panel" style="display:none;">',
            '                 <div class="nw-adv-setting-row">',
            '                    <label class="nw-value-title nw-m0">{{LBL_HIDE_SSID}}</label>',
            '                    <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-2g-hidden"><span class="nw-slider"></span></label>',
            '                 </div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_ENC}}</label><div class="nw-value-field">',
            '                    <select id="wifi-2g-enc"><option value="sae-mixed">{{OPT_PSK2SAE}}</option><option value="psk2+ccmp">{{OPT_PSK2}}</option><option value="sae">{{OPT_SAE}}</option><option value="none">{{OPT_NONE}}</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_MODE}}</label><div class="nw-value-field">',
            '                    <select id="wifi-2g-mode" data-prev="auto"><option value="auto">{{OPT_AUTO}}</option><option value="11be">11be (Wi-Fi 7)</option><option value="11ax">11ax (Wi-Fi 6)</option><option value="11g">11g (Wi-Fi 4/3)</option><option value="11b">11b (Legacy)</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_CHANNEL}}</label><div class="nw-value-field">',
            '                    <select id="wifi-2g-chan"><option value="auto">{{OPT_AUTO}}</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_BANDWIDTH}}</label><div class="nw-value-field">',
            '                    <select id="wifi-2g-bw"><option value="auto">{{OPT_AUTO}}</option><option value="20">20 MHz</option><option value="40">40 MHz</option></select>',
            '                 </div></div>',
            '                 <div class="nw-legacy-row">',
            '                    <div class="nw-flex-1">',
            '                        <div class="nw-desc-title">{{LBL_LEGACY_B}}</div>',
            '                        <div class="nw-legacy-desc" style="font-size:13.5px; color:#64748b;">{{DESC_LEGACY_B}}</div>',
            '                    </div>',
            '                    <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="legacy-b-toggle"><span class="nw-slider"></span></label>',
            '                 </div>',
            '                 <div class="nw-roam-row-alt">',
            '                    <div class="nw-flex-1">',
            '                       <div class="nw-roam-title">{{LBL_ROAMING}}</div>',
            '                       <div class="nw-roam-desc">{{DESC_ROAMING}}</div>',
            '                       <div id="roam-warn-2g" class="nw-roam-warn" style="display:none;">{{DESC_ROAM_DIRTY}}</div>',
            '                    </div>',
            '                    <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-2g-roaming"><span class="nw-slider"></span></label>',
            '                 </div>',
            '              </div>',
            '           </div>',
            '           <div id="wifi-5g-form" style="display:none;">',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_SSID}} (5G{{M_ACCT}})</label><div class="nw-value-field"><input type="text" id="wifi-5g-ssid"></div></div>',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_PASS}} (5G)</label><div class="nw-value-field"><input type="text" id="wifi-5g-key"></div></div>',
            '              <div class="nw-adv-btn">▼ {{LBL_ADVANCED}}</div>',
            '              <div class="nw-adv-panel" style="display:none;">',
            '                 <div class="nw-adv-setting-row">',
            '                    <label class="nw-value-title nw-m0">{{LBL_HIDE_SSID}}</label>',
            '                    <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-5g-hidden"><span class="nw-slider"></span></label>',
            '                 </div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_WIFI_ENC}}</label><div class="nw-value-field">',
            '                    <select id="wifi-5g-enc"><option value="sae-mixed">{{OPT_PSK2SAE}}</option><option value="psk2+ccmp">{{OPT_PSK2}}</option><option value="sae">{{OPT_SAE}}</option><option value="none">{{OPT_NONE}}</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_MODE}}</label><div class="nw-value-field">',
            '                    <select id="wifi-5g-mode" data-prev="auto"><option value="auto">{{OPT_AUTO}}</option><option value="11be">11be (Wi-Fi 7)</option><option value="11ax">11ax (Wi-Fi 6)</option><option value="11ac">11ac (Wi-Fi 5)</option><option value="11a">11a (Wi-Fi 4)</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_CHANNEL}}</label><div class="nw-value-field">',
            '                    <select id="wifi-5g-chan"><option value="auto">{{OPT_AUTO}}</option><option value="36">36</option><option value="40">40</option><option value="44">44</option><option value="48">48</option><option value="149">149</option><option value="153">153</option><option value="157">157</option><option value="161">161</option></select>',
            '                 </div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{LBL_BANDWIDTH}}</label><div class="nw-value-field">',
            '                    <select id="wifi-5g-bw"><option value="auto">{{OPT_AUTO}}</option><option value="20">20 MHz</option><option value="40">40 MHz</option><option value="80">80 MHz</option><option value="160">160 MHz</option></select>',
            '                 </div></div>',
            '                 <div class="nw-roam-row-alt">',
            '                    <div class="nw-flex-1">',
            '                       <div class="nw-roam-title">{{LBL_ROAMING}}</div>',
            '                       <div class="nw-roam-desc">{{DESC_ROAMING}}</div>',
            '                       <div id="roam-warn-5g" class="nw-roam-warn" style="display:none;">{{DESC_ROAM_DIRTY}}</div>',
            '                    </div>',
            '                    <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="wifi-5g-roaming" checked><span class="nw-slider"></span></label>',
            '                 </div>',
            '              </div>',
            '           </div>',

            '           <div id="wifi-5g2-form" style="display:none;">',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_5G2_SSID}}</label><div class="nw-value-field"><input type="text" id="wifi-5g2-ssid"></div></div>',
            '              <div class="nw-value"><label class="nw-value-title">{{LBL_5G2_PWD}}</label><div class="nw-value-field"><input type="text" id="wifi-5g2-key"></div></div>',
            '              <input type="hidden" id="wifi-5g2-enc" value="psk2+ccmp">',
            '              <input type="hidden" id="wifi-5g2-mode" value="auto">',
            '              <input type="hidden" id="wifi-5g2-chan" value="auto">',
            '              <input type="hidden" id="wifi-5g2-bw" value="auto">',
            '              <input type="hidden" id="wifi-5g2-roaming" value="0">',
            '           </div>',
            
            '        </div>',

            '        <div id="nw-live-qr-box" style="display:none; text-align:center; margin: 5px 0 15px; padding: 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; transition: opacity 0.3s ease;">',
            '           <div id="nw-live-qr-code" style="background:#fff; padding:10px; border-radius:8px; display:inline-block; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin-bottom:3px; min-width:130px; min-height:130px;"></div>',
            '           <div style="font-size:14px; color:#64748b; font-weight:bold;">📱 {{TXT_SCAN_TO_CONN}} <span id="nw-live-qr-band" style="color:#3b82f6;"></span></div>',
            '        </div>',

            '        <div class="nw-wisp-section">',
            '           <div class="nw-wisp-header">',
            '              <div class="nw-wisp-title">{{LBL_WISP_EN}}</div>',
            '              <label class="nw-switch"><input type="checkbox" id="wisp-toggle"><span class="nw-slider"></span></label>',
            '           </div>',
            '           <div class="nw-wisp-desc" style="padding:5px 0; font-size:13.5px; color:#64748b;">{{DESC_WISP}}</div>',
            '           <div id="wisp-ui-panel" class="nw-wisp-ui-panel" style="display:none;">',
            '              <button id="btn-wisp-scan" class="nw-u-btn nw-u-btn-blue" style="width: 100%;">{{BTN_SCAN}}</button>',
            '              <div id="wisp-selected-info" style="display:none; width: 100%;">',
            '                 <div class="nw-value"><label class="nw-value-title">{{TXT_TARGET_SSID}}</label><div class="nw-value-field"><input type="text" id="wisp-target-ssid" readonly class="nw-wisp-target-input"></div></div>',
            '                 <div class="nw-value"><label class="nw-value-title">{{WISP_PWD_PROMPT}}</label><div class="nw-value-field"><input type="text" id="wisp-target-key" placeholder="{{PH_WISP_PWD}}"></div></div>',
            '                 <input type="hidden" id="wisp-target-enc" value="psk2+ccmp">',
            '                 <input type="hidden" id="wisp-target-device" value="radio0">',
            '                 <input type="hidden" id="wisp-target-bssid" value=""></input>',
            '              </div>',
            '           </div>',
            '        </div>',
            '      </div>',
            '      <div id="fields-lan" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_LAN}}</div>',
            '        <label class="nw-switch-row-padded" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; margin-top:5px; padding-bottom:10px;">',
            '           <div style="flex:1; padding-right:15px;">',
            '              <div style="font-size:15px; font-weight:bold; color:#475569; margin-bottom:5px;">{{LBL_IPV6}}</div>',
            '              <div id="tip-ipv6-warn" style="display:none; font-size:12px; color:#f00; font-weight:bold; margin-top:6px; background:#fffbeb; padding:6px 8px; border-radius:6px; border:1px solid #f00; word-break:break-word; line-height:1.4;">{{TIP_IPV6_WARN}}</div>',
            '              <div style="font-size:13.5px; color:#64748b; line-height:1.4;">{{TIP_IPV6_DESC}}</div>',
            '           </div>',
            '           <div class="nw-switch" style="width:42px; height:22px; flex-shrink:0;"><input type="checkbox" id="lan-ipv6-toggle"><span class="nw-slider"></span></div>',
            '        </label>',
            '        <div class="nw-setting-row">',
            '           <div class="nw-setting-row-label">{{LBL_BYPASS}}</div>',
            '           <label class="nw-switch"><input type="checkbox" id="lan-bypass-toggle"><span class="nw-slider"></span></label>',
            '        </div>',
            '        <div id="lan-bypass-warning" class="nw-warn-bypass" style="display:none;">{{WARN_BYPASS}}</div>',
            '        <div id="lan-main-warning" class="nw-warn-main">{{WARN_MAIN}}</div>',
            '        <div class="nw-value"><label class="nw-value-title">{{LBL_LAN_IP}}</label><div class="nw-value-field"><input type="text" id="lan-ip" placeholder="{{PH_IP}}"></div></div>',
            '        <div class="nw-value"><label class="nw-value-title" style="display:flex; flex-direction:column; align-items:flex-start; justify-content:center; gap:6px;"><span>{{LBL_LAN_GW}}</span><span id="btn-auto-ip" style="color:#3b82f6; cursor:pointer; font-size:11.5px; font-weight:bold; padding:3px 8px; margin-left: 10px; background:#eff6ff; border-radius:4px; transition:all 0.2s; line-height:1; border:1px solid #bfdbfe;">{{BTN_AUTO_DETECT}}</span></label><div class="nw-value-field"><input type="text" id="lan-gw" placeholder="{{PH_LAN_GW}}"></div></div>',
            '        <div class="nw-legacy-row">',
            '           <div class="nw-flex-1">',
            '               <div class="nw-desc-title">{{LBL_FORCE_APPLY}}</div>',
            '               <div style="font-size: 13.5px; color: #64748b; margin-top: 4px; word-break: break-word; line-height: 1.4;">{{DESC_FORCE_APPLY}}</div>',
            '           </div>',
            '           <label class="nw-switch nw-flex-shrink-0"><input type="checkbox" id="lan-safe-toggle" checked><span class="nw-slider"></span></label>',
            '        </div>',
            '      </div>',
            '    </div>',
            '    <div class="nw-actions"><button id="btn-back-1" class="nw-u-btn nw-u-btn-red">{{BTN_BACK}}</button><button id="btn-next-2" class="nw-u-btn nw-u-btn-green">{{BTN_NEXT}}</button></div>',
            '  </div>',
            '  <div id="step-3" class="nw-step" style="display: none;">',
            '    <div class="nw-confirm-board">',
            '      <div class="nw-top-back" id="top-back-2" title="{{BTN_EDIT}}">',
            '         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
            '      </div>',
            '      <div class="nw-step-title">{{TITLE_CONFIRM}}</div>',
            '      <p class="nw-confirm-desc">{{DESC_CONFIRM}}</p>',
            '      <div id="confirm-mode-text" class="nw-confirm-mode-text"></div>',
            '      <div class="nw-note-box">',
            '        <div class="nw-note-title">{{NOTE_TITLE}}</div>',
            '        <div class="nw-note-item"><span style="color:#3b82f6;">•</span> <span>{{NOTE_1}}</span></div>',
            '        <div class="nw-note-item"><span style="color:#10b981;">•</span> <span>{{NOTE_2}}</span></div>',
            '      </div>',
            '    </div>',
            '    <div class="nw-actions"><button id="btn-back-2" class="nw-u-btn nw-u-btn-red">{{BTN_BACK}}</button><button id="btn-apply" class="nw-u-btn nw-u-btn-green">{{BTN_APPLY}}</button></div>',
            '  </div>'
        ].join('');

        for (var k in T) {
            htmlTemplate = htmlTemplate.split('{{' + k + '}}').join(T[k]);
        }
        container.innerHTML = htmlTemplate;
        this.bindEvents(container);
        return container;
    },

    bindEvents: function (container) {
        // =================高级设置弹窗与逻辑=================
        function showAdvModal(title, html, onOk) {
            var bg = document.createElement('div');
            bg.id = 'nw-adv-modal';
            bg.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);';
            var box = document.createElement('div');
            box.style.cssText = 'background:#fff; width:420px; max-width:90%; border-radius:12px; padding:24px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); font-family:sans-serif;';
            box.innerHTML = '<div style="font-size:18px; font-weight:bold; color:#1e293b; margin-bottom:15px; text-align:center;">' + title + '</div>' + 
                            '<div style="margin-bottom:20px; color:#475569; text-align:left; font-size:14.5px;">' + html + '</div>' +
                            '<div class="nw-modal-btn-wrap" style="display:flex; justify-content:space-between; gap:12px; margin-top:25px;">' +
                            '<button id="mdl-cancel" class="nw-u-btn nw-u-btn-gray" style="flex:1; margin:0;">' + (T['BTN_CANCEL']||'Cancel') + '</button>' +
                            '<button id="mdl-ok" class="nw-u-btn nw-u-btn-blue" style="flex:1; margin:0;">' + (T['BTN_OK']||'OK') + '</button>' +
                            '</div>';
            bg.appendChild(box); document.body.appendChild(bg);
            box.querySelector('#mdl-cancel').onclick = function() { document.body.removeChild(bg); };
            box.querySelector('#mdl-ok').onclick = function() { if(onOk(box) !== false) document.body.removeChild(bg); };
        }

        // ================= 高级与实验室：动态包裹与折叠逻辑 =================
        setTimeout(function() {
            var cloneLink = container.querySelector('#link-mac-clone');
            if (cloneLink) {
                var advBlock = cloneLink.closest('div[style*="margin-top"]');
                if (advBlock && advBlock.parentNode && !document.getElementById('nw-hidden-features')) {
                    var wrapper = document.createElement('div');
                    wrapper.id = 'nw-hidden-features';
                    // 加上 overflow: hidden，高度折叠时内部元素才不会溢出
                    wrapper.style.overflow = 'hidden'; 
                    wrapper.style.display = 'none';
                    wrapper.style.opacity = '0';
                    wrapper.style.height = '0px'; // 初始高度为 0
                    
                    advBlock.parentNode.insertBefore(wrapper, advBlock);
                    while (wrapper.nextElementSibling) {
                        wrapper.appendChild(wrapper.nextElementSibling);
                    }
                }
            }
        }, 150);

        // 2. 监听按钮点击，出场动画
        container.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'nw-toggle-adv') {
                var wrapper = document.getElementById('nw-hidden-features');
                if (wrapper && !wrapper.isAnimating) {
                    wrapper.isAnimating = true; 
                    var isHidden = wrapper.style.display === 'none';
                    
                    if (isHidden) {
                        // 动画
                        wrapper.style.display = 'block';
                        var targetHeight = wrapper.scrollHeight; 
                        
                        wrapper.offsetHeight; // 强制浏览器重绘
                        
                        wrapper.style.transition = 'height 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
                        wrapper.style.height = targetHeight + 'px';
                        wrapper.style.opacity = '1';
                        
                        e.target.innerHTML = (T['BTN_ADV_HIDE'] || 'Advanced Settings ▲');
                        e.target.style.background = 'rgba(0,0,0,0.3)';
                        
                        // 动画
                        setTimeout(function() { 
                            wrapper.style.height = 'auto'; // 解除高度锁定
                            wrapper.isAnimating = false; 
                            
                            wrapper.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        }, 500);
                    } else {
                        // 收合
                        var currentHeight = wrapper.scrollHeight;
                        wrapper.style.height = currentHeight + 'px'; 
                        
                        wrapper.offsetHeight; // 强制重绘
                        
                        wrapper.style.transition = 'height 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
                        wrapper.style.height = '0px';
                        wrapper.style.opacity = '0';
                        
                        e.target.innerHTML = (T['BTN_ADV_SHOW'] || 'Advanced Settings ▼');
                        e.target.style.background = 'rgba(0,0,0,0.15)';
                        
                        // 收合动画滚动回页面最上方
                        setTimeout(function() {
                            // 让整个插件的主容器顶部对齐屏幕顶部，兼容所有主题
                            if (container) {
                                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 50);
                        
                        // 计时器同步：等 450 毫秒动画彻底播完后，再彻底隐藏元素
                        setTimeout(function() {
                            wrapper.style.display = 'none';
                            wrapper.isAnimating = false;
                        }, 450); 
                    }
                }
            }
        });
        // =================================================================

        // MAC 克隆
        if(container.querySelector('#link-mac-clone')) {
            container.querySelector('#link-mac-clone').addEventListener('click', function() {
                callGetAdvSettings().then(function(res) {
                    var currentMac = (res && res.mac !== 'none') ? res.mac : '';
                    var html ='<div style="font-size:13px; color:#64748b; margin-bottom:12px; line-height:1.5; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">' +
                               (T['MSG_MAC_CLONE_TIP'] || '💡 <b>Tip:</b> If dial-up fails, enter the cloned MAC here.') +
                               '</div>' +
                               '<input type="text" id="mdl-mac-val" value="' + currentMac + '" placeholder="' + (T['PH_MAC'] || 'e.g., AA:BB:CC:DD:EE:FF') + '" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; margin-bottom:10px; font-size:14px; box-sizing:border-box; background-color: #fff !important; color: #000 !important;">' +
                               '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                               '<a href="javascript:void(0)" id="mdl-get-mac" style="color:#0284c7; font-size:13.5px; text-decoration:none;">' + (T['BTN_GET_MAC'] || '⚡ Auto-fill MAC') + '</a>' +
                               '<a href="javascript:void(0)" id="mdl-clear-mac" style="color:#ef4444; font-size:13.5px; text-decoration:none;">' + (T['BTN_CLEAR'] || 'Clear (Restore Default)') + '</a>' +
                               '</div>';
                    showAdvModal((T['LBL_MAC_CLONE'] || 'MAC Clone'), html, function(box) {
                        var m = box.querySelector('#mdl-mac-val').value.trim();
                        if (m && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/i.test(m)) { 
                            openModal({ title: T['M_FMT_TIT'] || 'Format Error', msg: '<div style="font-size:15px; color:#ef4444; font-weight:bold;">' + (T['M_FMT_MAC'] || 'Invalid MAC address format!') + '</div>', okText: T['BTN_OK'] || 'OK' });
                            var gm = document.getElementById('nw-global-modal'); if (gm) gm.style.zIndex = '100000';
                            return false; 
                        }
                        openModal({ title: (T['LBL_MAC_CLONE'] || 'MAC Clone'), msg: (T['MSG_WRITING'] || 'Saving...'), spin: true });
                        var gm2 = document.getElementById('nw-global-modal'); if (gm2) gm2.style.zIndex = '100000'; // 儲存動畫也要確保在頂層
                        callSetAdvSettings(m || 'none', '', '').then(function() { setTimeout(function(){ window.location.reload(); }, 2500); });
                    });
                    document.getElementById('mdl-get-mac').onclick = function() {
                        callGetClientMac().then(function(r) {
                            if(r && r.mac) {
                                document.getElementById('mdl-mac-val').value = r.mac.toUpperCase();
                            } else {
                                openModal({ title: T['M_SYS_ERR'] || 'Notice', msg: '<div style="font-size:15px; color:#f59e0b; font-weight:bold;">' + (T['MSG_MAC_NOT_FOUND'] || 'No active device connection detected.') + '</div>', okText: T['BTN_OK'] || 'OK' });
                                var gm = document.getElementById('nw-global-modal'); if (gm) gm.style.zIndex = '100000';
                            }
                        });
                    };
                    document.getElementById('mdl-clear-mac').onclick = function() { document.getElementById('mdl-mac-val').value = ''; };
                });
            });
        }

        // 定时重启 (多选增强版)
        if(container.querySelector('#link-cron-reboot')) {
            container.querySelector('#link-cron-reboot').addEventListener('click', function() {
                callGetAdvSettings().then(function(res) {
                    var c = res.cron || 'off'; 
                    var isOff = (c === 'off');
                    var m = "00", h = "04", d = "*";
                    
                    // 解析后端传来的 Cron 表达式
                    if (!isOff && c.split(' ').length >= 5) { 
                        var pts = c.split(' '); 
                        m = pts[0].padStart(2, '0'); 
                        h = pts[1].padStart(2, '0'); 
                        d = pts[4]; 
                    }
                    
                    // 将星期字符串转换为数组，方便匹配
                    var dArr = (d === '*') ? ['0','1','2','3','4','5','6'] : d.split(',');
                    // 辅助函数：如果在数组中，则直接在 HTML 层面打上勾
                    var chk = function(val) { return dArr.indexOf(val) !== -1 ? 'checked' : ''; };
                    
                    // 复选框抵消 LuCI 全局主题的 top: .4rem 偏移
                    var cbBoxStyle = 'margin:0; position:relative; top:0; transform:none; cursor:pointer; background-color: var(--primary) !important;';
                    
                    var html = '<label style="display:flex; align-items:center; gap:3px; margin-bottom:15px; font-weight:bold; color:#334155; cursor:pointer;">' +
                               '<input type="checkbox" id="mdl-cron-en" style="' + cbBoxStyle + ' width:16px; height:16px;" '+(isOff?'':'checked')+'>' +
                               '<span style="line-height:1; margin-top:-2px;">' + (T['LBL_CRON_ENABLE'] || 'Enable') + '</span></label>' +
                               '<div id="mdl-cron-box" style="display:'+(isOff?'none':'block')+';">' +
                               '<div style="font-size:13.5px; color:#64748b; margin-bottom:8px;">' + (T['LBL_CRON_TIME'] || 'Time:') + '</div>' +
                               '<input type="time" id="mdl-cron-time" value="'+h+':'+m+'" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:14.5px; font-family:monospace; margin-bottom:15px; box-sizing:border-box; background-color: #64748B !important; color: #fff !important;">' +
                               '<div style="font-size:13.5px; color:#64748b; margin-bottom:8px;">' + (T['LBL_CRON_DAYS'] || 'Days:') + '</div>' +
                               '<div id="mdl-cron-days" style="display:flex; flex-wrap:wrap; gap:17px; margin-bottom:5px;">' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="1" '+chk('1')+'>' + (T['LBL_DAY_1'] || '1') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="2" '+chk('2')+'>' + (T['LBL_DAY_2'] || '2') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="3" '+chk('3')+'>' + (T['LBL_DAY_3'] || '3') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="4" '+chk('4')+'>' + (T['LBL_DAY_4'] || '4') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="5" '+chk('5')+'>' + (T['LBL_DAY_5'] || '5') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="6" '+chk('6')+'>' + (T['LBL_DAY_6'] || '6') + '</label>' +
                               '<label style="display:flex; align-items:center; gap:0px; font-size:14.5px; cursor:pointer;"><input type="checkbox" style="' + cbBoxStyle + '" class="c-day" value="0" '+chk('0')+'>' + (T['LBL_DAY_0'] || '0') + '</label>' +
                               '</div></div>';
                               
                    showAdvModal((T['LBL_CRON_REBOOT'] || 'Scheduled Reboot'), html, function(box) {
                        var en = box.querySelector('#mdl-cron-en').checked;
                        var cronStr = 'off';
                        if(en) {
                            var sel = [];
                            var chks = box.querySelectorAll('.c-day');
                            for(var i=0; i<chks.length; i++) { if(chks[i].checked) sel.push(chks[i].value); }
                            
                            // 没有勾选任何一天，阻止保存
                            if(sel.length === 0) { 
                                openModal({ title: T['M_INC_TIT'] || 'Notice', msg: '<div style="font-size:15px; color:#ef4444; font-weight:bold;">' + (T['MSG_CRON_NO_DAY'] || 'Please select at least one day!') + '</div>', okText: T['BTN_OK'] || 'OK' });
                                var gm = document.getElementById('nw-global-modal'); if (gm) gm.style.zIndex = '100000';
                                return false; 
                            }
                            
                            // 生成 Linux 标准 Cron 表达式 (7天全选则直接用星号)
                            var dStr = (sel.length === 7) ? '*' : sel.join(',');
                            var tParts = (box.querySelector('#mdl-cron-time').value || '04:00').split(':');
                            cronStr = parseInt(tParts[1]) + " " + parseInt(tParts[0]) + " * * " + dStr;
                        }
                        openModal({ title: (T['LBL_CRON_REBOOT'] || 'Scheduled Reboot'), msg: (T['MSG_WRITING'] || 'Saving...'), spin: true });
                        var gm2 = document.getElementById('nw-global-modal'); if (gm2) gm2.style.zIndex = '100000';
                        callSetAdvSettings('', '', cronStr).then(function() { setTimeout(function(){ window.location.reload(); }, 1500); });
                    });
                    
                    // 弹窗出现后，初始化复选框与详情区域的联动显示逻辑
                    document.getElementById('mdl-cron-en').onchange = function() { 
                        document.getElementById('mdl-cron-box').style.display = this.checked ? 'block' : 'none'; 
                    };
                });
            });
        }

        // 外网访问开关与自定义端口
        if(container.querySelector('#adv-web-toggle')) {
            var webTog = container.querySelector('#adv-web-toggle');
            var webPort = container.querySelector('#adv-web-port');
            var lastValidPort = '';
            var isSaving = false; // 防重复提交锁

            // 校验与保存通道
            function validateAndSavePort(portStr) {
                if (isSaving) return;

                var pText = portStr.trim();
                if (pText !== '') {
                    var pNum = parseInt(pText);
                    
                    // 拦截非法数字范围
                    if (isNaN(pNum) || pNum < 1 || pNum > 65535) {
                        openModal({ title: T['M_REP_NOTICE_TIT'] || 'Notice', msg: T['M_PORT_RANGE'] || '⚠️ Port number must be between 1 and 65535', okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                        webPort.value = lastValidPort; 
                        // 根据历史状态来决定开关是开是关
                        if (lastValidPort === '') webTog.checked = false; else webTog.checked = true;
                        return;
                    }
                    
                    // 拦截高危系统端口
                    var dangerPorts = [21, 22, 23, 53, 67, 68, 445];
                    if (dangerPorts.indexOf(pNum) !== -1) {
                        var e1 = T['M_PORT_ERR1'] || '⚠️ For system security, do not use';
                        var e2 = T['M_PORT_ERR2'] || 'as the external port. It is a reserved high-risk port.';
                        var sg = T['M_PORT_SUGG'] || 'It is recommended to use 8080 or a port above 10000.';
                        openModal({ title: T['M_REP_NOTICE_TIT'] || 'Notice', msg: e1 + ' <span style="color:#ef4444; font-weight:bold;">' + pNum + '</span> ' + e2 + '<br><br>' + sg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                        webPort.value = lastValidPort;
                        // 根据历史状态来决定开关是开是关
                        if (lastValidPort === '') webTog.checked = false; else webTog.checked = true;
                        return;
                    }
                }

                // 通过所有安检，开始执行保存
                isSaving = true;
                var val = pText ? pText : '1';
                var oldPort = lastValidPort; // 旧端口备份
                
                webTog.checked = true; // 确保开关 UI 处于打开状态
                
                openModal({ title: T['LBL_ADV_UTILS_TITLE'] || '⚙️ Advanced Utilities', msg: T['MSG_WRITING'] || 'Please wait...', spin: true });
                var gm2 = document.getElementById('nw-global-modal'); if (gm2) gm2.style.zIndex = '100000';
                
                callSetAdvSettings('', val, '', '').then(function(res) { 
                    // 此时 res 已经是完整的 JSON，可以成功读取 status
                    if (res && res.status === 'error') {
                        isSaving = false; // 遭遇拦截时，解除防抖锁
                        
                        // 完美回滚数值和开关状态
                        lastValidPort = oldPort;
                        webPort.value = oldPort; 
                        if (oldPort === '') webTog.checked = false;
                        
                        // 弹出红色警告窗口
                        var p1 = T['M_PORT_CONFLICT_P1'] || 'Port';
                        var p2 = T['M_PORT_CONFLICT_P2'] || 'is already in use by another application!';
                        var errMsg = '⚠️ ' + p1 + ' ' + val + ' ' + p2;
                        
                        openModal({ 
                            title: '⚠️ ' + (T['M_REP_NOTICE_TIT'] || 'Notice'), 
                            msg: '<div style="color:#ef4444; font-weight:bold; padding: 10px 0;">' + errMsg + '</div>', 
                            okText: T['M_CLOSE'] || 'Close', 
                            hideCancel: true 
                        });
                        return; // 中止后续的 reload，画面静止
                    }
                    
                    // 后端没有报错，才正式把新端口覆盖进内存
                    lastValidPort = val;
                    setTimeout(function(){ window.location.reload(); }, 3500); 
                }).catch(function() {
                    isSaving = false;
                    lastValidPort = oldPort;
                    webPort.value = oldPort;
                    openModal({ title: '⚠️ Error', msg: '<div style="color:#ef4444; font-weight:bold;">Network Error or System Busy!</div>', okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                });
            }

            // 1. 页面初始化加载历史状态
            callGetAdvSettings().then(function(res) { 
                if (res) {
                    if (res.last_port && res.last_port !== '80' && res.last_port !== '1' && res.last_port !== '0') {
                        webPort.value = res.last_port;
                        lastValidPort = res.last_port;
                    }
                    if (res.web && res.web !== '0') { 
                        webTog.checked = true; 
                        if (res.web !== '1') {
                            webPort.value = res.web;
                            lastValidPort = res.web;
                        }
                        
                        // === IPv6 直达链接 ===
                        if (res.wan6_ip) {
                            if (!container.querySelector('#nw-v6-link')) {
                                var curPort = (res.web !== '1') ? res.web : '80';
                                var v6Link = 'http://[' + res.wan6_ip + ']:' + curPort;
                                
                                var linkDiv = document.createElement('div');
                                linkDiv.id = 'nw-v6-link'; 
                                
                                linkDiv.style.cssText = 'width: 100%; text-align: left; margin-top: 4px; font-size: 13.5px; opacity: 0.9; display: block;';
                                linkDiv.innerHTML = '<a href="' + v6Link + '" target="_blank" style="color: #0ea5e9; text-decoration: underline; font-family: monospace; font-weight: bold; font-size: 14px;">' + v6Link + '</a>';
                                
                                var rowContainer = webPort.parentNode.parentNode;
                                rowContainer.insertAdjacentElement('afterend', linkDiv);
                            }
                        }
                        // ==================================================
                    }
                } 
            });
            
            // 2. 点击开关事件
            webTog.addEventListener('change', function() { 
                if (this.checked) {
                    // 开关打开时，强制把框内的值送去中央安检站
                    validateAndSavePort(webPort.value);
                } else {
                    // 开关关闭时
                    if (isSaving) return;
                    isSaving = true;
                    openModal({ title: T['LBL_ADV_UTILS_TITLE'] || '⚙️ Advanced Utilities', msg: T['MSG_WRITING'] || 'Please wait...', spin: true });
                    var gm2 = document.getElementById('nw-global-modal'); if (gm2) gm2.style.zIndex = '100000';
                    callSetAdvSettings('', '0', '', '').then(function() { 
                        setTimeout(function(){ window.location.reload(); }, 3500); 
                    }).catch(function() {
                        isSaving = false;
                        window.location.reload(); // 异常兜底直接刷新
                    });
                }
            });

            // 3. 回车键主动触发
            webPort.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur(); 
                }
            });

            // 4. 输入框内容改变且失去焦点事件
            webPort.addEventListener('change', function() {
                var self = this;
                setTimeout(function() {
                    // 如果此时开关处于关闭状态，说明用户不想保存，直接退出
                    if (!webTog.checked) return;
                    validateAndSavePort(self.value);
                }, 200);
            });
        }
        // ====================================================

        // 插件修复弹窗与逻辑
        if(container.querySelector('#link-repair-plugin')) {
            container.querySelector('#link-repair-plugin').addEventListener('click', function() {
                openModal({ title: T['M_REP_SCAN_TIT'] || 'Please wait', msg: T['M_REP_SCAN_MSG'] || 'Scanning for repairable plugins...', hideCancel: true, hideOk: true });

                rpc.declare({ object: 'netwiz', method: 'get_repairable_configs', expect: { '': {} } })().then(function(res) {
                    if (res && res.configs && res.configs.length > 0) {
                        
                        var descText = T['M_REP_DESC'] || 'Standard uninstallation does not remove plugin configuration files. If a plugin malfunctions after reinstallation, select it below to reset it to its initial state.';
                        var descHtml = '<p style="color:#64748b; font-size:13px; margin-bottom:15px; line-height:1.5;">' + descText + '</p>';
                        
                        var optText = ' (' + (T['M_REP_OPT'] || 'Factory Default') + ')';
                        var selectHtml = '<select id="nw-repair-select" style="width:100%; height:40px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:14px; outline:none; margin-bottom:10px; background-color: #fff !important; color: #000;">';
                        res.configs.forEach(function(pluginName) {
                            selectHtml += '<option value="' + pluginName + '">' + pluginName + optText + '</option>';
                        });
                        selectHtml += '</select>';

                        var titleText = T['M_REP_TIT'] || '🚑 Plugin Repair Toolkit';
                        var titleWithX = '<div style="display:flex; justify-content:space-between; align-items:center;"><span>' + titleText + '</span><span onclick="document.getElementById(\'nw-global-modal\').style.display=\'none\'" style="cursor:pointer; color:#ffffff; font-size:40px; line-height:1; margin-right:15px;">&times;</span></div>';

                        openModal({
                            title: titleWithX,
                            msg: descHtml + selectHtml,
                            okText: T['M_REP_OK'] || 'Repair Now',
                            cancelText: T['M_CLOSE'] || 'Close',
                            isDanger: true,
                            onOk: function() {
                                var selectedPlugin = document.getElementById('nw-repair-select');
                                if (!selectedPlugin || !selectedPlugin.value) return;
                                var pName = selectedPlugin.value;
                                
                                var pTit = T['M_REP_PROC_TIT'] || 'Processing';
                                var pMsg1 = T['M_REP_PROC_MSG1'] || 'Repairing and restarting';
                                var pMsg2 = T['M_REP_SCAN_TIT'] || 'please wait';
                                openModal({ title: pTit, msg: pMsg1 + ' ' + pName + ' ' + pMsg2, hideCancel: true, hideOk: true });
                                
                                rpc.declare({ object: 'netwiz', method: 'repair_config', params: ['plugin'], expect: { '': {} } })(pName).then(function(r) {
                                    if (r && r.result === 0) {
                                        var sTit = T['M_REP_SUCC_TIT'] || 'Repair Successful';
                                        var sMsg = T['M_REP_SUCC_MSG'] || 'has been successfully restored';
                                        openModal({ title: sTit, msg: pName + ' ' + sMsg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                                    } else {
                                        var fTit = T['M_REP_FAIL_TIT'] || 'Repair Failed';
                                        var fMsg = T['M_REP_FAIL_MSG'] || 'Unable to repair this plugin';
                                        openModal({ title: fTit, msg: fMsg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                                    }
                                }).catch(function() {
                                    var eTit = T['M_REP_ERR_TIT'] || 'System Error';
                                    var eMsg = T['M_REP_ERR_MSG'] || 'Request timeout or error';
                                    openModal({ title: eTit, msg: eMsg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                                });
                            }
                        });
                    } else {
                        var nTit = T['M_REP_NOTICE_TIT'] || 'Notice';
                        var nMsg = T['M_REP_EMPTY_MSG'] || 'No repairable plugins found';
                        openModal({ title: nTit, msg: nMsg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                    }
                }).catch(function() {
                    var errTit = T['M_ERR'] || 'Error';
                    var errMsg = T['M_REP_GET_ERR'] || 'Failed to get plugin list';
                    openModal({ title: errTit, msg: errMsg, okText: T['M_CLOSE'] || 'Close', hideCancel: true });
                });
            });
        }

        // 修改 Hosts
        if(container.querySelector('#link-modify-hosts')) {
            container.querySelector('#link-modify-hosts').addEventListener('click', function() {
                callGetAdvSettings().then(function(res) {
                    var hostsArr = [];
                    try { hostsArr = (typeof res.hosts === 'string') ? JSON.parse(res.hosts) : (res.hosts || []); if (!Array.isArray(hostsArr)) hostsArr = []; } catch(e) { hostsArr = []; }
                    var esc = function(s) { return (s || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); };

                    // 记录打开时的初始数据快照，用于“未修改防呆拦截”
                    var initialData = hostsArr.filter(function(item) { return item.ip.trim() !== '' && item.dom.trim() !== ''; });
                    var initialJsonStr = JSON.stringify(initialData);

                    var html = '<div id="nw-hosts-visual-ui">' +
                           '<div style="font-size:13px; color:#64748b; margin-bottom:12px; line-height:1.5;">' + (T['LBL_HOSTS_DESC'] || '💡 This feature forces specific domains to resolve to designated IPs. Commonly used for ad blocking or local NAS redirection.') + '</div>' +
                           '<div style="background:#eff6ff; border:1px dashed #93c5fd; padding:12px; border-radius:8px; margin-bottom:15px;">' +
                               '<div style="font-size:13px; color:#1e3a8a; font-weight:bold; margin-bottom:10px;">' + (T['LBL_HOSTS_VISUAL'] || '💡 Quick Add:') + '</div>' +
                                    '<div style="display:flex; gap:10px; margin-bottom:10px; width:100%; box-sizing:border-box;">' +
                                        '<input type="text" id="nw-quick-dom" placeholder="' + (T['PH_HOSTS_DOMAIN'] || 'Domain') + '" style="flex:1 1 0%; min-width:0; height:36px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13.5px; box-sizing:border-box; background-color: #ffffff !important; color: #000 !important;">' +
                                        '<input type="text" id="nw-quick-ip" value="127.0.0.1" placeholder="' + (T['PH_HOSTS_IP'] || 'IP') + '" style="flex:1 1 0%; min-width:0; height:36px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13.5px; box-sizing:border-box; background-color: #ffffff !important; color: #000 !important;">' +
                                    '</div>' +
                                    '<div style="display:flex; gap:10px; width:100%; box-sizing:border-box; align-items:center;">' +
                                        '<input type="text" id="nw-quick-cmt" placeholder="' + (T['PH_HOSTS_CMT'] || 'Comment') + '" style="flex:1 1 0%; min-width:0; height:36px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13px; box-sizing:border-box; background-color: #ffffff !important; color: #000 !important;">' +
                                        '<label style="display:flex; align-items:center; font-size:13px; color:#2563eb; cursor:pointer; flex-shrink:0; user-select:none;" title="' + (T['TIP_SMART_ADD'] || 'Auto-fill IPv4/v6 & www combinations') + '">' +
                                            '<input type="checkbox" id="nw-smart-add-cb" checked style="top:0px; background-color: var(--primary) !important;">' +
                                            '<span class="nw-hide-mob">' + (T['LBL_SMART_ADD'] || 'Smart Auto-fill') + '</span>' +
                                        '</label>' +
                                        '<button id="nw-quick-add-btn" class="nw-u-btn" style="flex:0 0 auto; flex-shrink:0; white-space:nowrap; padding:0 15px; height:36px; background:#fff; color:#2563eb; border:1px solid #2563eb; border-radius:6px; font-weight:bold; cursor:pointer; transition:all 0.2s; min-width: 70px; padding: 5px 10px 5px 5px !important;">' + (T['BTN_HOSTS_ADD'] || '➕ Add') + '</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="nw-hosts-list" style="max-height:280px; overflow-y:auto; overflow-x:hidden; padding-right:5px; margin-bottom:10px;"></div>' +
                            '</div>' +
                            '<div id="nw-hosts-raw-ui" style="display:none; margin-bottom:10px;">' +
                                '<div style="font-size:13px; color:#64748b; margin-bottom:10px; line-height: 1.6;">' + (T['LBL_HOSTS_RAW_TIP'] || '💡 <b>Pure Text Advanced Mode</b>: Supports batch pasting. Format: <code>IP Domain #Comment</code>') + '</div>' +
                                '<textarea id="nw-hosts-raw-text" spellcheck="false" style="width:100%; height:320px; border:1px solid #cbd5e1; border-radius:8px; padding:12px; font-family:monospace; font-size:13.5px; box-sizing:border-box; background:#f8fafc; color:#334155; line-height:1.6; resize:none;"></textarea>' +
                            '</div>';
                            
                    var isRawMode = false;

                    showAdvModal((T['LBL_HOSTS_TITLE']), html, function(box) {
                        // 记忆触发保存时的UI状态
                        var wasRaw = isRawMode;
                        
                        if (isRawMode) { var tBtn = document.getElementById('nw-hosts-raw-toggle'); if(tBtn) tBtn.click(); }
                        
                        // 纯文本转换失败，此时 isRawMode 会被恢复为 true。阻止弹窗关闭和保存
                        if (isRawMode) return false;

                        var finalData = hostsArr.filter(function(item) { return item.ip.trim() !== '' && item.dom.trim() !== ''; });
                        var jsonStr = JSON.stringify(finalData);
                        
                        // 比对数据与初始数据快照
                        if (jsonStr === initialJsonStr) {
                            openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['MSG_NO_CHANGE'] || 'No changes have been made.', okText: T['M_CLOSE'] || 'Close' });
                            
                            // 原本是在纯文字模式下触发的，瞬间将UI恢复回纯文字模式
                            if (wasRaw) {
                                isRawMode = true;
                                document.getElementById('nw-hosts-visual-ui').style.display = 'none';
                                document.getElementById('nw-hosts-raw-ui').style.display = 'block';
                                var rawToggleBtn = document.getElementById('nw-hosts-raw-toggle');
                                if (rawToggleBtn) rawToggleBtn.style.color = '#2563eb';
                            }
                            
                            return false; // 终止后续的写入与重启
                        }
                        
                        openModal({ title: (T['MSG_WRITING'] || 'Saving...'), msg: (T['MSG_WAIT'] || 'Please wait...'), spin: true });
                        var gm2 = document.getElementById('nw-global-modal'); if (gm2) gm2.style.zIndex = '100000';
                        callSetAdvSettings('', '', '', jsonStr).then(function() { setTimeout(function(){ window.location.reload(); }, 1500); });
                    });
                    
                    var modalBox = document.getElementById('nw-adv-modal');
                    if (modalBox) {
                        var innerBox = modalBox.querySelector('div');
                        if (innerBox) { innerBox.style.width = '460px'; innerBox.style.maxWidth = '95%'; }
                    }
                    
                    var toggleBtn = document.getElementById('nw-hosts-raw-toggle');
                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', function(e) {
                            // 1：判断切换，是手动点，还是点击底部保存时程序自动触发
                            var isIntentSave = (e && e.isTrusted === false); 
                            
                            isRawMode = !isRawMode;
                            var visualUi = document.getElementById('nw-hosts-visual-ui');
                            var rawUi = document.getElementById('nw-hosts-raw-ui');
                            var rawText = document.getElementById('nw-hosts-raw-text');
                            
                            if (isRawMode) {
                                // 1. UI 切 纯文本
                                var textContent = '';
                                hostsArr.forEach(function(item) {
                                    var prefix = item.en ? '' : '# '; 
                                    var cmt = item.cmt ? ' \t# ' + item.cmt : '';
                                    textContent += prefix + item.ip + '\t' + item.dom + cmt + '\n';
                                });
                                rawText.value = textContent;
                                visualUi.style.display = 'none'; rawUi.style.display = 'block';
                            } else {
                                // 2. 纯文本 切 UI (查重与格式拦截)
                                var lines = rawText.value.split('\n');
                                var newArr = [];
                                var errorCount = 0; 

                                lines.forEach(function(line) {
                                    line = line.trim(); if (!line) return;
                                    var en = true;
                                    if (line.charAt(0) === '#') {
                                        var uncommented = line.substring(1).trim();
                                        if (/^[a-fA-F0-9\.:]+\s+[^\s#]+/.test(uncommented)) { en = false; line = uncommented; } else { return; }
                                    }
                                    var match = line.match(/^([a-fA-F0-9\.:]+)\s+([^\s<>"'\*#]+)(?:\s+#\s*(.*))?$/);
                                    if (match) { 
                                        var parsedIp = match[1];
                                        var isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedIp);
                                        var isIpv6 = /^[a-fA-F0-9:]+:[a-fA-F0-9:]+$/.test(parsedIp);
                                        if (isIpv4 || isIpv6) { 
                                            var isDup = newArr.some(function(x) { return x.ip === parsedIp && x.dom === match[2]; });
                                            if (isDup) { errorCount++; } else { newArr.push({ ip: parsedIp, dom: match[2], cmt: match[3] || '', en: en }); }
                                        } else { errorCount++; }
                                    } else { errorCount++; }
                                });

                                var processValidData = function() {
                                    hostsArr = newArr;
                                    renderHosts();
                                    rawUi.style.display = 'none'; 
                                    visualUi.style.display = 'block';
                                    var tBtn = document.getElementById('nw-hosts-raw-toggle');
                                    if (tBtn) tBtn.style.color = 'reb';
                                };

                                if (errorCount > 0) {
                                    isRawMode = true; 
                                    var confirmMsg = (T['MSG_RAW_ERR_1'] || 'Found invalid or duplicate records:') + ' ' + 
                                    '<b style="color:#ef4444; font-size:16px;">' + errorCount + '</b><br><br>' + 
                                    (T['MSG_RAW_ERR_2'] || 'Click [OK] to automatically discard them and continue, or [Cancel] to manually fix them.');
                                    
                                    openModal({
                                        title: T['M_INC_TIT'] || 'Notice',
                                        msg: '<div style="white-space:pre-wrap; line-height:1.6; font-size:14.5px; color:#475569;">' + confirmMsg + '</div>',
                                        okText: T['BTN_OK'] || 'OK',
                                        cancelText: T['BTN_CANCEL'] || 'Cancel',
                                        isDanger: true, 
                                        onCancel: function() {
                                            var gm = document.getElementById('nw-global-modal'); if (gm) gm.style.display = 'none';
                                        },
                                        onOk: function() {
                                            var cleanText = '';
                                            newArr.forEach(function(item) {
                                                var prefix = item.en ? '' : '# '; 
                                                var cmt = item.cmt ? ' \t# ' + item.cmt : '';
                                                cleanText += prefix + item.ip + '\t' + item.dom + cmt + '\n';
                                            });
                                            rawText.value = cleanText;
                                            isRawMode = false; 
                                            processValidData();
                                            var gm = document.getElementById('nw-global-modal'); if (gm) gm.style.display = 'none';
                                            
                                            // 在清洗完成后，自动保存
                                            if (isIntentSave) {
                                                var mdlOk = document.getElementById('mdl-ok');
                                                if (mdlOk) {
                                                    // 100ms 后再保存
                                                    setTimeout(function(){ mdlOk.click(); }, 100);
                                                }
                                            }
                                        }
                                    });
                                    return; 
                                }

                                processValidData();
                            }
                        });
                    }
                    
                    var renderHosts = function() {
                        var listHtml = '';
                        var totalItems = hostsArr.length;
                        hostsArr.forEach(function(item, idx) {
                            var opacity = item.en ? '1' : '0.5';
                            // 倒序排列公式：总长度减去当前索引
                            var displayNum = totalItems - idx; 
                            
                            listHtml += '<div style="margin-bottom:12px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; transition:opacity 0.2s;" id="h-row-'+idx+'" style="opacity:'+opacity+';">';
                            listHtml += '<div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">';
                            listHtml += '<div style="background:#e2e8f0; color:#475569; width:26px; height:26px; flex-shrink:0; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; border:1px solid #cbd5e1;">' + displayNum + '</div>';
                            listHtml += '<input type="text" class="h-dom nd-input" data-idx="'+idx+'" value="'+esc(item.dom)+'" placeholder="' + (T['PH_HOSTS_DOMAIN']||'Domain') + '" style="flex:1; width:50% !important; height:34px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13.5px; box-sizing:border-box; min-height: 34px !important;">';
                            listHtml += '<input type="text" class="h-ip nd-input" data-idx="'+idx+'" value="'+esc(item.ip)+'" placeholder="' + (T['PH_HOSTS_IP']||'IP') + '" style="flex:1; width:50% !important; height:34px; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13.5px; color: #000; box-sizing:border-box; min-height: 34px !important;">';
                            listHtml += '</div>';
                            listHtml += '<div style="display:flex; gap:8px; align-items:center;">';
                            listHtml += '<label class="nw-switch nw-flex-shrink-0" style="margin:0;"><input type="checkbox" class="h-en" data-idx="'+idx+'" '+(item.en?'checked':'')+'><span class="nw-slider"></span></label>';
                            listHtml += '<input type="text" class="h-cmt nd-input" data-idx="'+idx+'" value="'+esc(item.cmt)+'" placeholder="' + (T['PH_HOSTS_CMT']||'Comment') + '" style="flex:1; height:34px; min-height: 34px !important; border:1px solid #cbd5e1; border-radius:6px; padding:0 10px; font-size:13px; box-sizing:border-box; color:#64748b;">';
                            listHtml += '<button class="h-del nw-u-btn nw-u-btn-red" data-idx="'+idx+'" style="width:44px; min-width: 34px; height:34px; min-height:34px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:6px;" title="Delete">✕</button>';
                            listHtml += '</div></div>';
                        });
                        
                        if(hostsArr.length === 0) { listHtml = '<div style="text-align:center; color:#94a3b8; padding:20px 10px; font-size:13.5px; background:#f1f5f9; border-radius:8px; border:1px dashed #cbd5e1;">' + (T['TXT_HOSTS_EMPTY'] || 'No custom Hosts') + '</div>'; }
                        var listContainer = document.getElementById('nw-hosts-list');
                        listContainer.innerHTML = listHtml;
                        
                        listContainer.querySelectorAll('.h-en, .h-ip, .h-dom, .h-cmt').forEach(function(el) {
                            el.addEventListener('change', function() {
                                var idx = parseInt(this.getAttribute('data-idx'), 10);
                                if(this.classList.contains('h-en')) { hostsArr[idx].en = this.checked; document.getElementById('h-row-'+idx).style.opacity = this.checked ? '1' : '0.5'; }
                                
                                if(this.classList.contains('h-ip')) {
                                    var ipVal = this.value.trim();
                                    var isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipVal);
                                    var isIpv6 = /^[a-fA-F0-9:]+:[a-fA-F0-9:]+$/.test(ipVal);
                                    if (ipVal !== '' && !isIpv4 && !isIpv6) { 
                                        openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['M_FMT_IP'] || 'Invalid IP format!', okText: T['M_CLOSE'] || 'Close' }); 
                                        this.value = hostsArr[idx].ip; 
                                        return; 
                                    }
                                    // 查重防呆：不得与其他行的IP+域名组合完全相同
                                    var isDupIp = hostsArr.some(function(x, i) { return i !== idx && x.ip === ipVal && x.dom === hostsArr[idx].dom; });
                                    if (isDupIp) {
                                        openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['MSG_HOSTS_DUP'] || 'Already exists!', okText: T['M_CLOSE'] || 'Close' }); 
                                        this.value = hostsArr[idx].ip; 
                                        return;
                                    }
                                    hostsArr[idx].ip = ipVal;
                                }
                                
                                if(this.classList.contains('h-dom')) {
                                    var domVal = this.value.trim();
                                    if (/[\s<>"'\*]/.test(domVal)) {
                                        openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['M_FMT_DOMAIN'] || 'Invalid domain format!', okText: T['M_CLOSE'] || 'Close' }); 
                                        this.value = hostsArr[idx].dom; 
                                        return; 
                                    }
                                    // 查重防呆：不得与其他行的IP+域名组合完全相同
                                    var isDupDom = hostsArr.some(function(x, i) { return i !== idx && x.ip === hostsArr[idx].ip && x.dom === domVal; });
                                    if (isDupDom) {
                                        openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['MSG_HOSTS_DUP'] || 'Already exists!', okText: T['M_CLOSE'] || 'Close' }); 
                                        this.value = hostsArr[idx].dom; 
                                        return;
                                    }
                                    hostsArr[idx].dom = domVal;
                                }
                                
                                if(this.classList.contains('h-cmt')) {
                                    hostsArr[idx].cmt = this.value.trim().replace(/[<>"']/g, '');
                                    this.value = hostsArr[idx].cmt;
                                }
                            });
                        });
                        
                        listContainer.querySelectorAll('.h-del').forEach(function(btn) {
                            btn.addEventListener('click', function() { hostsArr.splice(parseInt(this.getAttribute('data-idx'), 10), 1); renderHosts(); });
                        });
                    };
                    
                    renderHosts();
                    
                    var addBtn = document.getElementById('nw-quick-add-btn');
                    if (addBtn) {
                        addBtn.onclick = function() {
                            var ipInput = document.getElementById('nw-quick-ip');
                            var domInput = document.getElementById('nw-quick-dom');
                            var cmtInput = document.getElementById('nw-quick-cmt');
                            var ipVal = ipInput.value.trim();
                            var domVal = domInput.value.trim();
                            
                            if (!ipVal || !domVal) { 
                                // 替换 原生alert()弹窗
                                openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['MSG_HOSTS_REQ'] || 'IP and Domain cannot be empty!', okText: T['M_CLOSE'] || 'Close' }); 
                                return; 
                            }
                            var isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipVal);
                            var isIpv6 = /^[a-fA-F0-9:]+:[a-fA-F0-9:]+$/.test(ipVal);
                            if (!isIpv4 && !isIpv6) { 
                                // 替换 原生alert()弹窗
                                openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['M_FMT_IP'] || 'Invalid IP format!', okText: T['M_CLOSE'] || 'Close' }); 
                                return; 
                            }
                            if (/[\s<>"'\*]/.test(domVal)) {
                                openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['M_FMT_DOMAIN'] || 'Invalid domain format!', okText: T['M_CLOSE'] || 'Close' }); 
                                return; 
                            }
                            
                            var isSmartAdd = document.getElementById('nw-smart-add-cb').checked;
                            var cmtVal = cmtInput.value.trim().replace(/[<>"']/g, '');
                            var addList = [];
                            
                            if (isSmartAdd) {
                                // 智能解析：去除域名前面的 www.，提取主域名
                                var rootDom = domVal.replace(/^www\./i, '');
                                var doms = [rootDom, 'www.' + rootDom]; // 组合 1：无 www，组合 2：有 www
                                var ips = [ipVal];
                                
                                // 智能判断：如果用户填的是屏蔽/回环 IP，自动裂变出 IPv4 和 IPv6 两个版本
                                if (ipVal === '127.0.0.1' || ipVal === '::1' || ipVal === '0.0.0.0' || ipVal === '::') {
                                    ips = ['127.0.0.1', '::1'];
                                }
                                
                                // 交叉组合所有 IP 和域名
                                ips.forEach(function(i) {
                                    doms.forEach(function(d) {
                                        addList.push({ ip: i, dom: d, cmt: cmtVal, en: true });
                                    });
                                });
                            } else {
                                // 未开启智能补全，只添加当前输入的一条
                                addList.push({ ip: ipVal, dom: domVal, cmt: cmtVal, en: true });
                            }

                            var addedCount = 0;
                            // 倒序遍历插入，保证生成的 4 条规则在列表里看起来排版舒适且符合逻辑
                            for (var i = addList.length - 1; i >= 0; i--) {
                                var item = addList[i];
                                // 查重防呆：如果 4 条规则中有一部分已经存在了，自动跳过重复的，只加上缺失的
                                var isDup = hostsArr.some(function(x) { return x.ip === item.ip && x.dom === item.dom; });
                                if (!isDup) {
                                    hostsArr.unshift(item);
                                    addedCount++;
                                }
                            }

                            // 如果计算完发现一条新规则都没加进去（全重复了）
                            if (addedCount === 0) {
                                openModal({ title: T['M_INC_TIT'] || 'Notice', msg: T['MSG_HOSTS_DUP'] || 'Already exists!', okText: T['M_CLOSE'] || 'Close' }); 
                                return;
                            }
                            
                            renderHosts();
                            ipInput.value = '127.0.0.1'; domInput.value = ''; cmtInput.value = '';
                            document.getElementById('nw-hosts-list').scrollTop = 0;
                        };
                    }
                });
            });
        }
        // ==============================================================

        // 防空指针，重定向 DOM 查找
        var oriQuery = container.querySelector.bind(container);
        var oriQueryAll = container.querySelectorAll.bind(container);
        container.querySelector = function(sel) { return oriQuery(sel) || document.querySelector(sel); };
        container.querySelectorAll = function(sel) { var r = oriQueryAll(sel); return (r && r.length > 0) ? r : document.querySelectorAll(sel); };
        // ==============================================================

        // ==================  加载库与二维码生成逻辑  ==================
        if (typeof window.QRCode === 'undefined' && !window._qrCodeScriptAdded) {
            window._qrCodeScriptAdded = true;
            var script = document.createElement('script');
            script.src = L.resource('view/qrcode.min.js'); 
            script.onload = function() { if (typeof window._updateLiveQR === 'function') window._updateLiveQR(); };
            document.head.appendChild(script);
        }

        function renderWiFiQR(containerId, ssid, pwd, enc) {
            var box = document.getElementById(containerId);
            if (!box || typeof window.QRCode === 'undefined') return;
            box.innerHTML = '';
            var type = (!enc || enc === 'none') ? 'nopass' : (enc.indexOf('wep') !== -1 ? 'WEP' : 'WPA');
            var esc = function(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:'); };
            var qrStr = 'WIFI:T:' + type + ';S:' + esc(ssid) + ';' + (type !== 'nopass' ? 'P:' + esc(pwd) + ';' : '') + ';';
            new QRCode(box, { text: qrStr, width: 140, height: 140, colorDark : "#0f172a", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.L });
        }

        window._updateLiveQR = function() {
            var qrBox = container.querySelector('#nw-live-qr-box');
            if (typeof window.QRCode === 'undefined') { if (qrBox) qrBox.style.display = 'none'; return; }
            var smartOn = container.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
            var ssid = '', pwd = '', enc = '', bandName = '', isEn = false;

            if (smartOn) {
                isEn = container.querySelector('#wifi-smart-en').checked;
                ssid = container.querySelector('#wifi-smart-ssid').value; pwd = container.querySelector('#wifi-smart-key').value;
                enc = container.querySelector('#wifi-smart-enc').value; bandName = T['LBL_SMART_CONN'];
            } else {
                var t2 = container.querySelector('#tab-2g').style.background; var t5 = container.querySelector('#tab-5g').style.background;
                if (t2.indexOf('rgb(59, 130, 246)') !== -1 || t2 === '#3b82f6') {
                    isEn = container.querySelector('#wifi-2g-en').checked; ssid = container.querySelector('#wifi-2g-ssid').value;
                    pwd = container.querySelector('#wifi-2g-key').value; enc = container.querySelector('#wifi-2g-enc').value; bandName = T['TAB_2G'] || '2.4G';
                } else if (t5.indexOf('rgb(59, 130, 246)') !== -1 || t5 === '#3b82f6') {
                    isEn = container.querySelector('#wifi-5g-en').checked; ssid = container.querySelector('#wifi-5g-ssid').value;
                    pwd = container.querySelector('#wifi-5g-key').value; enc = container.querySelector('#wifi-5g-enc').value; bandName = T['TAB_5G'] || '5G';
                } else {
                    var e5g2 = container.querySelector('#wifi-5g2-en'); isEn = e5g2 ? e5g2.checked : false;
                    ssid = container.querySelector('#wifi-5g2-ssid') ? container.querySelector('#wifi-5g2-ssid').value : '';
                    pwd = container.querySelector('#wifi-5g2-key') ? container.querySelector('#wifi-5g2-key').value : '';
                    enc = container.querySelector('#wifi-5g2-enc') ? container.querySelector('#wifi-5g2-enc').value : 'psk2+ccmp'; bandName = '5G_Game';
                }
            }
            if (!isEn || !ssid) { qrBox.style.display = 'none'; return; }
            qrBox.style.display = 'block';
            var bandEl = container.querySelector('#nw-live-qr-band'); if (bandEl) bandEl.innerText = '(' + bandName + ')';
            renderWiFiQR('nw-live-qr-code', ssid, pwd, enc);
        };

        // 鼠标跟随，无视底层 CSS 干扰
        var updateQRPos = function(e) {
            var hoverBox = container.querySelector('#nw-hover-qr-box') || document.getElementById('nw-hover-qr-box');
            if (hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.setProperty('position', 'fixed', 'important');
                hoverBox.style.setProperty('z-index', '999999', 'important');
                hoverBox.style.setProperty('transform', 'translate(-50%, -100%)', 'important');
                hoverBox.style.left = e.clientX + 'px';
                hoverBox.style.top = (e.clientY - 12) + 'px'; // 强制在鼠标正上方 12 像素处弹出
            }
        };

        container.addEventListener('mouseover', function(e) {
            var target = e.target.closest('.nw-qr-hover');
            if (target && typeof window.QRCode !== 'undefined') {
                renderWiFiQR('nw-hover-qr-code', target.getAttribute('data-ssid'), target.getAttribute('data-pwd'), target.getAttribute('data-enc'));
                var hoverBox = container.querySelector('#nw-hover-qr-box') || document.getElementById('nw-hover-qr-box');
                hoverBox.style.display = 'block';
                updateQRPos(e);
            }
        });
        
        container.addEventListener('mousemove', function(e) {
            if (e.target.closest('.nw-qr-hover')) updateQRPos(e);
        });
        
        // 鼠标移出时隐藏
        container.addEventListener('mouseout', function(e) { 
            if (e.target.closest('.nw-qr-hover')) {
                var hoverBox = container.querySelector('#nw-hover-qr-box') || document.getElementById('nw-hover-qr-box');
                if(hoverBox) hoverBox.style.display = 'none'; 
            }
        });

        // 移动端防粘滞逻辑，滑动屏幕或点击空白处时自动隐藏
        window.addEventListener('scroll', function() {
            var hoverBox = document.getElementById('nw-hover-qr-box');
            if (hoverBox && hoverBox.style.display === 'block') {
                hoverBox.style.display = 'none';
            }
        }, { passive: true });
        

        // 事件委托
        container.addEventListener('input', function(e) {
            if (e.target && e.target.id && e.target.id.indexOf('wifi-') !== -1) window._updateLiveQR();
            
            // 记录 PPPoE 帐号密码
            if (e.target && (e.target.id === 'pppoe-user' || e.target.id === 'wiz-pppoe-user')) sessionStorage.setItem('nw_pppoe_user', e.target.value);
            if (e.target && (e.target.id === 'pppoe-pass' || e.target.id === 'wiz-pppoe-pass')) sessionStorage.setItem('nw_pppoe_pass', e.target.value);
        });
        container.addEventListener('change', function(e) {
            if (e.target && e.target.id && e.target.id.indexOf('wifi-') !== -1) window._updateLiveQR();
        });
        container.querySelector('#tab-2g').addEventListener('click', function() { setTimeout(window._updateLiveQR, 50); });
        container.querySelector('#tab-5g').addEventListener('click', function() { setTimeout(window._updateLiveQR, 50); });
        if (container.querySelector('#tab-5g2')) container.querySelector('#tab-5g2').addEventListener('click', function() { setTimeout(window._updateLiveQR, 50); });
        container.querySelector('#wifi-smart-toggle').addEventListener('change', function() { setTimeout(window._updateLiveQR, 50); });
        // ==================  结束：二维码生成逻辑  ==================

        container.addEventListener('click', function(e) {
            var btnGotoDev = e.target.closest('#btn-goto-dev');
            if (btnGotoDev) {
                e.preventDefault();
                var wrap = document.querySelector('.nw-wrapper');
                if (wrap) wrap.classList.add('page-leaving');
                setTimeout(function() { window.location.href = btnGotoDev.href; }, 350);
            }
        });

        // ==================  安全XSS 字符转义  ==================
        var safeGetLocal = function(k) { try { return window.localStorage.getItem(k); } catch(e) { return null; } };
        var safeSetLocal = function(k, v) { try { window.localStorage.setItem(k, v); } catch(e) {} };
        var safeRemoveLocal = function(k) { try { window.localStorage.removeItem(k); } catch(e) {} };
        // ==============================================================
        var escapeHTML = function(str) {
            if (!str) return '';
            return String(str).replace(/[&<>'"]/g, function(tag) {
                var charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
                return charsToReplace[tag] || tag;
            });
        };
        // ==============================================================

        // ================== 向导状态后端静默保存 ==================
        var silentSaveWizardState = function(state) {
            if (window._currentWizState === String(state)) return Promise.resolve();
            window._currentWizState = String(state);
            return callNetSetup('set_wizard', String(state), '', '', '', '', '').catch(function(e){});
        };
        // ==============================================================

        // 所有弹窗移出被主题污染的容器，挂载到最外层 body
        var globalModal = container.querySelector('#nw-global-modal');
        if (globalModal) document.body.appendChild(globalModal);

        var wizModalInner = container.querySelector('#nw-wizard-modal');
        if (wizModalInner) document.body.appendChild(wizModalInner);

        var wispModal = container.querySelector('#wisp-scan-modal');
        if (wispModal) document.body.appendChild(wispModal);

        var step1 = container.querySelector('#step-1'), step2 = container.querySelector('#step-2'), step3 = container.querySelector('#step-3');
        var confirmText = container.querySelector('#confirm-mode-text'), modeTextEl = container.querySelector('#current-mode-text');
        var selectedMode = '';
        window._isSingleChip = false;

        // ===== 快速开机向导流 =====
        var wizModal = wizModalInner || document.getElementById('nw-wizard-modal');
        
        var wizUserInp = container.querySelector('#wiz-pppoe-user');
        var wizUserMir = container.querySelector('#wiz-user-mirror');
        if (wizUserInp && wizUserMir) {
            var syncMir = function() {
                if (wizUserInp.value.length > 18) { 
                    wizUserMir.style.display = 'block';
                    wizUserMir.textContent = wizUserInp.value;
                } else {
                    wizUserMir.style.display = 'none';
                    wizUserMir.textContent = wizUserInp.value;
                }
            };
            wizUserInp.addEventListener('input', syncMir);
            wizUserInp.addEventListener('change', syncMir);

            setInterval(function(){ 
                if (wizUserInp.value !== wizUserMir.textContent) syncMir(); 
            }, 800);
        }
        var wArea1 = container.querySelector('#wiz-step-1-area'), wArea2 = container.querySelector('#wiz-step-2-area'), wArea3 = container.querySelector('#wiz-step-3-area'), wArea4 = container.querySelector('#wiz-step-4-area');
        var wBtnPrev = container.querySelector('#wiz-btn-prev'), wBtnNext = container.querySelector('#wiz-btn-next'), wBtnApply = container.querySelector('#wiz-btn-apply');
        var wizHideCb = container.querySelector('#wiz-hide-checkbox');
        var currentWizStep = 1;

        // 向导高亮逻辑保持不变
        var updateWizSteps = function(step) {
            var dots = container.querySelectorAll('.nw-step-dot');
            dots.forEach(function(d, i) {
                if (i + 1 === step) {
                    d.style.background = '#ffffff'; d.style.color = '#5e72e4'; d.style.border = 'none'; d.style.transform = 'scale(1.2)'; d.style.boxShadow = '0 0 8px rgba(255,255,255,0.6)'; d.style.opacity = '1';
                } else if (i + 1 < step) {
                    d.style.background = 'rgba(255,255,255,0.25)'; d.style.color = '#ffffff'; d.style.border = 'none'; d.style.transform = 'scale(1)'; d.style.boxShadow = 'none'; d.style.opacity = '1';
                } else {
                    d.style.background = 'transparent'; d.style.color = 'rgba(255,255,255,0.6)'; d.style.border = '1px solid rgba(255,255,255,0.4)'; d.style.transform = 'scale(1)'; d.style.boxShadow = 'none'; d.style.opacity = '0.8';
                }
            });
            var lines = container.querySelectorAll('.nw-step-line');
            lines.forEach(function(l, i) {
                l.style.setProperty('background', 'transparent', 'important'); 
                l.style.color = (i + 1 < step) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)';
            });
        };
        updateWizSteps(currentWizStep);

        // ================== 跳过与关闭逻辑 ==================
        var handleWizardExit = function(action) {
            var hideCb = container.querySelector('#wiz-hide-checkbox');

            if (action === 'close') {
                if (hideCb && hideCb.checked) {
                    safeSetLocal('nw_wizard_never_show', '1');
                } else {
                    safeRemoveLocal('nw_wizard_never_show');
                }
            } else if (action === 'skip') {
                // 跳过清除“不再提示”的缓存
                safeRemoveLocal('nw_wizard_never_show');
            }

            var isFirstRun = (window._realIsConfigured !== '1');

            silentSaveWizardState('1').then(function() {
                executeExitNav(isFirstRun, action);
            }).catch(function() {
                executeExitNav(isFirstRun, action);
            });
        };

        var executeExitNav = function(isFirstRun, action) {
            var wizModal = container.querySelector('#nw-wizard-modal');
            
            if (isFirstRun) {

                if (wizModal) wizModal.style.display = 'none';
                openModal({
                    title: T['WIZ_SKIP_TITLE'] || 'Unlock',
                    msg: '<div style="color: #64748b; font-size: 16px; font-weight:bold;">' + (T['WIZ_SKIP_MSG'] || 'Entering official dashboard...') + '</div>',
                    spin: true
                });
                setTimeout(function() {
                    window.location.replace('http://' + window.location.hostname + '/cgi-bin/luci/');
                }, 500);
            } else {

                if (wizModal) wizModal.style.display = 'none';
            }
        };

        // 分別綁定不同的 action
        container.querySelector('#wiz-modal-close').addEventListener('click', function() { handleWizardExit('close'); });
        container.querySelector('#wiz-btn-skip').addEventListener('click', function() { handleWizardExit('skip'); });
        // ==========================================================

        var btnReopenWiz = container.querySelector('#btn-reopen-wizard');
        if (btnReopenWiz) {
            btnReopenWiz.addEventListener('click', function() {
                silentSaveWizardState('1'); 
                currentWizStep = 1;
                updateWizSteps(1);
                wArea1.style.display = 'block';
                wArea2.style.display = 'none';
                wArea3.style.display = 'none';
                wArea4.style.display = 'none';
                wBtnPrev.style.display = 'none';
                wBtnNext.style.display = 'block';
                wBtnApply.style.display = 'none';
                
                if (wizHideCb) wizHideCb.checked = true;
                var skipWifiCb = container.querySelector('#wiz-skip-wifi-checkbox');
                if (skipWifiCb) {
                    skipWifiCb.checked = (window._hasRealWifi === false) ? true : false;
                    skipWifiCb.dispatchEvent(new Event('change')); 
                }
                wizModal.style.display = 'flex';
            });
        }

        container.querySelectorAll('input[name="wiz_wan_type"]').forEach(function(r) {
            r.addEventListener('change', function() {
                container.querySelector('#wiz-pppoe-fields').style.display = (this.value === 'pppoe') ? 'block' : 'none';
                
                // 向导中切换回PPPoE时，强制恢复
                if (this.value === 'pppoe') {
                    var savedU = sessionStorage.getItem('nw_pppoe_user');
                    var savedP = sessionStorage.getItem('nw_pppoe_pass');
                    if (savedU !== null && container.querySelector('#wiz-pppoe-user')) container.querySelector('#wiz-pppoe-user').value = savedU;
                    if (savedP !== null && container.querySelector('#wiz-pppoe-pass')) container.querySelector('#wiz-pppoe-pass').value = savedP;
                }
            });
        });

        var skipWifiCb = container.querySelector('#wiz-skip-wifi-checkbox');
        var wifiInputArea = container.querySelector('#wiz-wifi-input-area');
        if (skipWifiCb && wifiInputArea) {
            skipWifiCb.addEventListener('change', function() {
                wifiInputArea.style.opacity = this.checked ? '0.3' : '1';
                wifiInputArea.style.pointerEvents = this.checked ? 'none' : 'auto';
            });
        }

        // 密码跳过联动已移除（不再需要打勾，直接留空即可跳过）
        // ================== 4 步向导 ==================
        wBtnNext.addEventListener('click', function() {
            if (currentWizStep === 1) {
                // 第一步：密码留空则跳过，填写则必须一致
                var p1 = container.querySelector('#nw-admin-pwd').value;
                var p2 = container.querySelector('#nw-admin-pwd-confirm').value;
                
                if (p1 !== p2) {
                    openModal({ 
                        title: T['M_INC_TIT'] || 'Notice', 
                        msg: T['M_PWD_MISMATCH'] || 'Passwords do not match, please try again!', 
                        okText: T['M_CLOSE'] || 'Close'
                    });
                    return;
                }
                
                // 只要密码一致（包含两者都为空），就直接进入下一步
                wArea1.style.display = 'none'; wArea2.style.display = 'block'; 
                wBtnPrev.style.display = 'block'; currentWizStep = 2; updateWizSteps(2);
            } else if (currentWizStep === 2) {
                // 第二步
                var pppoeBtn = container.querySelector('#wiz-pppoe-submit');
                if (pppoeBtn) pppoeBtn.click();
                
                var wType = container.querySelector('input[name="wiz_wan_type"]:checked').value;
                if (wType === 'pppoe' && (!container.querySelector('#wiz-pppoe-user').value.replace(/[\r\n\s]+/g, '') || !container.querySelector('#wiz-pppoe-pass').value.trim())) {
                    openModal({ title: T['M_INC_TIT'], msg: T['M_INC_PPPOE'], okText: T['M_CLOSE'] }); 
                    return; 
                }

                if (wType === 'dhcp') {
                    var sysWanIp = window._liveWanIp || '';
                    var currentLanIp = safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0];
                    if (sysWanIp && currentLanIp && isSameSubnet(sysWanIp, currentLanIp)) {
                        var newSafeIp = getSafeRouterIp(sysWanIp);
                        openModal({
                            title: T['M_CFLT_INTERCEPT_TIT'], 
                            msg: T['M_CFLT_WIZ_MSG'].replace('{wan_ip}', sysWanIp).replace('{lan_ip}', currentLanIp).replace('{safe_ip}', newSafeIp), 
                            okText: T['BTN_AUTO_EVADE'],
                            cancelText: T['BTN_EDIT_MYSELF'], // 手动修改(取消)按钮
                            isDanger: true,
                            onOk: function() {
                                container.querySelector('#lan-ip').value = newSafeIp;
                                selectedMode = 'lan'; 
                                container.querySelector('#nw-global-modal').style.display = 'none';
                                container.querySelector('#nw-wizard-modal').style.display = 'none'; 
                                container.querySelector('#btn-next-2').click(); 
                            }
                        });
                        return; 
                    }
                }

                wArea2.style.display = 'none'; wArea3.style.display = 'block'; 
                currentWizStep = 3; updateWizSteps(3); 
            } else if (currentWizStep === 3) {
                // 第三步
                var isSkipWifi = skipWifiCb ? skipWifiCb.checked : false;
                var ssid = container.querySelector('#wiz-wifi-ssid').value.trim();
                var key = container.querySelector('#wiz-wifi-key').value;
                
                var proceedToStep4 = function() {
                    var wType2 = container.querySelector('input[name="wiz_wan_type"]:checked').value;
                    var htmlConfirm = "<div style='text-align:left; font-size:15px; color: #fff;'>";
                    
                    if (wType2 === 'pppoe') {
                        var pppoeUser = container.querySelector('#wiz-pppoe-user').value.replace(/[\r\n\s]+/g, '');
                        var pppoePass = container.querySelector('#wiz-pppoe-pass').value;
                        htmlConfirm += "<div style='margin-bottom:8px; display:flex; align-items:center;'><b style='color:#facc15; margin-right:8px; flex-shrink:0;'>WAN:</b> <span>" + T['MODE_PPPOE_TITLE'] + "</span></div>";
                        htmlConfirm += "<div style='margin-bottom:8px; display:flex; align-items:center;'><b style='color:#fde047; margin-right:8px; white-space:nowrap; flex-shrink:0;'>"+ T['M_ACCT'] +":</b> <span style='word-break:break-all; opacity:0.9;'>" + escapeHTML(pppoeUser) + "</span></div>";
                        htmlConfirm += "<div style='margin-bottom:12px; display:flex; align-items:center;'><b style='color:#fde047; margin-right:8px; white-space:nowrap; flex-shrink:0;'>"+ T['M_PWD'] +":</b> <span style='word-break:break-all; opacity:0.9;'>" + escapeHTML(pppoePass) + "</span></div>";
                    } else {
                        htmlConfirm += "<div style='margin-bottom:12px; display:flex; align-items:center;'><b style='color:#facc15; margin-right:8px; flex-shrink:0;'>WAN:</b> <span>" + T['OPT_DHCP'] + "</span></div>";
                    }
                    
                    if (isSkipWifi) {
                        htmlConfirm += "<div style='margin-bottom:0; display:flex; align-items:center;'><b style='color:#67e8f9; margin-right:8px; flex-shrink:0;'>Wi-Fi:</b> <span style='color:#94a3b8; font-style:italic;'>" + T['TXT_NOT_CONFIGURED'] + "</span></div>";
                    } else {
                        htmlConfirm += "<div style='margin-bottom:8px; display:flex; align-items:center;'><b style='color:#67e8f9; margin-right:8px; flex-shrink:0;'>Wi-Fi:</b> <span style='word-break:break-all;'>" + (ssid ? escapeHTML(ssid) : "<i>" + T['TXT_UNSET'] + "</i>") + "</span></div>";
                        htmlConfirm += "<div style='margin-bottom:0; display:flex; align-items:center;'><b style='color:#a7f3d0; margin-right:8px; white-space:nowrap; flex-shrink:0;'>"+ T['M_PWD'] +":</b> <span style='word-break:break-all;'>" + (key ? escapeHTML(key) : "<i>" + T['TXT_NO_PWD_OPEN'] + "</i>") + "</span></div>";
                    }
                    
                    htmlConfirm += "</div>";
                    container.querySelector('#wiz-confirm-text').innerHTML = htmlConfirm;

                    wArea3.style.display = 'none'; wArea4.style.display = 'block'; 
                    wBtnNext.style.display = 'none'; wBtnApply.style.display = 'block'; 
                    currentWizStep = 4; updateWizSteps(4);
                };

                if (!isSkipWifi) {
                    if (!ssid) { openModal({ title: T['M_INC_TIT'], msg: T['M_INC_WIFI'], okText: T['M_CLOSE'] }); return; }
                    if (key && key.length < 8) { openModal({ title: T['M_FMT_TIT'], msg: T['M_PWD_SHORT'], okText: T['M_CLOSE'] }); return; }
                    if (key.length === 0) { 
                        openModal({
                            title: T['M_OPEN_WARN_TIT'] || '⚠️ No Password', 
                            msg: T['M_OPEN_WARN_MSG'] || 'Setting up an open Wi-Fi without a password. Continue?', 
                            cancelText: T['M_CLOSE'], 
                            okText: T['BTN_NEXT'] || 'Continue', 
                            isDanger: true,
                            onCancel: function() { container.querySelector('#nw-global-modal').style.display = 'none'; },
                            onOk: function() { 
                                container.querySelector('#nw-global-modal').style.display = 'none'; 
                                proceedToStep4(); 
                            }
                        });
                        return; 
                    }
                }
                proceedToStep4();
            }
        });

        wBtnPrev.addEventListener('click', function() {
            if (currentWizStep === 2) { 
                wArea2.style.display = 'none'; wArea1.style.display = 'block'; wBtnPrev.style.display = 'none'; currentWizStep = 1; updateWizSteps(1); 
            } else if (currentWizStep === 3) { 
                wArea3.style.display = 'none'; wArea2.style.display = 'block'; currentWizStep = 2; updateWizSteps(2); 
            } else if (currentWizStep === 4) {
                wArea4.style.display = 'none'; wArea3.style.display = 'block'; wBtnApply.style.display = 'none'; wBtnNext.style.display = 'block'; currentWizStep = 3; updateWizSteps(3);
            }
        });

        // 6. 一键合并提交
        wBtnApply.addEventListener('click', function() {
            var adminPwdEl = document.getElementById('nw-admin-pwd');
            var adminPwd = adminPwdEl ? adminPwdEl.value.trim() : "";

            var wType = container.querySelector('input[name="wiz_wan_type"]:checked').value;
            var isSkipWifi = skipWifiCb ? skipWifiCb.checked : false;

            if (typeof window._trueIpv6State === 'undefined' || window._trueIpv6State === null) {
                openModal({ title: T['M_SYS_ERR'] || 'System Error', msg: T['MSG_SYS_NOT_READY'], okText: T['M_CLOSE'] });
                return;
            }
            var keepIpv6 = window._trueIpv6State;

            wizModal.style.display = 'none';
            openModal({ title: T['WIZ_TITLE'] || 'Configuring', msg: '<div style="color: #64748b; font-size: 16px; font-weight:bold;">' + T['MSG_WRITING'] + '</div>', spin: true });

            // 网络配置的核心提取为一个函数，分流调用
            var doNetSetupConfig = function() {
                // 1. 处理“不再提示”状态
                var wizHideCb = container.querySelector('#wiz-hide-checkbox');
                if (wizHideCb && wizHideCb.checked) {
                    safeSetLocal('nw_wizard_never_show', '1');
                } else {
                    safeRemoveLocal('nw_wizard_never_show');
                }

                // 2. 提交配置，底层必须强制写入 '1' 永久解锁 CGI 拦截
                silentSaveWizardState('0').then(function() {
                    var applyPromise;
                    if (isSkipWifi) {
                        if (wType === 'pppoe') {
                            var u = container.querySelector('#wiz-pppoe-user').value.replace(/[\r\n\s]+/g, '');
                            var p = container.querySelector('#wiz-pppoe-pass').value;
                            applyPromise = callNetSetup('pppoe', u, p, '', '', '1', keepIpv6);
                        } else {
                            applyPromise = callNetSetup('wan_dhcp', '', '', '', '', '1', keepIpv6);
                        }
                    } else {
                        var arg1Obj = { wan_type: wType };
                        if (wType === 'pppoe') {
                            arg1Obj.user = container.querySelector('#wiz-pppoe-user').value.replace(/[\r\n\s]+/g, '');
                            arg1Obj.pass = container.querySelector('#wiz-pppoe-pass').value; 
                        }
                        
                        var ssid = container.querySelector('#wiz-wifi-ssid').value.trim();
                        var key = container.querySelector('#wiz-wifi-key').value;
                        var enc = (key.length === 0) ? 'none' : 'psk2+ccmp';

                        var arg2Obj = {};
                        if (window._isSingleChip) {
                            arg2Obj = { smart: "true", merged: { enabled: "1", ssid: ssid, key: key, encryption: enc, hidden: "0", roaming: "0" } };
                        } else {
                            arg2Obj = {
                                smart: "false",
                                radio_2g: { enabled: "1", ssid: ssid, key: key, encryption: enc, hidden: "0", roaming: "0", mode: "auto", channel: "auto", bandwidth: "auto" },
                                radio_5g: { enabled: "1", ssid: ssid, key: key, encryption: enc, hidden: "0", roaming: "1", mode: "auto", channel: "auto", bandwidth: "auto" }
                            };
                        }
                        var arg2Str = JSON.stringify(arg2Obj);
                        applyPromise = callNetSetup('wizard', JSON.stringify(arg1Obj), arg2Str, '', '', '1', keepIpv6);
                    }

                    applyPromise.then(function() {
                        var sec = 0, h = window.location.hostname;
                        var checkSameTimer = setInterval(function() { 
                            sec += 3; 
                            document.getElementById('nw-global-msg').innerHTML = '<div style="color: #059669; font-size: 16px; font-weight: bold;">' + T['MSG_WAIT_NET'].replace('{sec}', sec) + '</div>'; 
                            
                            if (sec <= 9) return;

                            fetchProbe('http://' + h + '/cgi-bin/luci/?v=' + Date.now(), 2000).then(function() { 
                                clearInterval(checkSameTimer); 
                                
                                // ================== 自动登录官方后台 ==================
                                document.getElementById('nw-global-msg').innerHTML = '<div style="color: #10b981; font-size: 16px; font-weight: bold;">' + T['MSG_SETUP_DONE'] + '</div>';
                                
                                if (adminPwd) {
                                    // 创建隐藏表单，登录官方页面
                                    var form = document.createElement('form');
                                    form.method = 'POST';
                                    // 直接 POST 到目标地址，LuCI 鉴权后会停留在 NetWiz 面板
                                    form.action = 'http://' + h + '/cgi-bin/luci/admin/netwiz';
                                    form.style.display = 'none';
                                    
                                    var u = document.createElement('input');
                                    u.type = 'hidden'; u.name = 'luci_username'; u.value = 'root'; // 默认账号 root
                                    form.appendChild(u);
                                    
                                    var p = document.createElement('input');
                                    p.type = 'hidden'; p.name = 'luci_password'; p.value = adminPwd; // 向导里的密码
                                    form.appendChild(p);
                                    
                                    document.body.appendChild(form);
                                    form.submit();
                                } else {
                                    // 没改密码，提取当前安全的 stok 令牌并跳转
                                    var match = window.location.pathname.match(/;stok=[a-zA-Z0-9]+/);
                                    var stok = match ? match[0] + '/' : '';
                                    window.location.replace('http://' + h + '/cgi-bin/luci/' + stok + 'admin/netwiz');
                                }
                                // ==============================================================

                            }).catch(function() {});
                        }, 3000);
                    }).catch(function(err) { 
                        openModal({ title: T['M_SYS_ERR'], msg: (T['M_ERR_WIZ_FAILED'] || 'Wizard execution failed') + ': ' + err, okText: T['M_CLOSE'] });
                    });
                });
            };

            // ================== 判断密码是否需要修改 ==================
            if (adminPwd) {
                // 填新密码，修改密码，再配网
                callSetPassword(adminPwd).then(function() {
                    doNetSetupConfig();
                }).catch(function(err) {
                    alert(T['MSG_PWD_FAIL'] + err);
                    window.location.reload();
                });
            } else {
                // 留空，直接跳过修改密码，执行网络配置
                doNetSetupConfig();
            }
            // ==============================================================
        });

        // ===== 动画滚动 =====
        var smoothScrollToTop = function(duration) {
            var scroller = document.querySelector('#maincontent') || document.querySelector('.main-right') || document.scrollingElement || document.documentElement;
            var start = scroller.scrollTop;
            if (start === 0 && window.pageYOffset > 0) { scroller = window; start = window.pageYOffset; }
            if (start <= 0) return; // 已经在顶部就不滚了

            var startTime = null;
            // 先加速后减速 (Ease-In-Out)
            var easeInOutQuad = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            };

            var animateScroll = function(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = timestamp - startTime;
                var nextStep = easeInOutQuad(progress, start, -start, duration);
                
                if (scroller === window) window.scrollTo(0, nextStep);
                else scroller.scrollTop = nextStep;

                if (progress < duration) window.requestAnimationFrame(animateScroll);
                else {
                    if (scroller === window) window.scrollTo(0, 0);
                    else scroller.scrollTop = 0;
                }
            };
            window.requestAnimationFrame(animateScroll);
        };
        // ========================================================

        // ===== 提取当前状态快照 =====
        function getWifiSnapshot() {
            var sT = container.querySelector('#wifi-smart-toggle').checked;
            var snap = {
                sT: sT,
                lB: container.querySelector('#legacy-b-toggle').checked,
                wt: container.querySelector('#wisp-toggle') ? container.querySelector('#wisp-toggle').checked : false,
                ws: container.querySelector('#wisp-target-ssid') ? container.querySelector('#wisp-target-ssid').value : '',
                wk: container.querySelector('#wisp-target-key') ? container.querySelector('#wisp-target-key').value : '',
                we: container.querySelector('#wisp-target-enc') ? container.querySelector('#wisp-target-enc').value : '',
                wd: container.querySelector('#wisp-target-device') ? container.querySelector('#wisp-target-device').value : '',
                wb: container.querySelector('#wisp-target-bssid') ? container.querySelector('#wisp-target-bssid').value : ''
            };
            if (sT) {
                // 如果是多频合一，只记录合一面板的数据
                snap.es = container.querySelector('#wifi-smart-en').checked;
                snap.ss = container.querySelector('#wifi-smart-ssid').value;
                snap.ks = container.querySelector('#wifi-smart-key').value;
                snap.ecs = container.querySelector('#wifi-smart-enc').value;
                snap.hs = container.querySelector('#wifi-smart-hidden').checked;
                snap.rs = container.querySelector('#wifi-smart-roaming') ? container.querySelector('#wifi-smart-roaming').checked : false;
            } else {
                // 如果是分开模式，记录独立的面板数据
                snap.e2 = container.querySelector('#wifi-2g-en').checked;
                snap.s2 = container.querySelector('#wifi-2g-ssid').value;
                snap.k2 = container.querySelector('#wifi-2g-key').value;
                snap.ec2 = container.querySelector('#wifi-2g-enc').value;
                snap.h2 = container.querySelector('#wifi-2g-hidden').checked;
                snap.m2 = container.querySelector('#wifi-2g-mode').value;
                snap.c2 = container.querySelector('#wifi-2g-chan').value;
                snap.b2 = container.querySelector('#wifi-2g-bw').value;
                snap.r2 = container.querySelector('#wifi-2g-roaming') ? container.querySelector('#wifi-2g-roaming').checked : false;
                
                snap.e5 = container.querySelector('#wifi-5g-en').checked;
                snap.s5 = container.querySelector('#wifi-5g-ssid').value;
                snap.k5 = container.querySelector('#wifi-5g-key').value;
                snap.ec5 = container.querySelector('#wifi-5g-enc').value;
                snap.h5 = container.querySelector('#wifi-5g-hidden').checked;
                snap.m5 = container.querySelector('#wifi-5g-mode').value;
                snap.c5 = container.querySelector('#wifi-5g-chan').value;
                snap.b5 = container.querySelector('#wifi-5g-bw').value;
                snap.r5 = container.querySelector('#wifi-5g-roaming') ? container.querySelector('#wifi-5g-roaming').checked : false;
                var en5g2El = container.querySelector('#wifi-5g2-en');
                if (en5g2El) {
                    snap.e5g2 = en5g2El.checked;
                    snap.s5g2 = container.querySelector('#wifi-5g2-ssid') ? container.querySelector('#wifi-5g2-ssid').value : '';
                    snap.k5g2 = container.querySelector('#wifi-5g2-key') ? container.querySelector('#wifi-5g2-key').value : '';
                }
            }
            return JSON.stringify(snap);
        }
        // ========================================================

        function safePromise(p, f) { return new Promise(function(r) { var t = setTimeout(function() { r(f); }, 3000); if (!p || !p.then) { clearTimeout(t); return r(f); } p.then(function(res) { clearTimeout(t); r(res); }).catch(function() { clearTimeout(t); r(f); }); }); }
        function safeUciGet(c, s, o, d) { try { var v = uci.get(c, s, o); return (v === null || v === undefined) ? d : String(v).trim(); } catch(e) { return d; } }

        // SSID 后缀转换
        // 去除 _2.4G, -5G, 2.4G, 5G, 甚至 2.4, 5 等冗余后缀
        function cleanSsidSuffix(ssid) {
            if (!ssid) return '';
            // 兼容 5G_Game 后缀剥离
            return ssid.replace(/[_\-\s]?(2\.4|5)[gG]?(_Game)?$/i, '');
        }

        // 生成纯净的目标名称
        function smartConvertSsid(ssid, targetBand) {
            var base = cleanSsidSuffix(ssid);
            if (!base) base = 'OpenWrt';
            if (targetBand === '2g') return base + '_2.4G';
            if (targetBand === '5g2') return base + '_5G_Game'; // 第三个芯片的专属后缀
            return base + '_5G';
        }

        Promise.all([
            safePromise(callNetCheckWifi(), { has_wifi: false }),
            safePromise(callSystemBoard(), {}),
            safePromise(uci.load('netwiz'), null), // 恢复加载 netwiz 配置
            safePromise(uci.load('wireless'), null) // 加载底层 wireless 配置
        ]).then(function(results) {
            var wifiRes = results[0];
            var boardRes = results[1] || {};
            var modelName = (boardRes.model || '').toLowerCase();
            
            // 加载缓存架构与包管理器，用于后续的文件名秒级校验
            if (wifiRes) {
                window.nwCurrentPkg = wifiRes.pkg_type || 'ipk';
                window.nwCurrentArch = wifiRes.sys_arch || '';
            }
            
            var uciWifiDevs = [];
            try { uciWifiDevs = uci.sections('wireless', 'wifi-device') || []; } catch(e) {}
            
            var hasWifi = (wifiRes === true || (typeof wifiRes === 'object' && wifiRes && wifiRes.has_wifi === true) || uciWifiDevs.length > 0);
            window._hasRealWifi = hasWifi; // 真实的硬件状态
            
            // 处理主界面的 Wi-Fi 卡片显示与隐藏
            if (hasWifi) {
                var wifiCard = container.querySelector('#card-wifi');
                if (wifiCard) wifiCard.style.display = 'flex';
            } else {
                console.warn("[Netwiz] 警告: 未检测到 Wi-Fi 硬件，已彻底隐藏 Wi-Fi 配置卡片。");
                var wifiCard = container.querySelector('#card-wifi');
                if (wifiCard) wifiCard.style.setProperty('display', 'none', 'important');

                // 没有 Wi-Fi 时，向导第二步自动锁死“跳过”并隐藏密码框
                var skipWifiCb = container.querySelector('#wiz-skip-wifi-checkbox');
                var wifiInputArea = container.querySelector('#wiz-wifi-input-area');
                if (skipWifiCb) {
                    skipWifiCb.checked = true; // 强行勾选跳过
                    var cbWrap = skipWifiCb.closest('.nw-wiz-cb-wrap');
                    if (cbWrap) {
                        cbWrap.style.setProperty('display', 'none', 'important'); // 隐藏复选框本身
                        if (cbWrap.parentElement) {
                            cbWrap.parentElement.style.setProperty('display', 'none', 'important');
                        }
                    }
                }
                if (wifiInputArea) {
                wifiInputArea.style.setProperty('display', 'none', 'important'); // 隐藏密码框
                var wArea3 = container.querySelector('#wiz-step-3-area'); 
                if (wArea3 && !container.querySelector('#nw-no-wifi-tip')) {
                    var tip = document.createElement('div');
                    tip.id = 'nw-no-wifi-tip';
                    tip.innerHTML = '<div style="text-align:center; padding: 30px 15px; color:#64748b; font-size:15px; background:#f1f5f9; border-radius:8px; border: 1px dashed #cbd5e1; margin-bottom:15px;">' + T['MSG_NO_WIFI_TIP'] + '</div>';
                    wArea3.insertBefore(tip, wifiInputArea);
                }
            }
            }

            // ================== 弹出向导 ==================
            if (typeof uci !== 'undefined') {
                uci.load('netwiz').then(function() {
                    var isConfigured = safeUciGet('netwiz', 'global', 'configured', '0');
                    var isWizEnabled = safeUciGet('netwiz', 'main', 'wizard_enable', '1');
                    window._realIsConfigured = String(isConfigured);

                    // 读取本地浏览器是否勾选过“不再提示”
                    var neverShow = safeGetLocal('nw_wizard_never_show');

                    // 核心判断逻辑：
                    if (window._realIsConfigured !== '1') {
                        // 1. 第一次开机，显示向导
                        if (wizModal) wizModal.style.display = 'flex';
                    } else if (String(isWizEnabled) === '1' && neverShow !== '1') {
                        // 2.平常，没有勾选“不再提示”
                        if (wizModal) wizModal.style.display = 'flex';
                    } else {
                        // 3. 平常勾选“不再提示”
                        if (wizModal) wizModal.style.display = 'none';
                    }
                }).catch(function() {
                    window._realIsConfigured = '0';
                    if (wizModal) wizModal.style.display = 'flex';
                });
            } else {
                window._realIsConfigured = '0';
                if (wizModal) wizModal.style.display = 'flex';
            }
            // ==========================================================
            
            if (btnReopenWiz) {
                btnReopenWiz.style.display = '';
            }
        }).catch(function(err) {});

        function updateStatusDisplay(isSilent) {
            try {
                // --- 互联网状态全域快取与防闪烁逻辑 (增强版定位) ---
                if (typeof window.nwInetStatus === 'undefined') window.nwInetStatus = 'wait';
                if (typeof window.nwInetLast === 'undefined') window.nwInetLast = 0;
                
                var now = Date.now();
                if (now - window.nwInetLast > 8000) { // 每 8 秒在背景默默探测一次
                    window.nwInetLast = now;
                    callCheckInternet().then(function(res) { 
                        window.nwInetStatus = (res.status === 'ok') ? 'ok' : 'fail'; 
                        // 探测完成后，直接精准更新那个图标，而不是重绘整个界面
                        var badgeEl = document.getElementById('nw-inet-badge');
                        if (badgeEl) {
                            badgeEl.innerHTML = window.nwInetStatus === 'ok' ? '🌐' : '❌';
                            badgeEl.title = window.nwInetStatus === 'ok' ? (T['TXT_NET_OK'] || 'Internet Connected') : (T['TXT_NET_FAIL'] || 'Internet Disconnected');
                        }
                    });
                }
    
                if (modeTextEl && !isSilent) modeTextEl.innerHTML = "<div class='nw-spinner' style='width:30px; height:30px; border-width:3px; margin: 0 auto; border-top-color: #fff;'></div><div style='margin-top:10px; font-size:15px; font-weight:bold; color:#fff;'>" + T['LOADING_CONFIG'] + "</div>";
                try { uci.unload('network'); uci.unload('dhcp'); uci.unload('wireless'); } catch(e) {}
                
                Promise.all([ safePromise(uci.load('network'), null), safePromise(uci.load('dhcp'), null), safePromise(uci.load('wireless'), null), safePromise(getWanStatus(), {}), safePromise(callNetCheckWifi(), {}) ]).then(function(results) {
                    var wifiRes = results[4] || {};
                    var rawIfaces = results[3] || {}, ifaces = Array.isArray(rawIfaces.interface) ? rawIfaces.interface : (Array.isArray(rawIfaces) ? rawIfaces : []);
                    var wProto = safeUciGet('network', 'wan', 'proto', '').toLowerCase();
                    // 1. 有线 WAN 和 无线 WWAN (中继)
                    var phyWan = ifaces.find(function(i) { return i && i.interface === 'wan'; }) || {};
                    var virWwan = ifaces.find(function(i) { return i && i.interface === 'wwan'; }) || {};

                    // 2. 智能判定出口
                    var activeWan = phyWan; // 先看物理 WAN
                    var isWispActive = false; // 是否正在使用无线中继联网
                    var hasWispConfigured = !!uci.sections('wireless', 'wifi-iface').find(function(i) { return i.network === 'wwan' && i.mode === 'sta'; });

                    var phyWanHasIp = phyWan.up && phyWan['ipv4-address'] && phyWan['ipv4-address'].length > 0;
                    var virWwanHasIp = virWwan.up && virWwan['ipv4-address'] && virWwan['ipv4-address'].length > 0;

                    if (!phyWanHasIp && virWwanHasIp) {
                        // 有线没通，无线通了 -> 切換到无线中继视角
                        activeWan = virWwan;
                        isWispActive = true;
                    } else if (!phyWan.up && !virWwan.up) {
                        // 兜底：找一個带 wan 名字的
                        activeWan = ifaces.find(function(i) { return i && (i.interface === 'wan' || i.interface === 'wwan' || (i.interface && i.interface.indexOf('wan') !== -1 && i.interface.indexOf('lan') === -1)); }) || {};
                    }

                    var liveWanIp = ((activeWan['ipv4-address'] && activeWan['ipv4-address'][0]) ? activeWan['ipv4-address'][0].address : '').split('/')[0];
                    window._liveWanIp = liveWanIp;
                    var liveGw = activeWan.nexthop || '';
                    if (!liveGw && Array.isArray(activeWan.route)) { var defaultRoute = activeWan.route.find(function(r) { return r.target === '0.0.0.0'; }); if (defaultRoute) liveGw = defaultRoute.nexthop; }
                    if (!liveGw && activeWan['ipv4-address'] && activeWan['ipv4-address'][0]) liveGw = activeWan['ipv4-address'][0].ptpaddress || '';
                    window._realUpstreamGw = liveGw;
                    liveGw = liveGw || T['TXT_GETTING'];

                    // 提取并格式化连接时间
                    var wanUptime = activeWan.uptime || 0;
                    var formatUptime = function(secs) {
                        if (!secs) return '';
                        var d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
                        var res = '';
                        if (d > 0) res += d + 'd ';
                        if (h > 0) res += h + 'H ';
                        if (m > 0) res += m + 'm ';
                        res += s + 's';
                        return res;
                    };
                    var uptimeStr = formatUptime(wanUptime);
                    var upBadgeHtml = uptimeStr ? "<span style='font-size:15px; color:#fff; font-weight:600; margin-left:0; font-family:monospace;'>🕒" + uptimeStr + "</span>" : "";

                    // 提取主备 DNS
                    var dnsServers = activeWan['dns-server'] || [];
                    var dns1 = dnsServers[0] || '';

                    // 优先使用 底层物理载波状态判断网线通断
                    var isWanDown = false;
                    if (isWispActive) {
                        isWanDown = false; // 如果中继生效，不弹网线未插警告
                    } else {
                        if (typeof activeWan.l1up !== 'undefined') {
                            isWanDown = (activeWan.l1up === false);
                        } else {
                            isWanDown = (activeWan.up === false && (!liveWanIp || liveWanIp === T['TXT_GETTING'] || liveWanIp === T['TXT_NOT_GOT']));
                        }
                    }

                    // 初始化防抖计数器
                    if (typeof window._wanDropCount === 'undefined') window._wanDropCount = 0;
                    
                    // 初始向导是否在显示
                    var wizModalEl = container.querySelector('#nw-wizard-modal');
                    var isWizOpen = (wizModalEl && wizModalEl.style.display !== 'none');
                    
                    if (isWanDown && !isBypass && (!selectedMode || selectedMode === 'router')) {
                        
                        // 系统正在保存/重启，或者向导没关闭，保持静默
                        if (window._isSystemBusy || isWizOpen) {
                            window._wanDropCount = 0; 
                        } else {
                            // 系统空闲，且向导关闭，开启防抖
                            window._wanDropCount++;
                            
                            // 1 次断线（約 1~5 秒）确认断线，且没有弹过窗，才触发弹窗
                            if (window._wanDropCount >= 1) {
                                if (!window._hasAlertedWanDown && !safeGetLocal('ignoreWanAlert')) {
                                    window._hasAlertedWanDown = true;
                                    
                                    // 专属悬浮层，让探针运行
                                    var overlay = document.createElement('div');
                                    overlay.id = 'nw-custom-wan-alert';
                                    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);';
                                    
                                    var box = document.createElement('div');
                                    box.style.cssText = 'background:#fff; width:90%; max-width:420px; border-radius:12px; padding:24px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); text-align:center; font-family:sans-serif;';
                                    
                                    box.innerHTML = '<div style="font-size:36px; margin-bottom:10px;">🔌</div>' + 
                                                    '<h3 style="margin:0 0 15px 0; color:#1f2937; font-size:20px;">' + T['M_WAN_DOWN_TIT'] + '</h3>' + 
                                                    '<div style="text-align:left; color:#4b5563; font-size:15px; line-height:1.6; margin-bottom:20px;">' + T['M_WAN_DOWN_MSG'] + '</div>' + 
                                                    '<div style="text-align:center; color:#059669; font-weight:bold; font-size:14px; margin-bottom:20px; padding:10px; background:#d1fae5; border-radius:8px;">' + T['M_WAN_DOWN_WAIT'] + '</div>' +
                                                    '<button id="btn-ignore-wan" style="background:#f00; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; width:100%; font-size:15px; transition:0.2s;">' + T['BTN_IGNORE_WAN'] + '</button>';
                                    
                                    overlay.appendChild(box);
                                    document.body.appendChild(overlay);

                                    // 点击不处理，手动删掉悬浮层
                                    document.getElementById('btn-ignore-wan').onclick = function() {
                                        window._hasAlertedWanDown = true;
                                        safeSetLocal('ignoreWanAlert', 'true'); 
                                        var el = document.getElementById('nw-custom-wan-alert');
                                        if (el) el.remove();
                                    };
                                }
                            }
                        }
                    } else if (!isWanDown) {
                        // 侦测到网线恢复，立刻将计数器清零
                        window._wanDropCount = 0;

                        // 发现插网线
                        var customAlert = document.getElementById('nw-custom-wan-alert');
                        if (customAlert) {
                            customAlert.remove();
                        }
                        window._hasAlertedWanDown = false;
                        
                        // 清除免扰状态
                        safeRemoveLocal('ignoreWanAlert'); 
                    }

                    var dns2 = dnsServers[1] || '';

                    var wIp = safeUciGet('network', 'wan', 'ipaddr', T['TXT_NOT_GOT']).split('/')[0], wGw = safeUciGet('network', 'wan', 'gateway', T['TXT_NOT_SET']);
                    var lIp = safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0], lGw = safeUciGet('network', 'lan', 'gateway', T['TXT_NOT_SET']), lIgnore = safeUciGet('dhcp', 'lan', 'ignore', ''), isBypass = (lIgnore === '1' || lIgnore === 'true' || lIgnore === 'on' || lIgnore === 'yes');
                    
                    // 全局拦截，只要发现网段死环，立刻弹窗
                    var sysWanIp = window._liveWanIp || ''; 
                    var currentLanIp = lIp; // 刚刚获取的最新局域网 IP
                    
                    // 只要拿到 WAN IP，且发现和 LAN 在同一网段，立刻触发警报
                    if (sysWanIp && currentLanIp && isSameSubnet(sysWanIp, currentLanIp)) {
                        if (!window._hasAlertedConflict && container.querySelector('#nw-global-modal').style.display === 'none') {
                            window._hasAlertedConflict = true; 
                            var newSafeIp = getSafeRouterIp(sysWanIp); // 如果 WAN 是 100 段，自动 192.168.1.1
                            
                            openModal({
                                title: T['M_CFLT_GLOBAL_TIT'], 
                                msg: T['M_CFLT_GLOBAL_MSG'].replace('{wan_ip}', sysWanIp).replace('{lan_ip}', currentLanIp) + "<div style='text-align:center;'><input type='text' id='conflict-new-ip' value='" + newSafeIp + "' style='font-size:19px; font-weight:bold; color:#1e3a8a; background:#eff6ff; border:2px solid #3b82f6; border-radius:8px; padding:10px 15px; width:220px; text-align:center; box-sizing:border-box; outline:none;'></div>", 
                                okText: T['BTN_FIX_CONFLICT'],
                                isDanger: true,
                                onOk: function() {
                                    var customIp = document.getElementById('conflict-new-ip').value.trim();
                                    var cleanIp = customIp.replace(/\s+/g, '');
                                    if (!isValidIP(cleanIp)) {
                                        alert(T['M_INVALID_IP_FMT']);
                                        document.getElementById('conflict-new-ip').value = newSafeIp;
                                        return;
                                    }
                                    if (isSameSubnet(sysWanIp, cleanIp)) {
                                        alert(T['M_STILL_CONFLICT']);
                                        document.getElementById('conflict-new-ip').value = newSafeIp;
                                        return;
                                    }
                                    if (selectedMode !== 'lan' && selectedMode !== '') {
                                        var userConfirm = confirm(T['M_WARN_UNSAVED']);
                                        if (!userConfirm) return; 
                                    }

                                    // 2. 合法的 IP 塞进表单
                                    container.querySelector('#lan-ip').value = cleanIp;
                                    selectedMode = 'lan'; // 明确告诉底层：这次只修 LAN
                                    
                                    // 3. 开启 120 秒回滚保护
                                    var safeToggle = container.querySelector('#lan-safe-toggle');
                                    if (safeToggle) safeToggle.checked = true;

                                    // 4. 清理所有弹窗并触发底层保存
                                    container.querySelector('#nw-global-modal').style.display = 'none';
                                    var wizModal = document.getElementById('nw-wizard-modal');
                                    if (wizModal) wizModal.style.display = 'none';
                                    
                                    container.querySelector('#btn-apply').click(); 
                                }
                            });
                        }
                    }

                    // ==========================================
                    // 1. IPv6状态获取（必须在外面）
                    // ==========================================
                    var v6Dhcp = safeUciGet('dhcp', 'lan', 'dhcpv6', 'disabled');
                    var v6Ra = safeUciGet('dhcp', 'lan', 'ra', 'disabled');
                    var v6Ndp = safeUciGet('dhcp', 'lan', 'ndp', 'disabled');
                    var v6Flags = safeUciGet('dhcp', 'lan', 'ra_flags', '');
                    if (Array.isArray(v6Flags)) v6Flags = v6Flags.join(' ');
                    var isV6Standard = (v6Dhcp === 'server' && v6Ra === 'server' && v6Ndp === 'server' && v6Flags.indexOf('managed-config') !== -1 && v6Flags.indexOf('other-config') !== -1);
                    var isV6Inconsistent = (!isV6Standard && (v6Dhcp === 'server' || v6Dhcp === 'relay' || v6Ra === 'server' || v6Ra === 'relay'));
                    window._trueIpv6State = (isV6Standard || isV6Inconsistent) ? '1' : '0';

                    // ==========================================
                    // 2. 缓存整合+阻挡后台5秒轮询覆盖
                    // ==========================================
                    if (!isSilent) {
                        // 1. 记录系统底层真实的上网模式和对应文字
                        window._nwRealWanMode = (wProto === 'pppoe') ? 'pppoe' : 'router';
                        
                        var protoName = '';
                        if (wProto === 'pppoe') protoName = T['STAT_MAIN_PPPOE'] || 'Main Router (PPPoE)';
                        else if (wProto === 'static') protoName = T['STAT_SEC_STATIC'] || 'Secondary Router (Static IP)';
                        else protoName = T['STAT_SEC_DHCP'] || 'Secondary Router (DHCP)';
                        window._nwCurrentProtoText = (T['CURRENT_MODE'] || 'Current:') + ' ' + protoName;

                        // 辅助函数：根据状态智能切换红色警告/绿色正常
                        var setupStatusBox = function(box, isWarning, warnText) {
                            if (!box) return;
                            if (isWarning) {
                                box.style.cssText = 'color: #dc2626; background: #fef2f2; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 15px; margin-top: 5px; border-left: 4px solid #ef4444; font-weight: bold; display: block; line-height: 1.6;';
                                box.innerHTML = warnText;
                            } else {
                                box.style.cssText = 'color: #059669; background: #ecfdf5; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 15px; margin-top: 5px; border-left: 4px solid #10b981; font-weight: bold; display: block; line-height: 1.6;';
                                box.innerHTML = '✅ ' + window._nwCurrentProtoText;
                            }
                        };

                        // 2. 动态生成 PPPoE 模式下的状态指示牌
                        var pppoeBox = container.querySelector('#fields-pppoe');
                        if (pppoeBox && !container.querySelector('#status-pppoe-info')) {
                            var statP = document.createElement('div');
                            statP.id = 'status-pppoe-info';
                            var titleP = pppoeBox.querySelector('h3, h4, .title, legend') || pppoeBox.firstElementChild;
                            if (titleP) titleP.insertAdjacentElement('afterend', statP);
                            else pppoeBox.appendChild(statP);
                        }
                        setupStatusBox(container.querySelector('#status-pppoe-info'), window._nwRealWanMode === 'router', T['WARN_PPPOE_INVALID']);

                        // 3. 动态生成二级路由模式下的状态指示牌
                        var routerBox = container.querySelector('#fields-router');
                        if (routerBox && !container.querySelector('#status-router-info')) {
                            var statR = document.createElement('div');
                            statR.id = 'status-router-info';
                            var titleR = routerBox.querySelector('h3, h4, .title, legend') || routerBox.firstElementChild;
                            if (titleR) titleR.insertAdjacentElement('afterend', statR);
                            else routerBox.appendChild(statR);
                        }
                        setupStatusBox(container.querySelector('#status-router-info'), window._nwRealWanMode === 'pppoe', T['WARN_ROUTER_INVALID']);

                        // --- 多线智能探测与渲染 ---
                        var pppoeIfaces = [];
                        var netSections = uci.sections('network', 'interface') || [];
                        netSections.forEach(function(s) {
                            if (s.proto === 'pppoe') {
                                pppoeIfaces.push({ name: s['.name'], user: s.username || '', pass: s.password || '' });
                            }
                        });
                        
                        window._nwMultiPppoe=(pppoeIfaces.length>1)?pppoeIfaces:null;
                        
                        var wizPppoeForm=container.querySelector('#wiz-pppoe-fields');
                        if(wizPppoeForm){
                            var existHint=container.querySelector('#wiz-multi-wan-hint');
                            if(window._nwMultiPppoe){
                                if(!existHint){
                                    var hint=document.createElement('div');
                                    hint.id='wiz-multi-wan-hint';
                                    hint.style.cssText='color:#b45309; font-size:12.5px; font-weight:bold; margin-bottom:12px; padding:8px 10px; background:#fef3c7; border-radius:6px; line-height:1.4; text-align:left;';
                                    hint.innerHTML=T['MSG_WIZ_MULTI_WAN']||'💡 Multi-WAN detected. Only the primary WAN will be configured here, other lines remain unchanged.';
                                    wizPppoeForm.insertBefore(hint,wizPppoeForm.firstChild);
                                    }
                                } else {
                                    if(existHint)existHint.remove();
                                }
                            }
                        var pppoeForm=container.querySelector('#main-pppoe-fields');
                        if (pppoeForm) {
                            if (window._nwMultiPppoe) {
                                var oldUser = container.querySelector('#pppoe-user');
                                if (oldUser) oldUser.remove();
                                var oldPass = container.querySelector('#pppoe-pass');
                                if (oldPass) oldPass.remove();

                                var mHtml = '<div style="color:#b45309; font-size:13.5px; font-weight:bold; margin-bottom:15px; padding:10px; background:#fef3c7; border-radius:6px; line-height:1.4;">' + (T['MSG_MULTI_WAN'] || '💡 Multi-WAN detected...') + '</div>';
                                window._nwMultiPppoe.forEach(function(iface) {
                                    mHtml += '<div class="nw-multi-pppoe-box" data-iface="' + iface.name + '" style="margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed #cbd5e1;">';
                                    mHtml += '<div style="font-size:15px; font-weight:bold; color:#0284c7; margin-bottom:12px;">' + (T['LBL_IFACE'] || 'Interface:') + ' ' + iface.name.toUpperCase() + '</div>';
                                    
                                    // 账号输入框（带上方独立 Label，强制白底深色字，附带聚焦变蓝效果）
                                    mHtml += '<div style="margin-bottom:12px;">';
                                    mHtml += '<div style="font-size:13.5px; color:#475569; font-weight:500; margin-bottom:6px;">' + (T['LBL_USER'] || 'User') + '</div>';
                                    mHtml += '<input type="search" class="m-user nd-input" placeholder="' + (T['PH_USER'] || '') + '" value="' + iface.user + '" style="width:100%; height:44px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; box-sizing:border-box; color:#334155; background:#fff; font-size:15px; outline:none; transition:border-color 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\'" onblur="this.style.borderColor=\'#cbd5e1\'">';
                                    mHtml += '</div>';

                                    // 密码输入框
                                    mHtml += '<div>';
                                    mHtml += '<div style="font-size:13.5px; color:#475569; font-weight:500; margin-bottom:6px;">' + (T['LBL_PASS'] || 'Pass') + '</div>';
                                    mHtml += '<input type="search" class="m-pass nd-input" placeholder="' + (T['PH_PASS'] || '') + '" value="' + iface.pass + '" style="width:100%; height:44px; border:1px solid #cbd5e1; border-radius:8px; padding:0 12px; box-sizing:border-box; color:#334155; background:#fff; font-size:15px; outline:none; transition:border-color 0.2s;" onfocus="this.style.borderColor=\'#3b82f6\'" onblur="this.style.borderColor=\'#cbd5e1\'">';
                                    mHtml += '</div>';

                                    mHtml += '</div>';
                                });
                                mHtml += '<button type="submit" id="main-pppoe-submit" style="display:none;">Apply</button>';
                                pppoeForm.innerHTML = mHtml;
                            } else {
                                // 还原单线模式的 DOM
                                if (!container.querySelector('#pppoe-user')) {
                                    pppoeForm.innerHTML = '<div class="nw-value"><label class="nw-value-title">' + (T['LBL_USER'] || 'User') + '</label><div class="nw-value-field"><input type="search" id="pppoe-user" class="nd-input" placeholder="' + (T['PH_USER'] || '') + '" autocomplete="on"></div></div>' +
                                                          '<div class="nw-value"><label class="nw-value-title">' + (T['LBL_PASS'] || 'Pass') + '</label><div class="nw-value-field"><input type="search" id="pppoe-pass" class="nd-input" placeholder="' + (T['PH_PASS'] || '') + '" autocomplete="on"></div></div>' +
                                                          '<button type="submit" id="main-pppoe-submit" style="display:none;">Apply</button>';
                                }
                                var uciUser = safeUciGet('network', 'wan', 'username', '');
                                var uciPass = safeUciGet('network', 'wan', 'password', '');
                                if (sessionStorage.getItem('nw_pppoe_user') === null) sessionStorage.setItem('nw_pppoe_user', uciUser);
                                if (sessionStorage.getItem('nw_pppoe_pass') === null) sessionStorage.setItem('nw_pppoe_pass', uciPass);
                                if (container.querySelector('#pppoe-user')) container.querySelector('#pppoe-user').value = sessionStorage.getItem('nw_pppoe_user');
                                if (container.querySelector('#pppoe-pass')) container.querySelector('#pppoe-pass').value = sessionStorage.getItem('nw_pppoe_pass');
                            }
                        }

                        if (container.querySelector('#router-ip')) container.querySelector('#router-ip').value = (wIp !== T['TXT_NOT_GOT']) ? wIp : '';
                        if (container.querySelector('#router-gw')) container.querySelector('#router-gw').value = (wGw !== T['TXT_NOT_SET']) ? wGw : '';
                        if (container.querySelector('#lan-ip')) container.querySelector('#lan-ip').value = lIp;
                        if (container.querySelector('#lan-gw')) container.querySelector('#lan-gw').value = (lGw !== T['TXT_NOT_SET']) ? lGw : '';
                        
                        if (wProto === 'static') {
                            var staticRadio = container.querySelector('input[name="router_type"][value="static"]');
                            if (staticRadio) staticRadio.checked = true;
                            var staticFields = container.querySelector('#router-static-fields');
                            if (staticFields) staticFields.style.display = 'block';
                        } else {
                            var dhcpRadio = container.querySelector('input[name="router_type"][value="dhcp"]');
                            if (dhcpRadio) dhcpRadio.checked = true;
                            var staticFields = container.querySelector('#router-static-fields');
                            if (staticFields) staticFields.style.display = 'none';
                        }

                        var bypassToggle = container.querySelector('#lan-bypass-toggle');
                        if (bypassToggle) { bypassToggle.checked = isBypass; container.querySelector('#lan-bypass-warning').style.display = isBypass ? 'block' : 'none'; container.querySelector('#lan-main-warning').style.display = isBypass ? 'none' : 'block'; }

                        var wispToggleEl = container.querySelector('#wisp-toggle');
                        if (wispToggleEl) {
                            var wispIface = uci.sections('wireless', 'wifi-iface').find(function(i) { return i.network === 'wwan' && i.mode === 'sta'; });
                            wispToggleEl.checked = !!wispIface;
                            var wispUi = container.querySelector('#wisp-ui-panel');
                            if (wispUi) {
                                wispUi.style.display = 'none';
                                if (wispIface) {
                                    var ssidInput = container.querySelector('#wisp-target-ssid'); if (ssidInput) ssidInput.value = wispIface.ssid || '';
                                    var keyInput = container.querySelector('#wisp-target-key'); if (keyInput) keyInput.value = wispIface.key || '';
                                    var encInput = container.querySelector('#wisp-target-enc'); if (encInput) encInput.value = wispIface.encryption || 'psk2+ccmp';
                                    var devInput = container.querySelector('#wisp-target-device'); if (devInput) devInput.value = wispIface.device || 'radio0';
                                    var bssidInput = container.querySelector('#wisp-target-bssid'); if (bssidInput) bssidInput.value = wispIface.bssid || '';
                                }
                            }
                        }

                        var ipv6Toggle = container.querySelector('#lan-ipv6-toggle');
                        var v6Warn = container.querySelector('#tip-ipv6-warn');
                        if (ipv6Toggle) ipv6Toggle.checked = (window._trueIpv6State === '1');
                        if (v6Warn) v6Warn.style.display = isV6Inconsistent ? 'block' : 'none';
                    }

                    // --- IPv6 NAT 冲突防呆逻辑 ---
                    var warningDiv = container.querySelector('#v6-nat-warning');
                    if (warningDiv) warningDiv.remove(); // 先清理旧警告

                    if (wifiRes && (wifiRes.lan_nat_conflict === true || String(wifiRes.lan_nat_conflict) === 'true')) {
                        if (ipv6Toggle) {
                            var v6Label = ipv6Toggle.closest('.nw-switch-row-padded');
                            if (v6Label) {
                                warningDiv = document.createElement('div');
                                warningDiv.id = 'v6-nat-warning';
                                warningDiv.style.cssText = 'margin-bottom: 15px; font-size: 13.5px; line-height: 1.5; border-radius: 6px; padding: 12px; text-align: left; box-shadow: 0 1px 2px rgba(0,0,0,0.05);';

                                if (window._trueIpv6State === '1') {
                                    // 1、IPv6 已开启，且存在冲突，允许关闭，发出红色严重警告
                                    ipv6Toggle.disabled = false;
                                    v6Label.style.opacity = '1';
                                    v6Label.style.cursor = 'pointer';
                                    v6Label.style.filter = 'none';
                                    v6Label.style.pointerEvents = 'auto';
                                    
                                    warningDiv.style.color = '#7f1d1d';
                                    warningDiv.style.background = '#fef2f2';
                                    warningDiv.style.borderLeft = '4px solid #ef4444';
                                    warningDiv.innerHTML = '<b>' + (T['V6_NAT_ERR_TIT1'] || '🚨 Severe Conflict!') + '</b><br>' + (T['V6_NAT_ERR_MSG1'] || 'Conflict detected.');
                                    v6Label.parentNode.insertBefore(warningDiv, v6Label.nextSibling);
                                } else {
                                    // 2、IPv6 未开启，且存在冲突，暴力反灰死锁，禁止开启！
                                    ipv6Toggle.disabled = true;
                                    v6Label.style.opacity = '0.35';
                                    v6Label.style.cursor = 'not-allowed';
                                    v6Label.style.filter = 'grayscale(100%)';
                                    v6Label.style.pointerEvents = 'none';
                                    
                                    warningDiv.style.color = '#dc2626';
                                    warningDiv.style.background = '#fff5f5';
                                    warningDiv.style.borderLeft = '4px solid #dc2626';
                                    warningDiv.innerHTML = '<b>' + (T['V6_NAT_ERR_TIT2'] || '⚠️ Blocked') + '</b><br>' + (T['V6_NAT_ERR_MSG2'] || 'NAT is enabled.');
                                    v6Label.parentNode.insertBefore(warningDiv, v6Label.nextSibling);
                                }
                            }
                        }
                    } else {
                        // 没有冲突，确保开关恢复正常
                        if (ipv6Toggle) {
                            ipv6Toggle.disabled = false;
                            var v6Label = ipv6Toggle.closest('.nw-switch-row-padded');
                            if (v6Label) {
                                v6Label.style.opacity = '1';
                                v6Label.style.cursor = 'pointer';
                                v6Label.style.filter = 'none';
                                v6Label.style.pointerEvents = 'auto';
                            }
                        }
                    }
                    // -------------------------------------

                    if (!window._wifiLoaded) {
                        try {
                            var wDevs = uci.sections('wireless', 'wifi-device') || [];
                            var wIfaces = uci.sections('wireless', 'wifi-iface') || [];

                                    // ===== Netwiz硬件嗅探日志 =====
                                    console.log("============== [Netwiz 硬件嗅探] ==============");
                                    console.log("检测到物理射频芯片数量:", wDevs.length);
                                    if (wDevs.length === 1) {
                                        console.log("架构判断: 【单芯片处理中心】 (Single-Chip)");
                                        console.log("目标核心:", wDevs[0]['.name']);
                                    } else if (wDevs.length > 1) {
                                        console.log("架构判断: 【多芯片独立阵列】 (Multi-Chip)");
                                        var dNames = [];
                                        for(var _i=0; _i<wDevs.length; _i++) dNames.push(wDevs[_i]['.name']);
                                        console.log("阵列核心:", dNames.join(', '));
                                    } else {
                                        console.log("架构判断: 未检测到 Wi-Fi 芯片");
                                    }
                                    console.log("===============================================");
                                    // ==================================
                                    // 三频识别与显示
                                    if (!window._isSingleChip && wDevs.length >= 3) {
                                    // if (true) {
                                        var hdr5g2 = container.querySelector('#hdr-5g2');
                                        var tab5g2 = container.querySelector('#tab-5g2');
                                        if (hdr5g2) hdr5g2.style.display = 'flex';
                                        if (tab5g2) tab5g2.style.display = 'block';
                                    }

                            var smartToggle = container.querySelector('#wifi-smart-toggle');
                            var legacyToggle = container.querySelector('#legacy-b-toggle');

                            if (wDevs.length > 0) {
                                function findMainIfaceForDev(devName) {
                                    var validIfaces = wIfaces.filter(function(i) { return i.device === devName; });
                                    if (validIfaces.length === 0) return {};
                                    var best = validIfaces.find(function(i) { return i.disabled !== '1' && i.ssid && i.mode === 'ap'; });
                                    if (!best) best = validIfaces.find(function(i) { return i.ssid && i.mode === 'ap'; });
                                    if (!best) best = validIfaces.find(function(i) { return i.disabled !== '1'; });
                                    if (!best) best = validIfaces[0];
                                    return best;
                                }

                                if (wDevs.length === 1) {
                                    window._isSingleChip = true;
                                    var theDev = wDevs[0];
                                    
                                    smartToggle.closest('#wifi-smart-row').style.display = 'none';
                                    container.querySelector('#wifi-smart-ui').style.display = 'none';
                                    container.querySelector('#wifi-split-ui').style.display = 'block';

                                    var is5G = false;
                                    var ch = parseInt(theDev.channel);
                                    var bd = (theDev.band || '').toLowerCase();
                                    var ht = (theDev.htmode || '').toLowerCase();
                                    var hm = (theDev.hwmode || '').toLowerCase();

                                    if (bd === '5g' || bd === '6g') { is5G = true; }
                                    else if (bd === '2g') { is5G = false; }
                                    else if (!isNaN(ch) && ch >= 36) { is5G = true; }
                                    else if (!isNaN(ch) && ch > 0 && ch <= 14) { is5G = false; }
                                    else if (ht.indexOf('80') !== -1 || ht.indexOf('160') !== -1 || ht.indexOf('320') !== -1) { is5G = true; }
                                    else if (hm === '11a' || hm === '11ac') { is5G = true; }
                                    else if (hm === '11g' || hm === '11b') { is5G = false; }
                                    else { is5G = (theDev['.name'] === 'radio0'); }

                                    var isLegacy = (hm === '11b');

                                    var allIfaces = wIfaces.filter(function(i) { return i.device === theDev['.name']; });
                                    var activeIface = allIfaces.find(function(i) { return i.disabled !== '1' && i.mode === 'ap'; }) || allIfaces[0];
                                    var inactiveIface = activeIface ? allIfaces.find(function(i) { return i['.name'] !== activeIface['.name'] && i.mode === 'ap'; }) : null;

                                    var actSsid = activeIface ? (activeIface.ssid || '') : '';
                                    var actKey = activeIface ? (activeIface.key || '') : '';
                                    var actEnc = activeIface ? (activeIface.encryption || 'psk2+ccmp') : 'psk2+ccmp';
                                    if (actEnc === 'psk2') actEnc = 'psk2+ccmp';
                                    var actHidden = activeIface ? (activeIface.hidden === '1') : false;
                                    var actDisabled = activeIface ? (activeIface.disabled === '1' || theDev.disabled === '1') : true;

                                    var inactSsid = inactiveIface ? (inactiveIface.ssid || '') : '';
                                    var inactKey = inactiveIface ? (inactiveIface.key || '') : '';
                                    var inactEnc = inactiveIface ? (inactiveIface.encryption || 'psk2+ccmp') : 'psk2+ccmp';
                                    if (inactEnc === 'psk2') inactEnc = 'psk2+ccmp';
                                    var inactHidden = inactiveIface ? (inactiveIface.hidden === '1') : false;

                                    var chan = theDev.channel || 'auto';
                                    var bwMatch = ht.match(/\d+/);
                                    var bw = bwMatch ? bwMatch[0] : 'auto';
                                    
                                    var pMode = 'auto';
                                    if (ht.indexOf('eht') !== -1) pMode = '11be';
                                    else if (ht.indexOf('he') !== -1) pMode = '11ax';
                                    else if (ht.indexOf('vht') !== -1) pMode = '11ac';
                                    else if (ht.indexOf('ht') !== -1) pMode = (hm.indexOf('a') !== -1 || is5G) ? '11a' : '11g';
                                    else if (hm === '11b') pMode = '11b';

                                    if (is5G) {
                                        container.querySelector('#wifi-5g-en').checked = !actDisabled;
                                        container.querySelector('#wifi-5g-ssid').value = actSsid;
                                        container.querySelector('#wifi-5g-key').value = actKey;
                                        var enc5gEl = container.querySelector('#wifi-5g-enc'); if(enc5gEl.querySelector('option[value="'+actEnc+'"]')) enc5gEl.value = actEnc;
                                        container.querySelector('#wifi-5g-hidden').checked = actHidden;
                                        var chanEl = container.querySelector('#wifi-5g-chan'); if(chanEl.querySelector('option[value="'+chan+'"]')) chanEl.value = chan;
                                        var bwEl = container.querySelector('#wifi-5g-bw'); if(bwEl.querySelector('option[value="'+bw+'"]')) bwEl.value = bw;
                                        var mEl = container.querySelector('#wifi-5g-mode'); if(mEl.querySelector('option[value="'+pMode+'"]')) mEl.value = pMode;
                                        legacyToggle.checked = false;

                                        container.querySelector('#wifi-2g-en').checked = false;
                                        if (inactiveIface && inactSsid) {
                                            container.querySelector('#wifi-2g-ssid').value = (inactSsid === actSsid) ? smartConvertSsid(actSsid, '2g') : inactSsid;
                                            container.querySelector('#wifi-2g-key').value = inactKey;
                                            var enc2gEl = container.querySelector('#wifi-2g-enc'); if(enc2gEl.querySelector('option[value="'+inactEnc+'"]')) enc2gEl.value = inactEnc;
                                            container.querySelector('#wifi-2g-hidden').checked = inactHidden;
                                        } else {
                                            container.querySelector('#wifi-2g-ssid').value = smartConvertSsid(actSsid, '2g');
                                            container.querySelector('#wifi-2g-key').value = actKey;
                                            var enc2gEl = container.querySelector('#wifi-2g-enc'); if(enc2gEl.querySelector('option[value="'+actEnc+'"]')) enc2gEl.value = actEnc;
                                            container.querySelector('#wifi-2g-hidden').checked = false;
                                        }
                                        setTimeout(function(){ container.querySelector('#tab-5g').click(); }, 50);
                                    } else {
                                        container.querySelector('#wifi-2g-en').checked = !actDisabled;
                                        container.querySelector('#wifi-2g-ssid').value = actSsid;
                                        container.querySelector('#wifi-2g-key').value = actKey;
                                        var enc2gEl = container.querySelector('#wifi-2g-enc'); if(enc2gEl.querySelector('option[value="'+actEnc+'"]')) enc2gEl.value = actEnc;
                                        container.querySelector('#wifi-2g-hidden').checked = actHidden;
                                        var chanEl = container.querySelector('#wifi-2g-chan'); if(chanEl.querySelector('option[value="'+chan+'"]')) chanEl.value = chan;
                                        var bwEl = container.querySelector('#wifi-2g-bw'); if(bwEl.querySelector('option[value="'+bw+'"]')) bwEl.value = bw;
                                        var mEl = container.querySelector('#wifi-2g-mode'); if(mEl.querySelector('option[value="'+pMode+'"]')) mEl.value = pMode;
                                        legacyToggle.checked = isLegacy;

                                        container.querySelector('#wifi-5g-en').checked = false;
                                        if (inactiveIface && inactSsid) {
                                            container.querySelector('#wifi-5g-ssid').value = (inactSsid === actSsid) ? smartConvertSsid(actSsid, '5g') : inactSsid;
                                            container.querySelector('#wifi-5g-key').value = inactKey;
                                            var enc5gEl = container.querySelector('#wifi-5g-enc'); if(enc5gEl.querySelector('option[value="'+inactEnc+'"]')) enc5gEl.value = inactEnc;
                                            container.querySelector('#wifi-5g-hidden').checked = inactHidden;
                                        } else {
                                            container.querySelector('#wifi-5g-ssid').value = smartConvertSsid(actSsid, '5g');
                                            container.querySelector('#wifi-5g-key').value = actKey;
                                            var enc5gEl = container.querySelector('#wifi-5g-enc'); if(enc5gEl.querySelector('option[value="'+actEnc+'"]')) enc5gEl.value = actEnc;
                                            container.querySelector('#wifi-5g-hidden').checked = false;
                                        }
                                        setTimeout(function(){ container.querySelector('#tab-2g').click(); }, 50);
                                    }
                                } else {
                                    window._isSingleChip = false;
                                    var dev2g = null, dev5g = null, dev5g2 = null;
                                    
                                    wDevs.forEach(function(d) {
                                        var bd = (d.band || '').toLowerCase();
                                        var ht = (d.htmode || '').toLowerCase();
                                        var hm = (d.hwmode || '').toLowerCase();
                                        var path = (d.path || '').toLowerCase();
                                        var ch = parseInt(d.channel);
                                        var is_5g_chip = false;
                                        
                                        if (bd === '5g' || bd === '6g') { is_5g_chip = true; }
                                        else if (bd === '2g') { is_5g_chip = false; }
                                        else if (hm === '11a' || hm === '11ac') { is_5g_chip = true; }
                                        else if (hm === '11g' || hm === '11b') { is_5g_chip = false; }
                                        else if (!isNaN(ch) && ch >= 36) { is_5g_chip = true; }
                                        else if (!isNaN(ch) && ch > 0 && ch <= 14) { is_5g_chip = false; }
                                        else if (ht.indexOf('80') !== -1 || ht.indexOf('160') !== -1 || ht.indexOf('320') !== -1) { is_5g_chip = true; }
                                        else {
                                            // 正常radio0 是 2.4G，其余是 5G
                                            if (d['.name'] !== 'radio0') is_5g_chip = true; 
                                            else is_5g_chip = false;
                                        }

                                        if (is_5g_chip) { 
                                            if (!dev5g) dev5g = d; 
                                            else if (!dev5g2) dev5g2 = d; // 抓取第3个芯片
                                        } 
                                        else { if (!dev2g) dev2g = d; }
                                    });
                                    
                                    if(!dev2g && wDevs.length > 0) dev2g = wDevs[0];
                                    if(!dev5g && wDevs.length > 1) dev5g = wDevs.find(d => d['.name'] !== dev2g['.name']);
                                    if(dev2g && dev5g && dev2g['.name'] === dev5g['.name']) {
                                        dev5g = wDevs.find(d => d['.name'] !== dev2g['.name']);
                                    }
                                    
                                    var i2g = findMainIfaceForDev(dev2g ? dev2g['.name'] : 'none');
                                    var i5g = findMainIfaceForDev(dev5g ? dev5g['.name'] : 'none');
                                    
                                    // 存在第三个芯片时，才去查找接口，否则直接给空值
                                    var i5g2 = dev5g2 ? findMainIfaceForDev(dev5g2['.name']) : null;

                                    var isLegacy = dev2g && dev2g.hwmode === '11b';
                                    
                                    var s2 = i2g.ssid || '', k2 = i2g.key || '';
                                    var e2 = i2g.encryption || 'psk2+ccmp';
                                    if (e2 === 'psk2') e2 = 'psk2+ccmp';
                                    var h2 = i2g.hidden === '1';
                                    var d2 = (i2g.disabled === '1' || (dev2g && dev2g.disabled === '1'));

                                    var s5 = i5g.ssid || '', k5 = i5g.key || '';
                                    var e5 = i5g.encryption || 'psk2+ccmp';
                                    if (e5 === 'psk2') e5 = 'psk2+ccmp';
                                    var h5 = i5g.hidden === '1';
                                    var d5 = (i5g.disabled === '1' || (dev5g && dev5g.disabled === '1'));
                                    
                                    // 解析 5G_Game 状态
                                    var s5g2 = '', k5g2 = '', d5g2 = true; 
                                    if (dev5g2 && i5g2) {
                                        s5g2 = i5g2.ssid || '';
                                        k5g2 = i5g2.key || '';
                                        d5g2 = (i5g2.disabled === '1' || dev5g2.disabled === '1');
                                    }
                                    
                                    var isSmart = (!isLegacy && s2 && s5 && s2 === s5 && k2 === k5 && e2 === e5);
                                    if (!s2 && !s5 && !d2 && !d5) isSmart = true;

                                    legacyToggle.checked = isLegacy;
                                    smartToggle.checked = isSmart;

                                    if (isSmart) {
                                        container.querySelector('#wifi-smart-en').checked = (!d2 && !d5);
                                        container.querySelector('#wifi-smart-ssid').value = s2;
                                        container.querySelector('#wifi-smart-key').value = k2;
                                        container.querySelector('#wifi-smart-enc').value = e2;
                                        container.querySelector('#wifi-smart-hidden').checked = h2;
                                    } else {
                                        container.querySelector('#wifi-2g-en').checked = !d2;
                                        container.querySelector('#wifi-2g-ssid').value = s2;
                                        container.querySelector('#wifi-2g-key').value = k2;
                                        container.querySelector('#wifi-2g-enc').value = e2;
                                        container.querySelector('#wifi-2g-hidden').checked = h2;
                                        if (dev2g) {
                                            var chanEl2 = container.querySelector('#wifi-2g-chan'); if(chanEl2.querySelector('option[value="'+(dev2g.channel||'auto')+'"]')) chanEl2.value = (dev2g.channel||'auto');
                                            var bwM2 = (dev2g.htmode||'').match(/\d+/); var bw2 = bwM2 ? bwM2[0] : 'auto';
                                            var bwEl2 = container.querySelector('#wifi-2g-bw'); if(bwEl2.querySelector('option[value="'+bw2+'"]')) bwEl2.value = bw2;
                                            
                                            var ht2 = (dev2g.htmode||'').toLowerCase(), hm2 = (dev2g.hwmode||'').toLowerCase(), md2 = 'auto';
                                            if(ht2.indexOf('eht') !== -1) md2 = '11be'; else if(ht2.indexOf('he') !== -1) md2 = '11ax'; else if(ht2.indexOf('vht') !== -1) md2 = '11ac'; else if(ht2.indexOf('ht') !== -1) md2 = '11g'; else if(hm2 === '11b') md2 = '11b';
                                            var mEl2 = container.querySelector('#wifi-2g-mode'); if(mEl2.querySelector('option[value="'+md2+'"]')) mEl2.value = md2;
                                        }

                                        container.querySelector('#wifi-5g-en').checked = !d5;
                                        container.querySelector('#wifi-5g-ssid').value = s5;
                                        container.querySelector('#wifi-5g-key').value = k5;
                                        container.querySelector('#wifi-5g-enc').value = e5;
                                        container.querySelector('#wifi-5g-hidden').checked = h5;
                                        if (dev5g) {
                                            var chanEl5 = container.querySelector('#wifi-5g-chan'); if(chanEl5.querySelector('option[value="'+(dev5g.channel||'auto')+'"]')) chanEl5.value = (dev5g.channel||'auto');
                                            var bwM5 = (dev5g.htmode||'').match(/\d+/); var bw5 = bwM5 ? bwM5[0] : 'auto';
                                            var bwEl5 = container.querySelector('#wifi-5g-bw'); if(bwEl5.querySelector('option[value="'+bw5+'"]')) bwEl5.value = bw5;
                                            
                                            var ht5 = (dev5g.htmode||'').toLowerCase(), hm5 = (dev5g.hwmode||'').toLowerCase(), md5 = 'auto';
                                            if(ht5.indexOf('eht') !== -1) md5 = '11be'; else if(ht5.indexOf('he') !== -1) md5 = '11ax'; else if(ht5.indexOf('vht') !== -1) md5 = '11ac'; else if(ht5.indexOf('ht') !== -1) md5 = '11a';
                                            var mEl5 = container.querySelector('#wifi-5g-mode'); if(mEl5.querySelector('option[value="'+md5+'"]')) mEl5.value = md5;
                                        }
                                        var en5g2El = container.querySelector('#wifi-5g2-en');
                                        if (en5g2El) {
                                            en5g2El.checked = !d5g2; // 根据底层真实情况显示开关
                                            if (s5g2) container.querySelector('#wifi-5g2-ssid').value = s5g2;
                                            if (k5g2) container.querySelector('#wifi-5g2-key').value = k5g2;
                                        }
                                    }
                                    smartToggle.dispatchEvent(new Event('change'));
                                }
                            }

                            function syncRoamUI(ifaceList, devName, targetBand, encId, togId, warnId) {
                                var iface = null;
                                if (window._isSingleChip) {
                                    iface = ifaceList.find(function(i) { return i.device === devName && i.mode === 'ap' && (i['.name'].indexOf(targetBand) !== -1); });
                                    if (!iface) {
                                        var apIfaces = ifaceList.filter(function(i) { return i.device === devName && i.mode === 'ap'; });
                                        iface = (targetBand === '2g') ? apIfaces[0] : (apIfaces[1] || apIfaces[0]);
                                    }
                                } else {
                                    iface = ifaceList.find(function(i) { return i.device === devName && i.mode === 'ap' && i.disabled !== '1'; });
                                    if (!iface) iface = ifaceList.find(function(i) { return i.device === devName && i.mode === 'ap'; });
                                }

                                if (!iface) return;
                                var tog = container.querySelector(togId);
                                var warn = container.querySelector(warnId);
                                var encEl = container.querySelector(encId);
                                if (!tog) return;
                                
                                var rOn = (iface.ieee80211r === '1');
                                tog.checked = rOn;
                                
                                var encVal = encEl ? encEl.value : (iface.encryption || 'psk2+ccmp');
                                var isDirty = rOn && (iface.mobility_domain !== 'e4d1' || encVal === 'none');

                                if (isDirty) {
                                    tog.classList.add('is-dirty'); 
                                    if (warn) warn.style.display = 'block'; 
                                } else {
                                    tog.classList.remove('is-dirty');
                                    if (warn) warn.style.display = 'none';
                                }

                                var keyId = togId.replace('-roaming', '-key'); 
                                var pwdInput = container.querySelector(keyId);
                                var pwdRow = pwdInput ? pwdInput.closest('.nw-value') : null;

                                if (pwdRow) {
                                    var statRow = pwdRow.nextElementSibling;
                                    var isExist = statRow && statRow.classList.contains('nw-roam-status-row');

                                    if (!isExist) {
                                        statRow = document.createElement('div');
                                        statRow.className = 'nw-roam-status-row';
                                        statRow.style.cssText = 'margin-top: 5px; margin-bottom: 15px; ';
                                        pwdRow.parentNode.insertBefore(statRow, pwdRow.nextSibling);
                                    }

                                    if (rOn) {
                                        if (isDirty) {
                                            statRow.innerHTML = "<span title='" + T['DESC_ROAM_DIRTY'] + "' style='display:inline-flex; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.15); color:#10b981; border: 1px solid #10b981; font-size:14px; padding:6px 10px; border-radius:8px; font-family:sans-serif; cursor:pointer; font-weight:bold; white-space:nowrap; transition:all 0.25s ease; margin:0 auto;'>" + T['TXT_ROAMING_ON'] + "<b style='display:inline-flex; align-items:center; justify-content:center; background:#ef4444; color:#ffffff; width:18px; height:18px; border-radius:50%; font-size:14px; font-family:Arial,sans-serif; font-weight:900; margin-left:6px; line-height:1;'>!</b> <span style='font-size:14px; font-weight:bold; color:#ef4444; margin-left:5px; text-decoration:underline;'>" + T['TXT_CLICK_FIX'] + "</span></span>";
                                        } else {
                                            statRow.innerHTML = "<span style='display:inline-flex; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.15); color:#10b981; border: 1px solid #10b981; font-size:14px; padding:6px 16px; border-radius:8px; font-family:sans-serif; font-weight:bold; white-space:nowrap; cursor:pointer; transition:all 0.25s ease; margin:0 auto;'>" + T['TXT_ROAMING_ON'] + "</span>";
                                        }

                                        // 悬浮动画增强
                                        var badgeSpan = statRow.querySelector('span');
                                        badgeSpan.onmouseover = function() { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(16,185,129,0.25)'; };
                                        badgeSpan.onmouseout = function() { this.style.transform = 'none'; this.style.boxShadow = 'none'; };
                                        
                                        badgeSpan.onclick = function(e) {
                                            e.stopPropagation();
                                            if (isDirty) alert(T['DESC_ROAM_DIRTY']);
                                            var advPanel = tog.closest('.nw-adv-panel');
                                            var advBtn = advPanel ? advPanel.previousElementSibling : null;
                                            if (advPanel && advPanel.style.display === 'none' && advBtn) {
                                                advBtn.click();
                                            }
                                            setTimeout(function() {
                                                tog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                var targetRow = tog.closest('div'); 
                                                if (targetRow) {
                                                    var oldBg = targetRow.style.backgroundColor || 'transparent';
                                                    targetRow.style.transition = 'background-color 0.4s ease';
                                                    targetRow.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                                                    targetRow.style.borderRadius = '8px';
                                                    setTimeout(function() {
                                                        targetRow.style.backgroundColor = oldBg;
                                                        setTimeout(function() { targetRow.style.transition = ''; }, 400);
                                                    }, 800); 
                                                }
                                            }, 80); 
                                        };
                                    } else {
                                        statRow.innerHTML = "";
                                    }
                                }
                            }

                            if (window._isSingleChip && wDevs[0]) {
                                syncRoamUI(wIfaces, wDevs[0]['.name'], '2g', '#wifi-2g-enc', '#wifi-2g-roaming', '#roam-warn-2g');
                                syncRoamUI(wIfaces, wDevs[0]['.name'], '5g', '#wifi-5g-enc', '#wifi-5g-roaming', '#roam-warn-5g');
                            } else {
                                if (dev2g) syncRoamUI(wIfaces, dev2g['.name'], '2g', '#wifi-2g-enc', '#wifi-2g-roaming', '#roam-warn-2g');
                                if (dev5g) {
                                    syncRoamUI(wIfaces, dev5g['.name'], '5g', '#wifi-5g-enc', '#wifi-5g-roaming', '#roam-warn-5g');
                                    syncRoamUI(wIfaces, dev5g['.name'], 'smart', '#wifi-smart-enc', '#wifi-smart-roaming', '#roam-warn-smart');
                                }
                            }

                            window._origWifiState = getWifiSnapshot();
                            
                            window._wifiLoaded = true;
                        } catch(ex) { }
                    }

                    // ---- 开始 ----
                    var mkB = function(bg, txt) { return "<span style='font-size:14px; background:" + bg + "; color:#fff; padding:5px 10px; border-radius:12px; white-space:nowrap;'>" + txt + "</span>"; };
                    var mkD = function(l1, v1, l2, v2) { return "<span class='nw-info-item'>" + l1 + " <span class='nw-hl'>" + v1 + "</span></span><span class='nw-info-item'>" + l2 + " <span class='nw-hl'>" + v2 + "</span></span>"; };

                    // 这样时间在内部怎么跳动，都绝对不会再挤压外部的排版！
                    var fixedUpBadge = upBadgeHtml ? "<span style='display:inline-block; width:AUTO; text-align:left; font-variant-numeric: tabular-nums; margin:0 0;'>" + upBadgeHtml + "</span>" : "";
                    
                    var sTitle = "", sDetails = "", statusBadge = "";
                    
                    // 底层物理网口/PPPoE已断开，或还未获取到IP，强制立刻显示断开的X，不等待8秒的ping缓存
                    if (!activeWan.up || !liveWanIp) { window.nwInetStatus = 'fail'; }

                    var iconStr = window.nwInetStatus === 'ok' ? '🌐' : (window.nwInetStatus === 'fail' ? '❌' : '');
                    var titleStr = window.nwInetStatus === 'ok' ? (T['TXT_NET_OK'] || 'Internet Connected') : (window.nwInetStatus === 'fail' ? (T['TXT_NET_FAIL'] || 'Internet Disconnected') : '');
                    
                    var inetBadgeHtml = "<span id='nw-inet-badge' title='" + titleStr + "' style='display:inline-block; width:28px; text-align:center; font-size:22px; vertical-align:middle; cursor:default; line-height:1;'>" + iconStr + "</span>";

                    if (isBypass) { sTitle = T['STAT_BYPASS']; sDetails = mkD(T['TXT_DEV_IP'], lIp, T['TXT_UP_GW'], lGw); } 
                    else if (isWispActive) { sTitle = T['TXT_WISP_ON'] || 'WISP Enabled'; statusBadge = mkB('#10b981', T['BDG_GOT'] || 'IP Acquired') + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_WAN_IP'], liveWanIp, T['TXT_UP_GW'], liveGw); }
                    else if (hasWispConfigured && !isWispActive) { sTitle = T['TXT_WISP_ON'] || 'WISP Enabled'; statusBadge = mkB('#f59e0b', T['TXT_WISP_WAITING'] || 'Connecting...') + inetBadgeHtml + fixedUpBadge; sDetails = "<div style='color:#facc15; font-size:14.5px; font-weight:bold;'>" + (T['MSG_WISP_STUCK'] || '⚠️ Connecting to upstream...') + "</div>"; }
                    else if (wProto === 'pppoe') { sTitle = T['STAT_MAIN_PPPOE']; if (activeWan.up && liveWanIp) { statusBadge = mkB('#10b981', T['BDG_SUCC']) + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_PUB_IP'], liveWanIp, T['TXT_REM_GW'], liveGw); } else { statusBadge = mkB('#ef4444', T['BDG_DIAL']) + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_STATUS'], T['TXT_WAIT_REM']); } } 
                    else if (wProto === 'dhcp') { sTitle = T['STAT_SEC_DHCP']; if (activeWan.up && liveWanIp) { statusBadge = mkB('#10b981', T['BDG_GOT']) + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_WAN_IP'], liveWanIp, T['TXT_UP_GW'], liveGw); } else { statusBadge = mkB('#f59e0b', T['BDG_WAIT']) + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_STATUS'], T['TXT_GET_IP']); } } 
                    else if (wProto === 'static') { sTitle = T['STAT_SEC_STATIC']; statusBadge = (activeWan.up ? mkB('#10b981', T['BDG_CONN']) : mkB('#ef4444', T['BDG_UNPLUG'])) + inetBadgeHtml + fixedUpBadge; sDetails = mkD(T['TXT_WAN_IP'], wIp, T['TXT_UP_GW'], wGw); } 
                    else { sTitle = T['STAT_LAN']; sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_DHCP_SRV'], T['TXT_ON']); }
                    // ---- 结束 ----
                    var sDnsHtml = "";
                    if (!isBypass && activeWan.up && dns1) {
                        sDnsHtml = "<div style='font-size:15.5px; font-weight:bold; color:#FFF; font-family:monospace; margin:6px 0 10px 0; display:flex; flex-wrap:wrap; justify-content:center; gap:0;'><span class='nw-info-item'>" + T['TXT_DNS1'] + " <span class='nw-hl'>" + dns1 + "</span></span>" + (dns2 ? "<span class='nw-info-item'>" + T['TXT_DNS2'] + " <span class='nw-hl'>" + dns2 + "</span></span>" : "") + "</div>";
                    }

                    window._gotoRoam = function(band, isDirty) {
                        var box = document.getElementById('netwiz-container');
                        if (!box) return;
                        if (isDirty && typeof T !== 'undefined') alert(T['DESC_ROAM_DIRTY']);
                        
                        selectedMode = 'wifi'; 
                        var s1 = box.querySelector('#step-1'), s2 = box.querySelector('#step-2'), s3 = box.querySelector('#step-3');
                        if (s1) s1.style.display = 'none';
                        if (s3) s3.style.display = 'none';
                        if (s2) s2.style.display = 'block';
                        
                        var fRouter = box.querySelector('#fields-router'); if(fRouter) fRouter.style.display = 'none';
                        var fPppoe = box.querySelector('#fields-pppoe'); if(fPppoe) fPppoe.style.display = 'none';
                        var fLan = box.querySelector('#fields-lan'); if(fLan) fLan.style.display = 'none';
                        var fWifi = box.querySelector('#fields-wifi'); if(fWifi) fWifi.style.display = 'block';
                        
                        setTimeout(function() {
                            var isSmart = box.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
                            var targetTogId = isSmart ? '#wifi-smart-roaming' : '#wifi-' + band + '-roaming';
                            
                            if (!isSmart) {
                                var tabBtn = box.querySelector('#tab-' + band);
                                if (tabBtn) tabBtn.click(); 
                            }
                            
                            setTimeout(function() {
                                var tog = box.querySelector(targetTogId);
                                if (!tog) return;
                                
                                var advPanel = tog.closest('.nw-adv-panel');
                                var advBtn = advPanel ? advPanel.previousElementSibling : null;
                                if (advPanel && advPanel.style.display === 'none' && advBtn) {
                                    advBtn.click(); 
                                }
                                
                                setTimeout(function() {
                                    tog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    var targetRow = tog.closest('div');
                                    if (targetRow) {
                                        var oldBg = targetRow.style.backgroundColor || 'transparent';
                                        targetRow.style.transition = 'background-color 0.4s ease';
                                        targetRow.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
                                        targetRow.style.borderRadius = '8px';
                                        
                                        setTimeout(function() {
                                            targetRow.style.backgroundColor = oldBg;
                                            setTimeout(function() { targetRow.style.transition = ''; }, 400);
                                        }, 1000); 
                                    }
                                }, 150);
                            }, 100);
                        }, 100);
                    };

                    var ipv6Label = (window._trueIpv6State === '1') ? '<b style="color:#10b981; padding: 3px 10px; background: #fff; border-radius: 10px;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444; padding: 3px 10px; background: #fff; border-radius: 10px;">' + T['TXT_OFF'] + '</b>';
                    
                    var wDevsList = uci.sections('wireless', 'wifi-device') || [];
                    var wIfacesList = uci.sections('wireless', 'wifi-iface') || [];
                    var activeIfaces = wIfacesList.filter(function(i) { 
                        var parentDev = wDevsList.find(function(d) { return d['.name'] === i.device; });
                        var isDevDisabled = parentDev ? (parentDev.disabled == 1 || parentDev.disabled === 'true' || parentDev.disabled === true) : false;
                        var isIfaceDisabled = (i.disabled == 1 || i.disabled === 'true' || i.disabled === true);
                        return !isIfaceDisabled && !isDevDisabled && (i.mode === 'ap' || i.mode === 'sta') && i.ssid; 
                    });
                    var wifiLines = [];
                    // === 首页 Wi-Fi 卡片 ===
                    var animLayer = container.querySelector('.nw-wifi-anim-layer');
                    var cardTags = container.querySelector('#nw-wifi-tags');
                    if (cardTags) {
                        if (activeIfaces.length > 0) {
                            if (animLayer) {
                                animLayer.style.display = 'block';
                                animLayer.style.animation = 'wifi-wave 2s infinite';
                            }
                            
                            var tagsHtml = '';
                            var hasAp = activeIfaces.some(function(i){ return i.mode === 'ap'; });
                            var hasSta = activeIfaces.some(function(i){ return i.mode === 'sta'; });
                            
                            if (hasAp) {
                                var apList = activeIfaces.filter(function(i){ return i.mode === 'ap'; });
                                var isSmartGrp = apList.length > 1 && apList.every(function(i){ return i.ssid === apList[0].ssid && i.key === apList[0].key; });
                                if (isSmartGrp) {
                                    tagsHtml += '<span style="font-size:11.5px; background:rgba(59,130,246,0.1); color:#3b82f6; border:1px solid rgba(59,130,246,0.2); padding:2px 8px; border-radius:12px; font-weight:bold;">' + (T['TAG_SMART'] || 'Smart Connect') + '</span>';
                                } else {
                                    tagsHtml += '<span style="font-size:11.5px; background:rgba(16,185,129,0.1); color:#10b981; border:1px solid rgba(16,185,129,0.2); padding:2px 8px; border-radius:12px; font-weight:bold;">' + (T['TAG_SPLIT'] || 'Independent Bands') + '</span>';
                                }
                            }
                            if (hasSta) {
                                tagsHtml += '<span style="font-size:11.5px; background:rgba(245,158,11,0.1); color:#f59e0b; border:1px solid rgba(245,158,11,0.2); padding:2px 8px; border-radius:12px; font-weight:bold;">' + (T['TAG_WISP'] || 'WISP Repeater') + '</span>';
                            }
                            cardTags.innerHTML = tagsHtml;
                        } else {
                            if (animLayer) {
                                animLayer.style.display = 'none';
                                animLayer.style.animation = 'none'; 
                            }
                            cardTags.innerHTML = '<span style="font-size:11.5px; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:2px 8px; border-radius:12px; font-weight:bold;">' + (T['TAG_DISABLED'] || 'Disabled') + '</span>';
                        }
                    }
                    // ==================================
                    
                    if (!window._hasRealWifi) {
                        // 没有真实物理 Wi-Fi，隐藏状态栏的 Wi-Fi 信息
                    } else if (activeIfaces.length === 0) {
                        wifiLines.push("<div><span>" + T['TXT_WIFI_STATUS'] + ": </span><b style='color:#ef4444;'>" + T['TXT_OFF'] + "</b></div>");
                    } else {
                        var apIfaces = activeIfaces.filter(function(i) { return i.mode === 'ap'; });
                        var staIfaces = activeIfaces.filter(function(i) { return i.mode === 'sta'; });
                        
                        // 1. 中继网络 (STA) 照常独立显示
                        staIfaces.forEach(function(i) {
                            var sName = escapeHTML(i.ssid);
                            var tLbl = "<b class='nw-wifi-badge' style='color:#10b981;'>" + T['TXT_WISP_ON'] + "</b>";
                            var qrAttr = " class='nw-hl nw-wifi-name nw-qr-hover' data-ssid=\"" + escapeHTML(i.ssid||'') + "\" data-pwd=\"" + escapeHTML(i.key||'') + "\" data-enc=\"" + escapeHTML(i.encryption||'none') + "\" style='cursor:pointer; position:relative; z-index:10; border-bottom:1px dashed rgba(255,255,255,0.4); padding-bottom:1px;' ";
                            wifiLines.push("<div class='nw-wifi-line'><span class='nw-wifi-left'>" + tLbl + "<span class='nw-wifi-colon'>:</span><span class='nw-hl nw-wifi-name'><span style='display:block; max-width:100%; word-break:break-all; white-space:normal; overflow-wrap:anywhere;'>" + sName + "</span></span></span></div>");
                        });

                        // 2. 判断 AP 是否应该合并为“多频合一”显示
                        var isSmartGrouped = false;
                        if (apIfaces.length > 1) {
                            var first = apIfaces[0];
                            isSmartGrouped = apIfaces.every(function(i) {
                                return i.ssid === first.ssid && i.key === first.key;
                            });
                        }
                        if (isSmartGrouped) {
                            // 渲染合并后的单行 UI
                            var i = apIfaces[0];
                            var sName = escapeHTML(i.ssid);
                            var kTxt = i.key ? escapeHTML(i.key) : "<span style='color:#ef4444;'>" + T['TXT_NO_PASS'] + "</span>"; 
                            var bandStr = 'smart';
                            
                            var rOn = apIfaces.some(function(x) { return x.ieee80211r === '1'; });
                            var isDirty = apIfaces.some(function(x) {
                                var enc = (x.encryption || '').toLowerCase();
                                var md = (x.mobility_domain || '').toLowerCase();
                                return x.ieee80211r === '1' && (md !== 'e4d1' || enc === 'none');
                            });
                            
                            var roamBadge = "";
                            if (rOn) {
                                var clickFn = "if(window._gotoRoam){ window._gotoRoam('" + bandStr + "', " + isDirty + "); }";
                                var hoverStyle = "onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 3px 6px rgba(16,185,129,0.3)'\" onmouseout=\"this.style.transform='none'; this.style.boxShadow='none'\"";
                                if (isDirty) {
                                    roamBadge = "<span title='" + T['DESC_ROAM_DIRTY'] + " - " + T['TXT_CLICK_FIX'] + "' onclick=\"" + clickFn + "\" " + hoverStyle + " style='display:inline-block; white-space:nowrap; background:rgba(16, 185, 129, 0.2); color:#a7f3d0; border: 1px solid #10b981; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:text-bottom; font-family:sans-serif; cursor:pointer; transition:all 0.2s ease;'>" + T['TXT_ROAMING'] + "<b style='display:inline-block; background:#ef4444; color:#ffffff; width:15px; height:15px; line-height:15px; text-align:center; border-radius:50%; font-size:12px; font-family:Arial,sans-serif; font-weight:bold; margin-left:4px;'>!</b></span>";
                                } else {
                                    roamBadge = "<span title='" + T['TXT_CLICK_GOTO'] + "' onclick=\"" + clickFn + "\" " + hoverStyle + " style='display:inline-block; white-space:nowrap; background:rgba(16, 185, 129, 0.2); color:#a7f3d0; border: 1px solid #10b981; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:text-bottom; font-family:sans-serif; cursor:pointer; transition:all 0.2s ease;'>" + T['TXT_ROAMING'] + "</span>";
                                }
                            }

                            // 多频合一白色标识牌，pointer-events 接收鼠标事件
                            var qrData = " data-ssid=\"" + escapeHTML(i.ssid||'') + "\" data-pwd=\"" + escapeHTML(i.key||'') + "\" data-enc=\"" + escapeHTML(i.encryption||'none') + "\" ";
                            var tLbl = "<b class='nw-wifi-badge nw-qr-hover' " + qrData + " style='color:#10b981; cursor:pointer; pointer-events:auto !important; position:relative; z-index:20;' title='" + (T['TXT_SCAN_TO_CONN'] || 'Scan to Connect') + "'>" + T['LBL_SMART_CONN'] + "</b>"; 
                            
                            wifiLines.push("<div class='nw-wifi-line'><span class='nw-wifi-left'>" + tLbl + "<span class='nw-wifi-colon'>:</span><span class='nw-hl nw-wifi-name'><span style='display:block; max-width:100%; word-break:break-all; white-space:normal; overflow-wrap:anywhere;'>" + sName + "</span>" + roamBadge + "</span></span><span class='nw-wifi-pwd'>(" + T['M_PWD'] + ": <span style='word-break:break-all; white-space:normal;'>" + kTxt + "</span>)</span></div>");
                        } else {
                            // 3. 渲染独立频段 UI
                            apIfaces.forEach(function(i) {
                                var sName = escapeHTML(i.ssid);
                                var kTxt = i.key ? escapeHTML(i.key) : "<span style='color:#ef4444;'>" + T['TXT_NO_PASS'] + "</span>";
                                var bandStr = '2g';
                                var dObj = wDevsList.find(function(x) { return x['.name'] === i.device; });
                                if (dObj) {
                                    var hw = (dObj.hwmode||'').toLowerCase();
                                    var bd = (dObj.band||'').toLowerCase();
                                    var path = (dObj.path||'').toLowerCase();
                                    if (hw.indexOf('a') !== -1 || bd === '5g' || path.indexOf('pcie1') !== -1 || path.indexOf('pcie2') !== -1) {
                                        bandStr = '5g';
                                    } else {
                                        bandStr = '2g';
                                    }
                                }
                                
                                var rOn = (i.ieee80211r === '1');
                                var enc = (i.encryption || '').toLowerCase();
                                var isDirty = rOn && (i.mobility_domain !== 'e4d1' || enc === 'none');
                                
                                var roamBadge = "";
                                if (rOn) {
                                    var clickFn = "if(window._gotoRoam){ window._gotoRoam('" + bandStr + "', " + isDirty + "); }";
                                    var hoverStyle = "onmouseover=\"this.style.transform='translateY(-2px)'; this.style.boxShadow='0 3px 6px rgba(16,185,129,0.3)'\" onmouseout=\"this.style.transform='none'; this.style.boxShadow='none'\"";
                                    
                                    if (isDirty) {
                                        roamBadge = "<span title='" + T['DESC_ROAM_DIRTY'] + " - " + T['TXT_CLICK_FIX'] + "' onclick=\"" + clickFn + "\" " + hoverStyle + " style='display:inline-block; white-space:nowrap; background:rgba(16, 185, 129, 0.2); color:#a7f3d0; border: 1px solid #10b981; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:text-bottom; font-family:sans-serif; cursor:pointer; transition:all 0.2s ease;'>" + T['TXT_ROAMING'] + "<b style='display:inline-block; background:#ef4444; color:#ffffff; width:15px; height:15px; line-height:15px; text-align:center; border-radius:50%; font-size:12px; font-family:Arial,sans-serif; font-weight:bold; margin-left:4px;'>!</b></span>";
                                    } else {
                                        roamBadge = "<span title='" + T['TXT_CLICK_GOTO'] + "' onclick=\"" + clickFn + "\" " + hoverStyle + " style='display:inline-block; white-space:nowrap; background:rgba(16, 185, 129, 0.2); color:#a7f3d0; border: 1px solid #10b981; font-size:11px; padding:2px 6px; border-radius:4px; margin-left:8px; vertical-align:text-bottom; font-family:sans-serif; cursor:pointer; transition:all 0.2s ease;'>" + T['TXT_ROAMING'] + "</span>";
                                    }
                                }

                                // 独立频段白色标识牌，pointer-events 强制接收鼠标事件
                                var qrData = " data-ssid=\"" + escapeHTML(i.ssid||'') + "\" data-pwd=\"" + escapeHTML(i.key||'') + "\" data-enc=\"" + escapeHTML(i.encryption||'none') + "\" ";
                                var tLblNew = "<b class='nw-wifi-badge nw-qr-hover' " + qrData + " style='color:#10b981; cursor:pointer; pointer-events:auto !important; position:relative; z-index:20;' title='悬浮显示二维码'>" + (bandStr === '5g' ? T['TXT_5G_ACCT'] : T['TXT_2G_ACCT']) + "</b>";
                                wifiLines.push("<div class='nw-wifi-line'><span class='nw-wifi-left'>" + tLblNew + "<span class='nw-wifi-colon'>:</span><span class='nw-hl nw-wifi-name'><span style='display:block; max-width:100%; word-break:break-all; white-space:normal; overflow-wrap:anywhere;'>" + sName + "</span>" + roamBadge + "</span></span><span class='nw-wifi-pwd'>(" + T['M_PWD'] + ": <span style='word-break:break-all; white-space:normal;'>" + kTxt + "</span>)</span></div>");
                            });
                        }
                    }
                    
                    var ipv6Html = "<div style='font-size:15.5px; font-weight:bold; color:#ffffff; font-family:monospace; letter-spacing:0.5px; display:flex; flex-wrap:wrap; justify-content:center; align-items:center; line-height: 1.8; margin-top: 6px; max-width:100%; min-width:0; word-break:break-all;'><span style='font-weight: 900; margin-right: 8px; flex-shrink:0;'>IPv6 (DHCPv6): </span>" + ipv6Label + "</div>";
                    
                    // 全局出场跳转函数
                    window._leavePage = function(url) {
                        var wrap = document.querySelector('.nw-wrapper');
                        if (wrap) wrap.classList.add('page-leaving');
                        // 400ms 等动画完了再跳转
                        setTimeout(function() { window.location.href = url; }, 400); 
                    };

                    // 跳转到新网络管家按钮
                    var devMgrBtn = "";
                    if (!isBypass) {
                         var devUrl = window.location.pathname.replace('/netwiz', '/netwiz_dev');
                         // 生成按鈕的 HTML
                         devMgrBtn = "<div style='margin-top: 20px; width: 100%;'><a href='" + devUrl + "' id='btn-goto-dev' style='font-size: 18.5px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: rgba(99, 102, 241, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 8px; color: #fff; text-decoration: none; font-weight: bold; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.1);' onmouseover=\"this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)';\" onmouseout=\"this.style.background='rgba(99, 102, 241, 0.5)'; this.style.transform='none';\"><svg style='width: 18px; height: 18px;' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='3' width='20' height='14' rx='2' ry='2'></rect><line x1='8' y1='21' x2='16' y2='21'></line><line x1='12' y1='17' x2='12' y2='21'></line></svg> " + (T['BTN_DEV_BIND'] || '终端设备与 IP 绑定') + "</a></div>";
                    }

                    var extraInfo = "<div style='margin-top: 16px; padding-top: 18px; border-top: 1px dashed rgba(255,255,255,0.6); font-size:15.5px; color:#ffffff; font-weight: 600; font-family:monospace; display:flex; flex-direction:column; gap:5px; align-items:center; max-width:100%; min-width:0; width:100%; box-sizing:border-box;'>";
                    extraInfo += wifiLines.join('');
                    extraInfo += "</div>";

                    // 当前是否已经处于展开状态，防止 8 秒一次的后台刷新把展开状态重置
                    var isExpanded = document.getElementById('nw-hidden-features') && document.getElementById('nw-hidden-features').style.display === 'block';
                    var btnText = isExpanded ? (T['BTN_ADV_HIDE'] || 'Advanced Settings ▲') : (T['BTN_ADV_SHOW'] || 'Advanced Settings ▼');
                    var btnBg = isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.15)';
                    
                    // 蓝色底板高级设置触发按钮
                    var advToggleHtml = "<div style='text-align:center; margin-top:16px;'><span id='nw-toggle-adv' style='cursor:pointer; font-size:13.5px; color:rgba(255,255,255,0.9); background:" + btnBg + "; padding:5px 15px; border-radius:15px; transition:all 0.3s; user-select:none; display:inline-block; letter-spacing:0.5px;'>" + btnText + "</span></div>";

                    if (modeTextEl) {
                        modeTextEl.innerHTML = "<div style='font-size:17px; font-weight:600; margin-bottom:8px; color:#ffffff; font-family: monospace; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; max-width:100%; min-width:0;'><span style='white-space:nowrap; max-width:100%; min-width:0; overflow:hidden; text-overflow:ellipsis;'>" + sTitle + "</span>" + statusBadge + "</div>" + "<div style='font-size:15.5px; font-weight:bold; color:#ffffff; font-family:monospace; letter-spacing:0.5px; display:flex; flex-wrap:wrap; justify-content:center; line-height: 1.3; max-width:100%; min-width:0;'>" + sDetails + "</div>" + sDnsHtml + ipv6Html + devMgrBtn + extraInfo + advToggleHtml;
                        
                        // 异步检测网络连通性
                        if (statusBadge.indexOf('nw-inet-badge') !== -1) {
                            callCheckInternet().then(function(res) {
                                var el = document.getElementById('nw-inet-badge');
                                if (el) {
                                    if (res.status === 'ok') {
                                        el.innerHTML = "🌐";
                                        el.title = T['TXT_NET_OK'];
                                    } else {
                                        el.innerHTML = "❌";
                                        el.title = T['TXT_NET_FAIL'];
                                    }
                                }
                            });
                        }
                    }
                    
                }).catch(function() {});
            } catch(e) {}
        }

        // 智能备份与恢复事件绑定
        var btnSmartBackup = container.querySelector('#btn-smart-backup');
        var btnSmartRestore = container.querySelector('#btn-smart-restore');
        var fileSmartRestore = container.querySelector('#file-smart-restore');

        if (btnSmartBackup) {
            btnSmartBackup.addEventListener('click', function(e) {
                e.preventDefault();
                window._selectedBackupType = 'light';

                openModal({
                    title: '<div style="position:relative; display:flex; justify-content:center; align-items:center; width:100%;"><span id="btn-pop-close" style="position:absolute; right: 10px; font-size:35px; color:rgba(255,255,255,0.8); cursor:pointer; line-height:1; font-family:Arial,sans-serif; padding:0 5px;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'rgba(255,255,255,0.8)\'">×</span><span>' + T['M_BAK_SEL_TIT'] + '</span></div>',
                    msg: '<div id="nw-pop-container" style="text-align: left;">' +
                         '    <div style="display: flex; gap: 12px; margin-bottom: 15px;">' +
                         '        <div id="opt-type-light" style="flex: 1; text-align: center; padding: 12px; border: 2px solid #3b82f6; background: #eff6ff; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; color: #1d4ed8;">' + T['M_BAK_LIGHT_TIT'] + '<br><span style="font-size:14px; font-weight:normal; color:#3b82f6;">' + T['M_BAK_LIGHT_SUB'] + '</span></div>' +
                         '        <div id="opt-type-full" style="flex: 1; text-align: center; padding: 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; color: #475569;">' + T['M_BAK_FULL_TIT'] + '<br><span style="font-size:14px; font-weight:normal; color:#64748b;">' + T['M_BAK_FULL_SUB'] + '</span></div>' +
                         '    </div>' +
                         '    <div id="pop-backup-desc" style="font-size: 12.5px; color: #475569; line-height: 1.6; min-height: 60px; background:#f8fafc; padding:10px; border-radius:6px;">' + T['M_BAK_LIGHT_DESC'] + '</div>' +
                         '</div>',
                    okText: T['BTN_START_BAK'],
                    onOk: function() {
                        var bType = window._selectedBackupType;
                        
                        // 建立一个确保能执行真实备份
                        var performBackup = function() {
                            var hintText = bType === 'full' ? T['M_BAK_HINT_FULL'] : T['M_BAK_HINT_LIGHT'];
                            openModal({
                                title: T['M_BAK_GEN_TIT'],
                                msg: '<div style="text-align:center; padding:10px 0; color:#64748b;">' + T['M_BAK_GEN_MSG'] + '<br><br><span style="font-size:12px; color:#d97706;">' + hintText + '</span></div>',
                                spin: true
                            });

                            callSmartBackup(bType).then(function(res) {
                                if (res && res.url) {
                                    var isDone = false;
                                    var checkTimer = setInterval(function() {
                                        if (isDone) { clearInterval(checkTimer); return; }
                                        callCheckBackup().then(function(cRes) {
                                            // 判断running状态并动态生成终端机黑框
                                            if (cRes && cRes.status === 'running' && cRes.log) {
                                                // 前端显示“Downloading”的行
                                                var cleanLog = cRes.log.split('\n').filter(function(line) {
                                                    return line.indexOf('Downloading') !== -1;
                                                }).join('\n');

                                                // 显示Downloading的日志
                                                if (cleanLog) {
                                                    var logEl = document.getElementById('nw-backup-log');
                                                    if (!logEl) {
                                                        var modalMsg = document.querySelector('#nw-global-msg');
                                                        if (modalMsg) {
                                                            logEl = document.createElement('div');
                                                            logEl.id = 'nw-backup-log';
                                                            logEl.style.cssText = 'margin-top:18px; padding:12px; background:#0f172a; color:#10b981; font-family:monospace; font-size:12px; text-align:left; border-radius:8px; white-space:pre-wrap; word-break:break-all; max-height:110px; overflow-y:hidden; box-shadow:inset 0 2px 4px rgba(0,0,0,0.5); line-height:1.5; border:1px solid #1e293b;';
                                                            modalMsg.appendChild(logEl);
                                                        }
                                                    }
                                                    // 更新文字并自动滚动到底部
                                                    if (logEl && logEl.innerText !== cleanLog) {
                                                        logEl.innerText = cleanLog;
                                                        logEl.scrollTop = logEl.scrollHeight; 
                                                    }
                                                }
                                            }
                                            else if (cRes && cRes.status === 'done' && !isDone) {
                                                isDone = true;
                                                clearInterval(checkTimer);
                                                var a = document.createElement("a");
                                                a.href = res.url;
                                                a.download = res.filename || "NetWiz_SmartGhost.tar.gz";
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                openModal({ title: T['M_BAK_SUCC_TIT'], msg: T['M_BAK_SUCC_MSG'], hideCancel: true, okText: T['M_CLOSE'] });
                                            }
                                            // 截后端的异常退出状态 (OOM 或其他致命错误)
                                            else if (cRes && (cRes.status === 'error' || cRes.status === 'oom') && !isDone) {
                                                isDone = true;
                                                clearInterval(checkTimer);
                                                openModal({
                                                    title: T['M_OOM_TITLE'] || '⚠️ Backup Interrupted Warning',
                                                    msg: '<div style="color: #ef4444; font-size: 16px; font-weight: bold; margin-bottom: 10px;">' + 
                                                        (T['M_OOM_HEAD'] || 'Out of Memory (OOM Protection)!') + '</div>' + 
                                                        '<div style="color: #475569; font-size: 14px; line-height: 1.5;">' +
                                                        (T['M_OOM_DESC'] || 'The backup task has been canceled to prevent device crash.') + '</div>',
                                                    okText: T['M_I_KNOW'] || 'I Got It'
                                                });
                                            }
                                        }).catch(function() {});
                                    }, 2000);
                                } else {
                                    openModal({ title: T['M_BAK_FAIL_TIT'], msg: T['M_BAK_FAIL_MSG'], hideCancel: true, okText: T['M_CLOSE'] });
                                }
                            }).catch(function(err) {
                                openModal({ title: T['M_SYS_ERR'], msg: err, hideCancel: true, okText: T['M_CLOSE'] });
                            });
                        };

                        // 1. 显示前置扫描中动画
                        openModal({
                            title: T['M_BAK_GEN_TIT'],
                            msg: '<div style="text-align:center; padding:20px 0; color:#f59e0b; font-size:15px;">⏳ ' + (T['MSG_SCAN_PKGS'] || 'Scanning installed plugins...') + '</div>',
                            spin: true
                        });

                        // 2. 呼叫后端扫描
                        // 成功渲染逻辑抽离为独立函数，方便首次尝试与后续自动轮询复用
                        var handleMissingRes = function(res) {
                            var backupModal = document.getElementById('nw-global-modal');
                            if (backupModal) backupModal.style.display = 'none';

                            var missing = res.missing || [];
                            var provided = res.provided || [];
                            var official = res.official || [];

                            // --- 三色列表HTML渲染保持不变 ---
                            var missingHtml = '';
                            if (missing.length > 0) {
                                missingHtml += '<div style="color:#b91c1c; font-weight:bold; margin-bottom:5px; margin-top:10px;">❌ ' + (T['TXT_MISSING_PKGS'] || 'Missing packages:') + '</div>';
                                missingHtml += '<ul style="background:#fee2e2; padding:8px 15px; border-radius:6px; color:#b91c1c; font-family:monospace; margin-bottom:0; margin-top:0;">';
                                for (var i = 0; i < missing.length; i++) { missingHtml += '<li>' + missing[i] + '</li>'; }
                                missingHtml += '</ul>';
                            }
                            
                            var providedHtml = '';
                            if (provided.length > 0) {
                                providedHtml += '<div style="color:#059669; font-weight:bold; margin-bottom:5px; margin-top:10px;">✅ ' + (T['TXT_PROVIDED_PKGS'] || 'Manually placed in custom_pkgs:') + '</div>';
                                providedHtml += '<ul style="background:#d1fae5; padding:8px 15px; border-radius:6px; color:#059669; font-family:monospace; margin-bottom:0; margin-top:0;">';
                                for (var j = 0; j < provided.length; j++) { providedHtml += '<li>' + provided[j] + '</li>'; }
                                providedHtml += '</ul>';
                            }

                            var officialHtml = '';
                            if (official.length > 0) {
                                officialHtml += '<div style="color:#3b82f6; font-weight:bold; margin-bottom:5px; margin-top:10px;">☁️ ' + (T['TXT_OFFICIAL_PKGS'] || 'Auto-backup plugins:') + '</div>';
                                officialHtml += '<ul style="background:#eff6ff; padding:8px 15px; border-radius:6px; color:#3b82f6; font-family:monospace; margin-bottom:0; margin-top:0;">';
                                for (var k = 0; k < official.length; k++) { officialHtml += '<li>' + official[k] + '</li>'; }
                                officialHtml += '</ul>';
                            }

                            var totalCount = missing.length + provided.length + official.length;
                            var scrollWrapperStart = '<div style="max-height: 35vh; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 10px 10px 10px; background: #f8fafc; margin-bottom: 15px; margin-top: 10px; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.03);">';
                            var scrollWrapperEnd = '</div>';

                            if (missing.length > 0) {
                                var pkgListHtml = scrollWrapperStart + missingHtml + providedHtml + officialHtml + scrollWrapperEnd;
                                openModal({
                                    title: '⚠️ ' + (T['TIT_PKG_CHECK'] || 'Plugin Backup Status'),
                                    msg: '<div style="font-size:15px; color:#475569; text-align: left; padding: 0 7px;">' + 
                                         (T['MSG_CUSTOM_PKG_DESC'] || 'Please verify backup packages:') + 
                                         pkgListHtml + 
                                         '<span style="color:#ef4444; font-weight:bold;">' + 
                                         (T['MSG_CUSTOM_PKG_ACT'] || 'If you proceed, missing plugins WILL NOT be restored automatically!') + 
                                         '</span><br><br>' + 
                                         (T['MSG_CUSTOM_PKG_TIP'] || 'Tip: Manually place missing packages .ipk/.apk into the /etc/netwiz/custom_pkgs/ directory via SSH to ensure they are automatically reinstalled during future restorations.') + 
                                         '<br><br></div>',
                                    okText: '🚀 ' + (T['BTN_IGNORE_BAK'] || 'Ignore & Backup'),
                                    cancelText: T['BTN_CANCEL_RST'] || 'Cancel',
                                    isDanger: true,
                                    onOk: function() { performBackup(); }
                                });
                            } else if (totalCount > 0) {
                                var pkgListHtml = scrollWrapperStart + providedHtml + officialHtml + scrollWrapperEnd;
                                var mTitle = provided.length > 0 ? (T['TIT_CUSTOM_PKG_READY'] || 'Custom Plugins Ready') : (T['TIT_OFFICIAL_PKG_READY'] || 'Plugin Scan Complete');
                                var mDesc = provided.length > 0 ? (T['MSG_CUSTOM_PKG_READY_DESC'] || 'Great! Your custom plugins are safely stored and will be included in the backup capsule.') : (T['MSG_OFFICIAL_PKG_READY_DESC'] || 'All installed plugins are from the official repository and will be safely recorded.');

                                openModal({
                                    title: '✅ ' + mTitle,
                                    msg: '<div style="font-size:15px; color:#475569; text-align: left; padding: 0 7px;">' + mDesc + pkgListHtml + '</div>',
                                    okText: '📦 ' + (T['BTN_CONFIRM_BACKUP'] || 'Confirm Backup'),
                                    cancelText: T['BTN_CANCEL_RST'] || 'Cancel',
                                    onOk: function() { performBackup(); }
                                });
                            } else {
                                performBackup();
                            }
                        };

                        // 建立主动轮询流
                        var isPolling = false; // 轮询开关
                        
                        var doCheck = function() {
                            callCheckMissingPkgs().then(handleMissingRes).catch(function(err) {
                                var backupModal = document.getElementById('nw-global-modal');
                                if (backupModal) backupModal.style.display = 'none';
                                
                                isPolling = true; // 开启轮询状态
                                openModal({ 
                                    title: T['M_FIRST_SYNC_TITLE'], 
                                    msg: '<div style="font-size:15px; color:#f59e0b; margin-bottom:10px;"><b>' + T['M_FIRST_SYNC_SUB'] + '</b></div>' +
                                        '<div style="font-size:14px; color:#475569;">' + T['M_FIRST_SYNC_DESC'] + 
                                        '<br><br><span id="nw-sync-dots" style="color:#2563eb; font-weight:bold;">' + (T['TXT_GETTING'] || 'Getting...') + ' .</span></div>', 
                                    okText: T['M_SYNC_OK'],
                                    onOk: function() {
                                        isPolling = false; // 点击停止，彻底关闭后续的联机请求
                                    }
                                });

                                var dots = 1;
                                
                                // 上一个请求彻底结束（超时或被后端秒拒），等待3秒发送下一个
                                var pollNext = function() {
                                    if (!isPolling) return; // 如果被停止，立刻终止
                                    
                                    var dEl = document.getElementById('nw-sync-dots');
                                    if (dEl) {
                                        dots = (dots % 3) + 1;
                                        var dotStr = '';
                                        for(var i=0; i<dots; i++) dotStr += '.';
                                        // 拼装多语言的前缀和点动画
                                        var prefix = (T['TXT_GETTING'] || 'Getting...').replace(/\.+$/, '');
                                        dEl.innerHTML = prefix + ' ' + dotStr;
                                    }
                                    
                                    // 停顿3秒后再发送查询
                                    setTimeout(function() {
                                        if (!isPolling) return;
                                        callCheckMissingPkgs().then(function(retryRes) {
                                            isPolling = false; // 拿到结果
                                            handleMissingRes(retryRes); // 自动切换视窗
                                        }).catch(function(e) {
                                            // 后端正在下载中（回传exit 1），拒绝。进入下一个循环
                                            pollNext();
                                        });
                                    }, 3000);
                                };
                                
                                pollNext(); // 启动递归引擎
                            });
                        };
                        
                        doCheck(); // 启动主入口
                    }
                });

                var btnPopClose = document.getElementById('btn-pop-close');
                if (btnPopClose) {
                    btnPopClose.addEventListener('click', function() {
                        document.getElementById('nw-global-modal').style.display = 'none';
                    });
                }

                var optLight = document.getElementById('opt-type-light');
                var optFull = document.getElementById('opt-type-full');
                var popDesc = document.getElementById('pop-backup-desc');

                if (optLight && optFull && popDesc) {
                    optLight.addEventListener('click', function() {
                        window._selectedBackupType = 'light';
                        optLight.style.border = '2px solid #3b82f6';
                        optLight.style.background = '#eff6ff';
                        optLight.style.color = '#1d4ed8';
                        optFull.style.border = '1px solid #cbd5e1';
                        optFull.style.background = '#fff';
                        optFull.style.color = '#475569';
                        popDesc.innerHTML = T['M_BAK_LIGHT_DESC'];
                    });

                    optFull.addEventListener('click', function() {
                        window._selectedBackupType = 'full';
                        optFull.style.border = '2px solid #3b82f6';
                        optFull.style.background = '#eff6ff';
                        optFull.style.color = '#1d4ed8';
                        optLight.style.border = '1px solid #cbd5e1';
                        optLight.style.background = '#fff';
                        optLight.style.color = '#475569';
                        popDesc.innerHTML = T['M_BAK_FULL_DESC'];
                    });
                }
            });
        }

        if (btnSmartRestore && fileSmartRestore) {
            btnSmartRestore.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 架构信息在页面加载时抓取
                openModal({
                    title: '<div style="position:relative; display:flex; justify-content:center; align-items:center; width:100%;"><span id="btn-restore-close" style="position:absolute; right: 10px; font-size:35px; color:rgba(255,255,255,0.8); cursor:pointer; line-height:1; font-family:Arial,sans-serif; padding:0 5px;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'rgba(255,255,255,0.8)\'">×</span><span>' + T['M_RST_CONFIRM_TIT'] + '</span></div>',
                    msg: '<div style="text-align:left;">' + (T['M_RST_CONFIRM_MSG'] || '') +
                         '    <label style="display:flex; align-items:center; justify-content:center; cursor:pointer; background:#f8fafc; padding:12px; border-radius:8px; border:1px dashed #cbd5e1; margin:0;">' +
                         '        <input type="checkbox" id="chk-regret-pill" checked style="-webkit-appearance:checkbox !important; appearance:checkbox !important; opacity:1 !important; visibility:visible !important; display:block !important; margin:0 5px 2px 0 !important; width:16px !important; height:16px !important; min-width:16px !important; flex-shrink:0 !important; position:static !important; top:auto !important; transform:none !important;">' +
                         '        <span style="color:#3b82f6; font-weight:bold; font-size:13.5px; line-height:1.4; text-align:left; display:block;">' + (T['M_RST_REGRET_PILL'] || 'Auto-download current state backup before restore (Regret Pill)') + '</span>' +
                         '    </label>' +
                         '</div>',
                    okText: T['BTN_CONFIRM_SEL'],
                    onOk: function() {
                        var chk = document.getElementById('chk-regret-pill');
                        window._wantRegretPill = chk ? chk.checked : true;
                        fileSmartRestore.click(); 
                    }
                });

                var btnRestoreClose = document.getElementById('btn-restore-close');
                if (btnRestoreClose) {
                    btnRestoreClose.addEventListener('click', function() {
                        document.getElementById('nw-global-modal').style.display = 'none';
                    });
                }
            });

            fileSmartRestore.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (!file) return;
                
                var startProcess = function() {
                    var execRestore = function() {
                    openModal({
                        title: T['M_RST_NATIVE_TIT'],
                        msg: '<div style="text-align:center; padding:10px 0; color:#64748b;">' + T['MSG_RESTORE_UPLOADING'] + '<br><div id="nw-upload-progress" style="font-size:24px; color:#3b82f6; font-weight:bold; margin-top:10px; font-family:monospace;">0%</div></div>',
                        spin: true 
                    });
                    
                    var executeRebootProbe = function(newIp) {
                        var rebootSec = 0;
                        var h = window.location.hostname;
                        var pEl = document.getElementById('nw-upload-progress');
                        var isRedirecting = false;
                        
                        var isOffline = false;
                        var offlineCount = 0;

                        var checkIp = function(targetIp, checkMode) {
                            var controller = new AbortController();
                            var tid = setTimeout(function() { controller.abort(); }, 1500);
                            
                            fetch('http://' + targetIp + '/cgi-bin/luci/?_t=' + Date.now(), { 
                                method: 'GET', signal: controller.signal, mode: 'no-cors' 
                            })
                            .then(function() {
                                clearTimeout(tid);
                                if (checkMode === 'wait_offline') {
                                    offlineCount = 0;
                                } else if (checkMode === 'wait_online' && !isRedirecting) {
                                    isRedirecting = true;
                                    var doJump = function() { window.location.href = 'http://' + targetIp + '/cgi-bin/luci/'; };
                                    // 发送跨重启拆弹信号，成功或失败后跳转
                                    callNetDefuse().then(doJump).catch(doJump);
                                }
                            }).catch(function() {
                                clearTimeout(tid);
                                if (checkMode === 'wait_offline') {
                                    offlineCount++;
                                    if (offlineCount >= 2) isOffline = true;
                                }
                            });
                        };

                        var rebootTimer = setInterval(function() {
                            if (isRedirecting) { clearInterval(rebootTimer); return; }
                            rebootSec += 2;
                            
                            if (!isOffline) {
                                if (pEl) pEl.innerHTML = '<span style="color:#f59e0b; font-size:16px;">⏳ ' + (T['MSG_WAIT_OFFLINE'] || 'Waiting for device to disconnect...') + ' (' + rebootSec + 's)</span>';
                                checkIp(h, 'wait_offline');
                                if (rebootSec > 60) isOffline = true;
                            } else {
                                if (pEl) pEl.innerHTML = '<span style="color:#3b82f6; font-size:16px;">🔄 ' + (T['MSG_REBOOTING'] || 'System is rebooting...') + ' (' + rebootSec + 's / 300s)</span>';
                                checkIp(h, 'wait_online');
                                if (newIp && newIp !== h && newIp !== 'undefined' && newIp !== '') checkIp(newIp, 'wait_online');
                                
                                if (rebootSec > 300) {
                                    isRedirecting = true;
                                    clearInterval(rebootTimer);
                                    if (pEl) pEl.innerHTML = '<span style="color:#f59e0b; font-size:16px;">⚠️ ' + (T['MSG_MANUAL_VISIT'] || 'If IP changed, please update PC IP and visit manually.') + '</span>';
                                }
                            }
                        }, 2000);
                    };
                    
                    var fd = new FormData();
                        var sid = (typeof L !== 'undefined' && L.env && L.env.sessionid) ? L.env.sessionid : "";
                        if (!sid) {
                            var match = document.cookie.match(/sysauth_http=([^;]+)/) || document.cookie.match(/sysauth=([^;]+)/);
                            if (match) sid = match[1];
                        }
                        
                        fd.append("sessionid", sid);
                        fd.append("filename", "/tmp/NetWiz_SmartGhost.tar.gz"); 
                        fd.append("file", file); 
                        
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', '/cgi-bin/cgi-upload', true);
                        
                        xhr.upload.onprogress = function(evt) {
                            if (evt.lengthComputable) {
                                var percent = Math.floor((evt.loaded / evt.total) * 100);
                                var pEl = document.getElementById('nw-upload-progress');
                                if (pEl) pEl.innerText = percent + '%';
                            }
                        };
                        
                        xhr.onload = function() {
                            if (xhr.status === 200) {
                                var realPath = "/tmp/NetWiz_SmartGhost.tar.gz";
                                try { 
                                    var res = JSON.parse(xhr.responseText); 
                                    if (res.filepath || res.file || res.path) realPath = res.filepath || res.file || res.path;
                                } catch(e) {}
                                
                                var pEl = document.getElementById('nw-upload-progress');
                                if (pEl) pEl.innerHTML = '<span style="color:#10b981; font-size:16px;">' + T['M_RST_DELIVERED'] + '</span>';
                                
                                callSmartRestoreExec(realPath).then(function() {
                                    var errCount = 0;
                                    var futureIp = ''; 
                                    var checkTimer = setInterval(function() {
                                        callCheckRestoreStatus().then(function(res) {
                                            errCount = 0;
                                            
                                            // 安全解包。处理 LuCI RPC 底层可能返回数组 [0, {data}] 的情况
                                            var data = (Array.isArray(res) && res.length > 1) ? res[1] : (res || {});
                                            
                                            var s = data.status;
                                            var code = data.code;
                                            var arg1 = data.arg1 || '';
                                            var arg2 = data.arg2 || '';
                                            
                                            // 拦截空数据，防止后端刚启动没来得及写文件时，前端渲染出 undefined
                                            if (!s || !code) return;
                                            
                                            var m = T[code] || code;
                                            
                                            // 占位符替换
                                            if (code === 'MSG_RST_OOM_INTERCEPT') {
                                                m = m.replace('{u}', arg1).replace('{a}', arg2);
                                            } else if (code === 'MSG_RST_DONE') {
                                                if (arg1) m = m.replace('{arg1}', arg1);
                                            }
                                            
                                            if (!m || m === 'undefined') m = T['MSG_RST_WAIT'];
                                            
                                            if (s === 'running') {
                                                if (pEl) pEl.innerHTML = '<span style="color:#3b82f6; font-size:16px;">🔄 ' + m + '</span>';
                                            } else if (s === 'error') {
                                                clearInterval(checkTimer);
                                                fileSmartRestore.value = '';
                                                openModal({ 
                                                    title: T['M_RST_BLOCKED_TIT'], 
                                                    msg: '<div style="color:#ef4444; font-weight:bold; margin-bottom:10px;">' + m + '</div><div style="font-size:13.5px; color:#64748b;">' + T['M_RST_BLOCKED_MSG'] + '</div>', 
                                                    hideCancel: true, 
                                                    okText: T['M_CLOSE'] 
                                                });
                                            } else if (s === 'done') {
                                                clearInterval(checkTimer);
                                                if (pEl) pEl.innerHTML = '<span style="color:#10b981; font-size:18px;">🎉 ' + m + '</span>';
                                                futureIp = arg1; 
                                                executeRebootProbe(futureIp); 
                                            }
                                        }).catch(function() {
                                            errCount++;
                                            if (errCount >= 3) {
                                                clearInterval(checkTimer);
                                                if (pEl) pEl.innerHTML = '<span style="color:#10b981; font-size:18px;">🎉 ' + (T['MSG_RST_DONE'] || 'Restore thoroughly complete! Router will auto-reboot!') + '</span>';
                                                executeRebootProbe(futureIp); 
                                            }
                                        });
                                    }, 2500);
                                }).catch(function() {
                                    executeRebootProbe('');
                                });
                            } else {
                                fileSmartRestore.value = '';
                                openModal({ title: T['M_RST_TRANS_FAIL'], msg: T['M_RST_TRANS_REJECT'] + xhr.status, hideCancel: true, okText: T['M_CLOSE'] });
                            }
                        };
                        
                        xhr.onerror = function() {
                            fileSmartRestore.value = '';
                            openModal({ title: T['M_RST_NET_ERR'], msg: T['M_RST_NET_INTR'], hideCancel: true, okText: T['M_CLOSE'] });
                        };
                        
                        xhr.send(fd);
                    };

                    if (window._wantRegretPill) {
                        openModal({
                            title: T['M_RST_PILL_TIT'],
                            msg: '<div style="text-align:center; padding:10px 0; color:#64748b;">' + T['M_RST_PILL_MSG'] + '</div>',
                            spin: true
                        });
                        
                        callSmartBackup('light').then(function(res) {
                            if (res && res.url) {
                                var isRegretDone = false;
                                var checkTimer = setInterval(function() {
                                    if (isRegretDone) { clearInterval(checkTimer); return; }
                                    callCheckBackup().then(function(cRes) {
                                        // 判断running状态并动态生成终端机黑框
                                        if (cRes && cRes.status === 'running' && cRes.log) {
                                            // 前端显示“Downloading”的行
                                            var cleanLog = cRes.log.split('\n').filter(function(line) {
                                                return line.indexOf('Downloading') !== -1;
                                            }).join('\n');

                                            // 显示Downloading的日志
                                            if (cleanLog) {
                                                var logEl = document.getElementById('nw-backup-log');
                                                if (!logEl) {
                                                    var modalMsg = document.querySelector('#nw-global-msg');
                                                    if (modalMsg) {
                                                        logEl = document.createElement('div');
                                                        logEl.id = 'nw-backup-log';
                                                        logEl.style.cssText = 'margin-top:18px; padding:12px; background:#0f172a; color:#10b981; font-family:monospace; font-size:12px; text-align:left; border-radius:8px; white-space:pre-wrap; word-break:break-all; max-height:110px; overflow-y:hidden; box-shadow:inset 0 2px 4px rgba(0,0,0,0.5); line-height:1.5; border:1px solid #1e293b;';
                                                        modalMsg.appendChild(logEl);
                                                    }
                                                }
                                                // 更新文字并自动滚动到底部
                                                if (logEl && logEl.innerText !== cleanLog) {
                                                    logEl.innerText = cleanLog;
                                                    logEl.scrollTop = logEl.scrollHeight; 
                                                }
                                            }
                                        }
                                        else if (cRes && cRes.status === 'done' && !isDone) {
                                            isDone = true;
                                            clearInterval(checkTimer);
                                            var a = document.createElement("a");
                                            a.href = res.url;
                                            a.download = res.filename || "NetWiz_SmartGhost.tar.gz";
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            openModal({ title: T['M_BAK_SUCC_TIT'], msg: T['M_BAK_SUCC_MSG'], hideCancel: true, okText: T['M_CLOSE'] });
                                        }
                                        else if (cRes && (cRes.status === 'error' || cRes.status === 'oom') && !isDone) {
                                            isDone = true;
                                            clearInterval(checkTimer);
                                            openModal({
                                                title: T['M_OOM_TITLE'] || '⚠️ Backup Interrupted Warning',
                                                msg: '<div style="color: #ef4444; font-size: 16px; font-weight: bold; margin-bottom: 10px;">' + (T['M_OOM_HEAD'] || 'Out of Memory!') + '</div>',
                                                okText: T['M_I_KNOW'] || 'I Got It'
                                            });
                                        }
                                    }).catch(function() {});
                                }, 2000);
                            } else {
                                execRestore();
                            }
                        }).catch(function() {
                            execRestore();
                        });
                    } else {
                        execRestore();
                    }
                };

                // ==========================================
                // “智能指纹校验 + 容量探测”逻辑
                // ==========================================
                
                var fileName = file.name;
                var lowerFileName = fileName.toLowerCase(); // 统一转为小写
                var curPkg = window.nwCurrentPkg || 'ipk';
                var curArch = window.nwCurrentArch || '';
                
                var isApkBackup = lowerFileName.indexOf('_apk_') !== -1;
                var isIpkBackup = lowerFileName.indexOf('_ipk_') !== -1;

                // 核心推进函数
                var doNext = function() {
                    var sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                    openModal({ 
                        title: T['M_RST_PROBE_TIT'], 
                        msg: '<div style="text-align:center; padding:15px 0; color:#64748b;">' + T['M_RST_PROBE_MSG'] + '</div>', 
                        spin: true 
                    });
                    callCheckStorage().then(function(res) {
                        var availMB = res.tmp_avail_mb || 60;
                        if (sizeMB > (availMB * 0.85)) {
                            openModal({
                                title: T['M_RST_OOM_TIT'],
                                msg: '<div style="text-align:left; font-size:14px; color:#475569; line-height:1.6;">' + T['M_RST_OOM_MSG'].replace('{size}', sizeMB).replace('{avail}', availMB) + '</div>',
                                hideCancel: true, okText: T['BTN_CANCEL_RST'], isDanger: true,
                                onOk: function() {
                                    fileSmartRestore.value = '';
                                    document.getElementById('nw-global-modal').style.display = 'none';
                                }
                            });
                        } else {
                            startProcess();
                        }
                    }).catch(function() { startProcess(); });
                };

                // 前端 Fail-Fast 拦截防线
                if (lowerFileName.indexOf('netwiz_') !== -1) { // 改用小写匹配
                    
                    // 1. 检查包管理器是否冲突 (apk vs ipk)
                    if ((curPkg === 'apk' && isIpkBackup) || (curPkg === 'ipk' && isApkBackup)) {
                        var errMsg = (curPkg === 'apk') ? (T['MSG_PKG_ERR_APK'] || '') : (T['MSG_PKG_ERR_OPKG'] || '');
                        openModal({
                            title: '🚨 ' + (T['TIT_PKG_CONFLICT'] || 'Package Manager Conflict'),
                            msg: '<div style="color:#ef4444; font-size:15px; font-weight:bold; margin-bottom:10px;">' + errMsg + '</div>' + 
                                 '<div style="padding:10px; background:#fef2f2; color:#991b1b; border-radius:6px; font-size:14px; line-height:1.5;">' + 
                                 (T['MSG_RESTORE_ARCH_TIP'] || 'Safety Lock: Cross-package manager restoration is strictly blocked to prevent network crash and bricking.') + '</div>',
                            okText: T['M_I_KNOW'] || 'I Got It',
                            hideCancel: true, // 隐藏取消按钮
                            isDanger: true,
                            onOk: function() {
                                fileSmartRestore.value = ''; // 清空文件选择
                                document.getElementById('nw-global-modal').style.display = 'none'; // 直接关闭弹窗，不执行 doNext()
                            }
                        });
                        return; // 彻底死锁拦截
                    }

                    // 2. 检查 CPU 架构是否冲突
                    if (curArch && lowerFileName.indexOf(curArch.toLowerCase()) === -1) { // 架构检查转为小写对比
                        var warnMsg1 = T['MSG_ARCH_WARN_1'] ? T['MSG_ARCH_WARN_1'].replace('{arch}', curArch) : 'Architecture mismatch!';
                        var warnMsg2 = T['MSG_ARCH_WARN_2'] || 'If you manually renamed this file, ignore this.';
                        openModal({
                            title: '⚠️ ' + (T['TIT_ARCH_WARN'] || 'Architecture Warning'),
                            msg: '<div style="color:#b45309; font-size:15px; font-weight:bold;">' + warnMsg1 + '</div><br><div style="color:#475569; font-size:14px;">' + warnMsg2 + '</div>',
                            okText: T['BTN_WARN_CONTINUE'] || 'Continue',
                            cancelText: T['BTN_CANCEL_RST'] || 'Cancel',
                            isDanger: true,
                            onOk: function() {
                                doNext(); // 继续
                            }
                        });
                        return; // 拦截，等待用户选择
                    }
                }

                // ✅ 架构完全一致，或者无法识别文件名，静默执行下一步
                doNext(); 
            });
        }

        updateStatusDisplay(false);
        setInterval(function() { if (step1.style.display !== 'none' && container.querySelector('#nw-global-modal').style.display === 'none') updateStatusDisplay(true); }, 5000);

        function calculateNetmask(ip) { if (!ip) return '255.255.255.0'; var b = parseInt(ip.split('.')[0], 10); if (b >= 1 && b <= 126) return '255.0.0.0'; if (b >= 128 && b <= 191) return '255.255.0.0'; return '255.255.255.0'; }
        function isValidIP(ip) { if (!ip) return false; var p = ip.split('.'); if (p.length !== 4) return false; for (var i = 0; i < 4; i++) { var n = parseInt(p[i], 10); if (isNaN(n) || n < 0 || n > 255 || String(n) !== p[i]) return false; } if (p[0] === '0' || p[0] === '127') return false; var l = parseInt(p[3], 10); return (l !== 0 && l !== 255); }
        // 主路由模式 - 向上递增避让算法 (1.1 -> 2.1 -> 3.1)
        function getSafeRouterIp(wanIp) {
            if (!wanIp) return '192.168.2.1';
            var wanSubnet = parseInt(wanIp.split('.')[2], 10);
            var safeSubnet = 1; // 默认从 192.168.1.1 开始试探
            while (safeSubnet === wanSubnet || safeSubnet === 0) {
                safeSubnet++;
                if (safeSubnet > 250) break; // 极值保护
            }
            return '192.168.' + safeSubnet + '.1';
        }

        // 旁路由/AP模式 - 向下递减避让算法 (.254 -> .253)
        function getSafeApIp(gatewayIp) {
            if (!gatewayIp) return '';
            var parts = gatewayIp.split('.');
            var prefix = parts[0] + '.' + parts[1] + '.' + parts[2];
            var gwTail = parseInt(parts[3], 10);
            
            var knownTails = [gwTail]; 
            if (window._liveWanIp && window._liveWanIp.indexOf(prefix) === 0) {
                knownTails.push(parseInt(window._liveWanIp.split('.')[3], 10));
            }

            if (window._nwConflictBlacklist) {
                knownTails = knownTails.concat(window._nwConflictBlacklist);
            }

            var safeTail = 254; 
            while (knownTails.indexOf(safeTail) !== -1 && safeTail > 200) {
                safeTail--;
            }
            return prefix + '.' + safeTail;
        }
        function isSameSubnet(ip1, ip2) { if (!ip1 || !ip2) return false; var p1 = ip1.split('.'), p2 = ip2.split('.'); return (p1.length === 4 && p2.length === 4 && p1[0] === p2[0] && p1[1] === p2[1] && p1[2] === p2[2]); }
        
        function openModal(o) { 
            var m = container.querySelector('#nw-global-modal'); 
            container.querySelector('#nw-global-title').innerHTML = o.title || ''; 
            container.querySelector('#nw-global-msg').innerHTML = o.msg || ''; 
            container.querySelector('#nw-global-spinner').style.display = o.spin ? 'block' : 'none'; 
            var w = container.querySelector('#nw-global-btn-wrap'), ok = container.querySelector('#nw-global-btn-ok'), can = container.querySelector('#nw-global-btn-cancel'); 
            w.style.display = (o.okText || o.cancelText) ? 'flex' : 'none'; 
            if (o.okText) { ok.style.display = 'block'; ok.innerText = o.okText; ok.className = 'nw-u-btn ' + (o.isDanger ? 'nw-u-btn-red' : 'nw-u-btn-blue'); ok.onclick = function() { if (o.onOk) o.onOk(); else m.style.display = 'none'; }; } else ok.style.display = 'none'; 
            if (o.cancelText) { can.style.display = 'block'; can.innerText = o.cancelText; can.onclick = function() { if (o.onCancel) o.onCancel(); else m.style.display = 'none'; }; } else can.style.display = 'none'; 
            m.style.display = 'flex'; 
        }
        
        function returnToStep1() { container.querySelector('#nw-global-modal').style.display = 'none'; step3.style.display = 'none'; step2.style.display = 'none'; step1.style.display = 'block'; }
        
        container.querySelectorAll('.nw-adv-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var panel = this.nextElementSibling;
                if (panel.style.display === 'none') {
                    panel.style.display = 'block';
                    this.innerHTML = '▲ ' + T['LBL_ADVANCED_CLOSE'];
                } else {
                    panel.style.display = 'none';
                    this.innerHTML = '▼ ' + T['LBL_ADVANCED'];
                }
            });
        });

        var modeWarnHandler = function(e) {
            var el = e.target;
            if (el.value !== 'auto') {
                openModal({
                    title: T['M_MODE_WARN_TIT'],
                    msg: T['M_MODE_WARN_MSG'],
                    cancelText: T['M_CLOSE'],
                    okText: T['M_WARN_BTN'],
                    isDanger: true,
                    onCancel: function() { el.value = 'auto'; container.querySelector('#nw-global-modal').style.display = 'none'; },
                    onOk: function() { container.querySelector('#nw-global-modal').style.display = 'none'; }
                });
            }
        };
        container.querySelector('#wifi-2g-mode').addEventListener('change', modeWarnHandler);
        container.querySelector('#wifi-5g-mode').addEventListener('change', modeWarnHandler);

        container.querySelectorAll('input[name="router_type"]').forEach(function(r) { r.addEventListener('change', function() { container.querySelector('#router-static-fields').style.display = (this.value === 'static') ? 'block' : 'none'; }); });
        
        var bypassToggle = container.querySelector('#lan-bypass-toggle');
        bypassToggle.addEventListener('change', function() { container.querySelector('#lan-bypass-warning').style.display = this.checked ? 'block' : 'none'; container.querySelector('#lan-main-warning').style.display = this.checked ? 'none' : 'block'; });
        // ===== 一键探测并分配 IP 逻辑 =====
        var btnAutoIp = container.querySelector('#btn-auto-ip');
        if (btnAutoIp) {
            btnAutoIp.addEventListener('click', function() {
                // 1. 拦截一：检查是否开启了旁路由模式
                var bypassTog = document.getElementById('lan-bypass-toggle');
                if (bypassTog && !bypassTog.checked) {
                    openModal({ 
                        title: '⚠️ ' + (T['M_DETECT_OP_INV_TIT'] || 'Invalid Operation'), 
                        msg: T['M_DETECT_OP_INV_MSG'] || 'Gateway must be blank in Main Router mode.', 
                        hideCancel: true, 
                        okText: T['M_CLOSE'] || 'Close' 
                    });
                    return;
                }

                var wProto = 'dhcp';
                try { wProto = uci.get('network', 'wan', 'proto'); } catch(e) {}
                var currentUrlIp = window.location.hostname;
                var gw = window._realUpstreamGw; 

                // 2. 拦截二：检查是否为 PPPoE 拨号（防止桥接公网基站）
                if (wProto === 'pppoe') {
                    var pppoeMsg = (T['M_DETECT_PPPOE_MSG'] || '').replace('{gw}', gw || '');
                    openModal({ 
                        title: '⚠️ ' + (T['M_DETECT_PPPOE_TIT'] || 'Critical Intercept'), 
                        msg: pppoeMsg, 
                        hideCancel: true, 
                        okText: T['M_CLOSE'] || 'Close' 
                    });
                    return;
                }

                // 3. 正常探测逻辑
                if (!gw || gw === T['TXT_GETTING'] || gw === T['TXT_NOT_SET']) {
                    gw = (currentUrlIp.indexOf('.') > -1 ? currentUrlIp.substring(0, currentUrlIp.lastIndexOf('.') + 1) + '1' : ''); 
                }
                
                if (gw && gw.indexOf('.') > -1) {
                    var suggestedIp = getSafeApIp(gw); 
                    
                    var inputGw = document.getElementById('lan-gw');
                    var inputIp = document.getElementById('lan-ip');
                    if (inputGw) inputGw.value = gw;
                    if (inputIp) inputIp.value = suggestedIp;
                    
                    openModal({ 
                        title: '✅ ' + (T['BTN_AUTO_DETECT'] || 'Detection Success'), 
                        msg: '<div style="font-size:15px; color:#475569; margin-bottom:15px;">' + (T['MSG_DETECT_SUCC'] || 'Upstream subnet detected') + '</div>' + 
                             '<div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:left;">' + 
                             (T['LBL_LAN_IP'] || 'IP') + ': <b id="nw-suggested-ip-disp" style="color:#3b82f6;">' + suggestedIp + '</b><br>' + 
                             (T['LBL_LAN_GW'] || 'Gateway') + ': <b style="color:#10b981;">' + gw + '</b></div>', 
                        hideCancel: true, 
                        okText: T['M_CLOSE'] || 'Close' 
                    });

                    var checkIpAsync = function(targetIp, targetGw) {
                        callCheckIpConflict(targetIp).then(function(res) {
                            if (res.status === 'conflict') {
                                if (!window._nwConflictBlacklist) window._nwConflictBlacklist = [];
                                window._nwConflictBlacklist.push(parseInt(targetIp.split('.')[3], 10));

                                var newSafeIp = getSafeApIp(targetGw);

                                openModal({
                                    title: '⚠️ ' + (T['TIT_IP_CONFLICT'] || 'IP Conflict Warning'),
                                    msg: '<div style="color:#ef4444; font-size:15px; margin-bottom:10px;"><b>' + targetIp + '</b> ' + (T['MSG_IP_IN_USE'] || 'is already used by another device!') + '</div>' + 
                                         '<div style="color:#475569; font-size:14px;">' + (T['MSG_SUGGEST_FIX'] || 'We strongly recommend changing it to avoid network crashes.') + '</div>',
                                    okText: '🚀 ' + (T['BTN_FIX_IP'] || 'Fix to') + ' ' + newSafeIp,
                                    cancelText: T['M_CANCEL'] || 'Ignore',
                                    isDanger: true,
                                    onOk: function() {
                                        if (inputIp) inputIp.value = newSafeIp;
                                        checkIpAsync(newSafeIp, targetGw);
                                    }
                                });
                            }
                        });
                    };
                    
                    // 发射背景探针
                    checkIpAsync(suggestedIp, gw);
                } else {
                    openModal({ 
                        title: '❌ ' + (T['M_SYS_ERR'] || 'failed'), 
                        msg: T['MSG_DETECT_FAIL'] || 'Detection failed', 
                        hideCancel: true, 
                        okText: T['M_CLOSE'] || 'Close' 
                    });
                }
            });
        }
        // ==================================
        
        var smartToggle = container.querySelector('#wifi-smart-toggle');
        var legacyToggle = container.querySelector('#legacy-b-toggle');
        var en2g = container.querySelector('#wifi-2g-en');
        var en5g = container.querySelector('#wifi-5g-en');

        // ===== 动态刷新漫游状态徽章 =====
        var updateRoamBadge = function(togId) {
            var tog = container.querySelector(togId);
            if (!tog) return;
            var keyId = togId.replace('-roaming', '-key'); 
            var pwdInput = container.querySelector(keyId);
            var pwdRow = pwdInput ? pwdInput.closest('.nw-value') : null;

            if (pwdRow) {
                var statRow = pwdRow.nextElementSibling;
                // 如果没有框，创建一个
                if (!statRow || !statRow.classList.contains('nw-roam-status-row')) {
                    statRow = document.createElement('div');
                    statRow.className = 'nw-roam-status-row';
                    statRow.style.cssText = 'margin-top: 5px; margin-bottom: 15px; ';
                    pwdRow.parentNode.insertBefore(statRow, pwdRow.nextSibling);
                }

                if (tog.checked) {
                    var isDirty = tog.classList.contains('is-dirty');
                    if (isDirty) {
                        statRow.innerHTML = "<span title='" + (T['DESC_ROAM_DIRTY']||'') + "' style='display:inline-flex; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.15); color:#10b981; border: 1px solid #10b981; font-size:14px; padding:6px 10px; border-radius:8px; font-family:sans-serif; cursor:pointer; font-weight:bold; white-space:nowrap; transition:all 0.25s ease; margin:0 auto;'>" + (T['TXT_ROAMING_ON']||'Roaming Enabled') + "<b style='display:inline-flex; align-items:center; justify-content:center; background:#ef4444; color:#ffffff; width:18px; height:18px; border-radius:50%; font-size:14px; font-family:Arial,sans-serif; font-weight:900; margin-left:6px; line-height:1;'>!</b> <span style='font-size:14px; font-weight:bold; color:#ef4444; margin-left:5px; text-decoration:underline;'>" + (T['TXT_CLICK_FIX']||'Click to Fix') + "</span></span>";
                    } else {
                        statRow.innerHTML = "<span style='display:inline-flex; align-items:center; justify-content:center; background:rgba(16, 185, 129, 0.15); color:#10b981; border: 1px solid #10b981; font-size:14px; padding:6px 16px; border-radius:8px; font-family:sans-serif; font-weight:bold; white-space:nowrap; cursor:pointer; transition:all 0.25s ease; margin:0 auto;'>" + (T['TXT_ROAMING_ON']||'Roaming Enabled') + "</span>";
                    }

                    var badgeSpan = statRow.querySelector('span');
                    badgeSpan.onmouseover = function() { this.style.transform = 'translateY(-2px)'; this.style.boxShadow = '0 4px 12px rgba(16,185,129,0.25)'; };
                    badgeSpan.onmouseout = function() { this.style.transform = 'none'; this.style.boxShadow = 'none'; };
                    
                    badgeSpan.onclick = function(e) {
                        e.stopPropagation();
                        if (isDirty) alert(T['DESC_ROAM_DIRTY']);
                        var advPanel = tog.closest('.nw-adv-panel');
                        var advBtn = advPanel ? advPanel.previousElementSibling : null;
                        if (advPanel && advPanel.style.display === 'none' && advBtn) advBtn.click();
                        setTimeout(function() {
                            tog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            var targetRow = tog.closest('div'); 
                            if (targetRow) {
                                var oldBg = targetRow.style.backgroundColor || 'transparent';
                                targetRow.style.transition = 'background-color 0.4s ease';
                                targetRow.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                                targetRow.style.borderRadius = '8px';
                                setTimeout(function() {
                                    targetRow.style.backgroundColor = oldBg;
                                    setTimeout(function() { targetRow.style.transition = ''; }, 400);
                                }, 800); 
                            }
                        }, 80); 
                    };
                    statRow.style.display = 'block'; // 显示徽章
                } else {
                    statRow.innerHTML = "";
                    statRow.style.display = 'none'; // 彻底隐藏徽章
                }
            }
        };
        // ==========================================

        // ===== 密码与加密方式双向联动 =====
        var syncEncryption = function(keyInputId, encSelectId) {
            var keyEl = container.querySelector(keyInputId);
            var encEl = container.querySelector(encSelectId);
            if (keyEl && encEl) {
                // 1. 密码框输入 -> 影响下拉框
                keyEl.addEventListener('input', function() {
                    if (this.value.length > 0 && encEl.value === 'none') {
                        encEl.value = 'psk2+ccmp';
                    } else if (this.value.length === 0 && encEl.value !== 'none') {
                        encEl.value = 'none'; 
                    }
                });
                // 2. 下拉框选择 -> 影响密码框
                encEl.addEventListener('change', function() {
                    if (this.value === 'none') {
                        keyEl.value = ''; // 手动选了无密码，清空密码框，防止数据残留
                    }
                });
            }
        };
        
        // 绑定三个面板的密码输入框和加密下拉框
        syncEncryption('#wifi-smart-key', '#wifi-smart-enc');
        syncEncryption('#wifi-2g-key', '#wifi-2g-enc');
        syncEncryption('#wifi-5g-key', '#wifi-5g-enc');
        // ===== 结束 =====

        // 联动与自动切换标签页
        en2g.addEventListener('change', function() { 
            // 2.4G 任何时候开启或关闭，都强制关闭漫游（保障老旧智能家居兼容性）
            var r2 = container.querySelector('#wifi-2g-roaming');
            if (r2) { r2.checked = false; r2.dispatchEvent(new Event('change')); }

            // Tab 跳转：开启时留在本页，关闭时自动跳到其他开启的频段
            if (this.checked) {
                container.querySelector('#tab-2g').click(); 
            } else {
                var en5g2El = container.querySelector('#wifi-5g2-en');
                if (en5g.checked) container.querySelector('#tab-5g').click();
                else if (en5g2El && en5g2El.checked) { var t = container.querySelector('#tab-5g2'); if (t) t.click(); }
                else container.querySelector('#tab-2g').click();
            }
            
            if (this.checked && window._isSingleChip) {
                en5g.checked = false; 
                var s2El = container.querySelector('#wifi-2g-ssid');
                var s5 = container.querySelector('#wifi-5g-ssid').value;
                // 不仅为空时推断，名字一样，加后缀拆分
                if ((!s2El.value || s2El.value === s5) && s5) {
                    s2El.value = smartConvertSsid(s5, '2g');
                    if (!container.querySelector('#wifi-2g-key').value) container.querySelector('#wifi-2g-key').value = container.querySelector('#wifi-5g-key').value;
                    container.querySelector('#wifi-2g-enc').value = container.querySelector('#wifi-5g-enc').value;
                }
            }
        });
        
        en5g.addEventListener('change', function() { 
            // 5G 开启时自动开启漫游，关闭时联动关闭漫游
            var r5 = container.querySelector('#wifi-5g-roaming');
            if (r5) { r5.checked = this.checked; r5.dispatchEvent(new Event('change')); }

            // Tab 跳转
            if (this.checked) {
                container.querySelector('#tab-5g').click(); 
            } else {
                var en5g2El = container.querySelector('#wifi-5g2-en');
                if (en2g.checked) container.querySelector('#tab-2g').click();
                else if (en5g2El && en5g2El.checked) { var t = container.querySelector('#tab-5g2'); if (t) t.click(); }
                else container.querySelector('#tab-5g').click();
            }
            
            if (this.checked && window._isSingleChip) {
                en2g.checked = false; 
                var s5El = container.querySelector('#wifi-5g-ssid');
                var s2 = container.querySelector('#wifi-2g-ssid').value;
                if ((!s5El.value || cleanSsidSuffix(s5El.value) === cleanSsidSuffix(s2)) && s2) {
                    s5El.value = smartConvertSsid(s2, '5g');
                    if (!container.querySelector('#wifi-5g-key').value) container.querySelector('#wifi-5g-key').value = container.querySelector('#wifi-2g-key').value;
                    container.querySelector('#wifi-5g-enc').value = container.querySelector('#wifi-2g-enc').value;
                }
            }
            
            // 开启 5G 时，赋上wifi-5g2-ssid 的值
            if (this.checked && !window._isSingleChip) {
                var s5g2El = container.querySelector('#wifi-5g2-ssid');
                var s5 = container.querySelector('#wifi-5g-ssid').value;
                if (s5g2El && s5 && !s5g2El.value) {
                    s5g2El.value = smartConvertSsid(s5, '5g2');
                    if (!container.querySelector('#wifi-5g2-key').value) container.querySelector('#wifi-5g2-key').value = container.querySelector('#wifi-5g-key').value;
                }
            }
        });

        // 5G_Game 开关被点击时，跳转到第三个标签页
        var en5g2 = container.querySelector('#wifi-5g2-en');
        if (en5g2) {
            en5g2.addEventListener('change', function() {
                // Tab 跳转
                if (this.checked) {
                    var t = container.querySelector('#tab-5g2');
                    if (t) t.click();
                } else {
                    if (en2g.checked) container.querySelector('#tab-2g').click();
                    else if (en5g.checked) container.querySelector('#tab-5g').click();
                    else { var t = container.querySelector('#tab-5g2'); if (t) t.click(); }
                }

                // 联动：开启时以 5G (或 2.4G) 为基准自动补齐
                if (this.checked) {
                    var s5g2El = container.querySelector('#wifi-5g2-ssid');
                    var s5 = container.querySelector('#wifi-5g-ssid').value;
                    var s2 = container.querySelector('#wifi-2g-ssid').value;
                    var refSsid = s5 || s2; // 优先学 5G，没有 5G 就学 2.4G
                    var refKey = container.querySelector('#wifi-5g-key').value || container.querySelector('#wifi-2g-key').value;

                    if (s5g2El && refSsid && (!s5g2El.value || cleanSsidSuffix(s5g2El.value) === cleanSsidSuffix(refSsid))) {
                        s5g2El.value = smartConvertSsid(refSsid, '5g2');
                        if (!container.querySelector('#wifi-5g2-key').value) container.querySelector('#wifi-5g2-key').value = refKey;
                    }
                }
            });
        }

        smartToggle.addEventListener('change', function(e) {
            var isSmart = this.checked;
            var smartUi = container.querySelector('#wifi-smart-ui');
            var splitUi = container.querySelector('#wifi-split-ui');
            
            if (isSmart) {
                // 切换为多频合一
                smartUi.style.display = 'block';
                splitUi.style.display = 'none';

                if (!e.isTrusted) return; // 防止页面加载时覆盖底层数据

                // 获取已开启频段的信息（优先提取 5G 的名字）
                var en2 = container.querySelector('#wifi-2g-en').checked;
                var en5 = container.querySelector('#wifi-5g-en').checked;
                var pickBand = (en5 || !en2) ? '5g' : '2g'; 
                
                var pickSsid = container.querySelector('#wifi-' + pickBand + '-ssid').value;
                var pickKey = container.querySelector('#wifi-' + pickBand + '-key').value;
                var pickEnc = container.querySelector('#wifi-' + pickBand + '-enc').value;
                
                // 智能联动 1：合一模式下，强制自动“剥离” 2.4G/5G 等后缀
                var smartSsidEl = container.querySelector('#wifi-smart-ssid');
                if (pickSsid) {
                    smartSsidEl.value = cleanSsidSuffix(pickSsid); 
                    container.querySelector('#wifi-smart-key').value = pickKey;
                    container.querySelector('#wifi-smart-enc').value = pickEnc;
                }

                // 切换为合一模式时，自动开启无缝漫游
                var rSmartEl = container.querySelector('#wifi-smart-roaming');
                if (rSmartEl) { rSmartEl.checked = true; rSmartEl.dispatchEvent(new Event('change')); }

            } else {
                // 切换为独立频段
                smartUi.style.display = 'none';
                splitUi.style.display = 'block';

                // 页面加载或手动切换时，自动判定并跳转到“已开启”的频段标签页
                var jumpToActiveTab = function() {
                    var e2 = container.querySelector('#wifi-2g-en').checked;
                    var e5 = container.querySelector('#wifi-5g-en').checked;
                    var e5g2El = container.querySelector('#wifi-5g2-en');
                    var e5g2 = e5g2El ? e5g2El.checked : false;

                    if (e2) container.querySelector('#tab-2g').click();
                    else if (e5) container.querySelector('#tab-5g').click();
                    else if (e5g2) { var t = container.querySelector('#tab-5g2'); if (t) t.click(); }
                    else container.querySelector('#tab-2g').click(); // 兜底
                };

                if (!e.isTrusted) {
                    jumpToActiveTab();
                    return;
                }

                // 联动 2：分开模式下，强制提取合一名称，并自动“追加”各自的后缀
                var baseSsid = container.querySelector('#wifi-smart-ssid').value;
                var baseKey = container.querySelector('#wifi-smart-key').value;
                var baseEnc = container.querySelector('#wifi-smart-enc').value;
                
                container.querySelector('#wifi-2g-ssid').value = smartConvertSsid(baseSsid, '2g');
                container.querySelector('#wifi-2g-key').value = baseKey;
                container.querySelector('#wifi-2g-enc').value = baseEnc;
                
                container.querySelector('#wifi-5g-ssid').value = smartConvertSsid(baseSsid, '5g');
                container.querySelector('#wifi-5g-key').value = baseKey;
                container.querySelector('#wifi-5g-enc').value = baseEnc;
                
                var s5g2El = container.querySelector('#wifi-5g2-ssid');
                if (s5g2El) {
                    s5g2El.value = smartConvertSsid(baseSsid, '5g2');
                    container.querySelector('#wifi-5g2-key').value = baseKey;
                    container.querySelector('#wifi-5g2-enc').value = baseEnc;
                }
                
                // 多频合一切回分开恢复漫游策略
                var r2gEl = container.querySelector('#wifi-2g-roaming');
                if (r2gEl) { r2gEl.checked = false; r2gEl.dispatchEvent(new Event('change')); }
                var r5gEl = container.querySelector('#wifi-5g-roaming');
                if (r5gEl) { r5gEl.checked = true; r5gEl.dispatchEvent(new Event('change')); }

                // 联动完成后，执行跳转
                jumpToActiveTab();
            }
        });

        legacyToggle.addEventListener('change', function() {
            if (this.checked && smartToggle.checked) {
                smartToggle.checked = false;
                smartToggle.dispatchEvent(new Event('change'));
            }
        });
        
        // ================= 2.4G 标签页点击事件 =================
        container.querySelector('#tab-2g').addEventListener('click', function() {
            // 1. 切换 Tab 颜色
            this.style.background = '#3b82f6'; this.style.color = '#fff';
            container.querySelector('#tab-5g').style.background = '#f1f5f9'; container.querySelector('#tab-5g').style.color = '#475569';
            var t5g2 = container.querySelector('#tab-5g2'); 
            if (t5g2) { t5g2.style.background = '#f1f5f9'; t5g2.style.color = '#475569'; }
            
            // 2. 切换表单显示
            container.querySelector('#wifi-2g-form').style.display = 'block';
            container.querySelector('#wifi-5g-form').style.display = 'none';
            var f5g2 = container.querySelector('#wifi-5g2-form'); 
            if (f5g2) f5g2.style.display = 'none';
            
            // 3. 为空或者同名时触发 2.4G 后缀保护与密码同步
            var s2El = container.querySelector('#wifi-2g-ssid');
            var s5 = container.querySelector('#wifi-5g-ssid').value;
            if ((!s2El.value || cleanSsidSuffix(s2El.value) === cleanSsidSuffix(s5)) && s5) {
                s2El.value = smartConvertSsid(s5, '2g');
                if(!container.querySelector('#wifi-2g-key').value) {
                    container.querySelector('#wifi-2g-key').value = container.querySelector('#wifi-5g-key').value;
                }
            }
        });
        // ================================================================

        container.querySelector('#tab-5g').addEventListener('click', function(){
            this.style.background='#3b82f6'; this.style.color='#fff';
            container.querySelector('#tab-2g').style.background='#f1f5f9'; container.querySelector('#tab-2g').style.color='#475569';
            var t5g2 = container.querySelector('#tab-5g2'); if(t5g2) { t5g2.style.background='#f1f5f9'; t5g2.style.color='#475569'; }
            container.querySelector('#wifi-5g-form').style.display='block';
            container.querySelector('#wifi-2g-form').style.display='none';
            var f5g2 = container.querySelector('#wifi-5g2-form'); if(f5g2) f5g2.style.display='none';
            
            // 联动：为空或者同主体名时触发 5G 后缀保护与密码同步
            var s5El = container.querySelector('#wifi-5g-ssid');
            var s2 = container.querySelector('#wifi-2g-ssid').value;
            if ((!s5El.value || cleanSsidSuffix(s5El.value) === cleanSsidSuffix(s2)) && s2) {
                s5El.value = smartConvertSsid(s2, '5g');
                if (!container.querySelector('#wifi-5g-key').value) {
                    container.querySelector('#wifi-5g-key').value = container.querySelector('#wifi-2g-key').value;
                }
            }
        });

        // 第三个 Tab 点击事件
        var tab5g2El = container.querySelector('#tab-5g2');
        if(tab5g2El) {
            tab5g2El.addEventListener('click', function(){
                this.style.background='#3b82f6'; this.style.color='#fff';
                container.querySelector('#tab-2g').style.background='#f1f5f9'; container.querySelector('#tab-2g').style.color='#475569';
                container.querySelector('#tab-5g').style.background='#f1f5f9'; container.querySelector('#tab-5g').style.color='#475569';
                var f5g2 = container.querySelector('#wifi-5g2-form'); if(f5g2) f5g2.style.display='block';
                container.querySelector('#wifi-2g-form').style.display='none';
                container.querySelector('#wifi-5g-form').style.display='none';
            });
        }

        // ===== 漫游与加密方式联动 =====
        // 1. 多频合一面板联动
        var smartRoamingToggle = container.querySelector('#wifi-smart-roaming');
        if (smartRoamingToggle) {
            smartRoamingToggle.addEventListener('change', function(e) {
                // 移除 isTrusted 限制，允许程序自动切换时触发联动修复
                if (this.classList.contains('is-dirty')) {
                    this.classList.remove('is-dirty'); 
                    window._forceWifiSubmit = true; 
                }
                var warn = container.querySelector('#roam-warn-smart');
                if (warn) warn.style.display = 'none'; 
                
                if (this.checked) {
                    var encSelect = container.querySelector('#wifi-smart-enc');
                    if (encSelect && encSelect.value === 'none') encSelect.value = 'psk2+ccmp';
                }
                updateRoamBadge('#wifi-smart-roaming');
            });
        }

        // 2. 2.4G 独立面板联动
        var r2gToggle = container.querySelector('#wifi-2g-roaming');
        if (r2gToggle) {
            r2gToggle.addEventListener('change', function(e) {
                if (this.classList.contains('is-dirty')) {
                    this.classList.remove('is-dirty');
                    window._forceWifiSubmit = true;
                }
                var warn = container.querySelector('#roam-warn-2g');
                if (warn) warn.style.display = 'none';

                if (this.checked) {
                    var encSelect = container.querySelector('#wifi-2g-enc');
                    if (encSelect && encSelect.value === 'none') encSelect.value = 'psk2+ccmp';
                }
                updateRoamBadge('#wifi-2g-roaming');
            });
        }

        // 3. 5G 独立面板联动
        var r5gToggle = container.querySelector('#wifi-5g-roaming');
        if (r5gToggle) {
            r5gToggle.addEventListener('change', function(e) {
                if (this.classList.contains('is-dirty')) {
                    this.classList.remove('is-dirty');
                    window._forceWifiSubmit = true;
                }
                var warn = container.querySelector('#roam-warn-5g');
                if (warn) warn.style.display = 'none';

                if (this.checked) {
                    var encSelect = container.querySelector('#wifi-5g-enc');
                    if (encSelect && encSelect.value === 'none') encSelect.value = 'psk2+ccmp';
                }
                updateRoamBadge('#wifi-5g-roaming');
            });
        }
        // ==================================

        // WISP 交互与扫描逻辑
        var wispToggle = container.querySelector('#wisp-toggle');
        var wispUiPanel = container.querySelector('#wisp-ui-panel');
        var scanBtn = container.querySelector('#btn-wisp-scan');
        var wispModal = container.querySelector('#wisp-scan-modal');
        
        if (wispToggle) {
            wispToggle.addEventListener('change', function(e) {
                wispUiPanel.style.display = this.checked ? 'flex' : 'none';
                
                // 鼠标真实点击，且打开开关时才触发重置
                if (e && e.isTrusted && this.checked) {
                    
                    // ==== 恢复扫描按钮 ====
                    var btnScanLive = container.querySelector('#btn-wisp-scan');
                    if (btnScanLive) {
                        btnScanLive.style.display = 'block';
                    }
                    
                    // 隐藏密码输入框
                    var selectedInfo = container.querySelector('#wisp-selected-info');
                    if (selectedInfo) selectedInfo.style.display = 'none';
                }
            });
            container.querySelector('#wisp-modal-close').addEventListener('click', function() { wispModal.style.display = 'none'; });

            scanBtn.addEventListener('click', function(e) {
                e.preventDefault();
                scanBtn.innerText = T['TXT_SCANNING'];
                scanBtn.disabled = true;
                
                // 单芯片用 radio0，多芯片若 5G 开优先用 radio1 异频中继)
                var scanDevice = 'radio0'; 
                if (!window._isSingleChip && container.querySelector('#wifi-5g-en').checked) scanDevice = 'radio1'; 
                
                callIwinfoScan(scanDevice).then(function(res) {
                    scanBtn.innerText = T['BTN_SCAN'];
                    scanBtn.disabled = false;

                    var ul = container.querySelector('#wisp-scan-list');
                    ul.innerHTML = '';
                    var list = res || [];
                    // 排序信号
                    list.sort(function(a, b) { return (b.signal || -100) - (a.signal || -100); });

                    if (list.length === 0) {
                        ul.innerHTML = '<li style="padding:20px; text-align:center; color:#64748b;">' + T['TXT_NO_NETWORKS'] + '</li>';
                    } else {
                        var uniqueSsids = {};
                        list.forEach(function(net) {
                            if (!net.ssid || uniqueSsids[net.ssid]) return; 
                            uniqueSsids[net.ssid] = true;
                            
                            var li = document.createElement('li');
                            li.style.cssText = 'padding:15px 20px; border-bottom:1px solid #f1f5f9; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;';
                            li.innerHTML = '<span style="font-weight:600; color:#334155; word-break:break-all; white-space:normal; margin-right:10px; flex:1;">' + net.ssid + '</span><span style="font-size:12px; color:#94a3b8; background:#f1f5f9; padding:2px 8px; border-radius:10px; white-space:nowrap; flex-shrink:0;">' + net.signal + ' dBm</span>';
                            
                            li.onmouseover = function() { this.style.background = '#f8fafc'; };
                            li.onmouseout = function() { this.style.background = 'transparent'; };
                            
                            li.onclick = function(e) {
                                if (e) { e.preventDefault(); e.stopPropagation(); }
                                
                                try {
                                    // 1. 填入 SSID
                                    container.querySelector('#wisp-target-ssid').value = net.ssid || '';
                                    
                                    var encVal = 'none'; // 默认无密码
                                    if (net.encryption) {
                                        // 容错处理：获取完整的描述字符串
                                        var desc = typeof net.encryption === 'string' ? net.encryption : (net.encryption.description || JSON.stringify(net.encryption));
                                        desc = desc.toLowerCase();
                                        
                                        // 强制判定为有密码！
                                        var isExplicitNone = (net.encryption.enabled === false || desc === 'none' || desc === '{"enabled":false}');
                                        
                                        if (!isExplicitNone) {
                                            if (desc.indexOf('wpa3') !== -1 || desc.indexOf('sae') !== -1) {
                                                encVal = 'sae-mixed';
                                            } else {
                                                encVal = 'psk2+ccmp';
                                            }
                                        }
                                    }
                                    container.querySelector('#wisp-target-enc').value = encVal;
                                    container.querySelector('#wisp-target-device').value = scanDevice; 
                                    container.querySelector('#wisp-target-bssid').value = net.bssid || '';
                                    
                                    // 3. 界面切换：显示填写面板，隐藏弹窗
                                    container.querySelector('#wisp-selected-info').style.display = 'block';
                                    wispModal.style.display = 'none'; 

                                    var pwdInput = container.querySelector('#wisp-target-key');
                                    var pwdRow = pwdInput ? pwdInput.closest('.nw-value') : null;
                                    
                                    if (encVal === 'none') {
                                        // 如果是开放网络，直接隐藏密码行，并清空历史密码
                                        if (pwdRow) pwdRow.style.display = 'none';
                                        if (pwdInput) pwdInput.value = '';
                                    } else {
                                        // 如果有加密，显示密码行并自动对焦
                                        if (pwdRow) pwdRow.style.display = 'flex';
                                        if (pwdInput) {
                                            setTimeout(function() {
                                                pwdInput.focus();
                                                pwdInput.select();
                                            }, 150);
                                        }
                                    }
                                } catch(err) {
                                    console.error("选取 Wi-Fi 时发生错误:", err);
                                }
                            };
                            
                            ul.appendChild(li);
                        });
                    }
                    wispModal.style.display = 'flex';
                }).catch(function(err) {
                scanBtn.innerText = T['BTN_SCAN'];
                scanBtn.disabled = false;
                    alert(T['TXT_SCAN_FAILED']);
                });
            });
        }
       // 結束

        // 页面切换+置顶函数
        var switchStep = function(hideEl, showEl) {
            hideEl.style.display = 'none'; 
            showEl.style.display = 'block';
            setTimeout(function() {
                smoothScrollToTop(650); // 毫秒自定义动画
            }, 20); // 给浏览器留20ms的重绘时间
        };

        container.querySelectorAll('.nw-card').forEach(function (card) {
            card.addEventListener('click', function () {
                // 在切换离开前，把目前框里的字存进缓存
                var currentU = container.querySelector('#pppoe-user');
                var currentP = container.querySelector('#pppoe-pass');
                if (currentU && currentU.value) sessionStorage.setItem('nw_pppoe_user', currentU.value);
                if (currentP && currentP.value) sessionStorage.setItem('nw_pppoe_pass', currentP.value);

                selectedMode = card.getAttribute('data-mode');
                
                container.querySelector('#fields-router').style.display = (selectedMode === 'router') ? 'block' : 'none';
                container.querySelector('#fields-pppoe').style.display = (selectedMode === 'pppoe') ? 'block' : 'none';
                container.querySelector('#fields-lan').style.display = (selectedMode === 'lan') ? 'block' : 'none';
                container.querySelector('#fields-wifi').style.display = (selectedMode === 'wifi') ? 'block' : 'none';

                // 如果是切换回PPPoE，再从缓存拿出来恢复
                if (selectedMode === 'pppoe') {
                    var savedU = sessionStorage.getItem('nw_pppoe_user');
                    var savedP = sessionStorage.getItem('nw_pppoe_pass');
                    if (savedU !== null && container.querySelector('#pppoe-user')) container.querySelector('#pppoe-user').value = savedU;
                    if (savedP !== null && container.querySelector('#pppoe-pass')) container.querySelector('#pppoe-pass').value = savedP;

                }

                switchStep(step1, step2);
            });
        });
        container.querySelector('#btn-back-1').addEventListener('click', function () { switchStep(step2, step1); });
        container.querySelector('#top-back-1').addEventListener('click', function () { switchStep(step2, step1); });
        container.querySelector('#btn-back-2').addEventListener('click', function () { switchStep(step3, step2); });
        container.querySelector('#top-back-2').addEventListener('click', function () { switchStep(step3, step2); });

        container.querySelector('#btn-next-2').addEventListener('click', function () {
            try {
                var mainBtn = container.querySelector('#main-pppoe-submit');
                if (mainBtn) mainBtn.click();
                
                var rTypeEl = container.querySelector('input[name="router_type"]:checked');
                var rType = rTypeEl ? rTypeEl.value : 'dhcp';
                var targetIp = '', targetGw = '', isBypass = false;
                
                // 获取系统当前的 WAN IP，用于冲突比对
                var sysWanIp = window._liveWanIp || ''; 

                if (selectedMode === 'lan') { 
                    targetIp = container.querySelector('#lan-ip').value.trim(); 
                    targetGw = container.querySelector('#lan-gw').value.trim(); 
                    isBypass = bypassToggle.checked;
                    
                    if (!targetIp) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_IP'], okText:T['BTN_EDIT']}); return; }
                    if (!isValidIP(targetIp)) { openModal({title:T['M_FMT_TIT'], msg:T['M_FMT_IP'], okText:T['BTN_EDIT']}); return; }
                    
                    if (isBypass) {
                        if (!targetGw) { openModal({title: T['M_LOGIC_TIT'], msg: T['M_LOGIC_BYP'], okText:T['BTN_EDIT']}); return; }
                        if (!isValidIP(targetGw)) { openModal({title: T['M_FMT_TIT'], msg: T['M_FMT_GW'], okText:T['BTN_EDIT']}); return; }
                        if (!isSameSubnet(targetIp, targetGw)) { openModal({title: T['M_SUB_ERR_TIT'], msg: T['M_SUB_ERR_BYP'], okText:T['BTN_EDIT']}); return; }
                        
                        if (targetIp === targetGw) { 
                            openModal({
                                title: T['M_LOGIC_TIT'], 
                                msg: T['M_SAME_BYP'] || 'In AP/Relay mode, Device IP MUST NOT be the same as Gateway!', 
                                okText: T['BTN_EDIT']
                            }); 
                            return; 
                        }
                        if (window._realUpstreamGw && window._realUpstreamGw !== T['TXT_GETTING']) {
                            // 物理网关抢占拦截 (旁路由模式)
                            if (targetIp === window._realUpstreamGw) {
                                // 递減算法
                                var suggestBypIp = getSafeApIp(window._realUpstreamGw);

                                openModal({
                                    title: T['M_CFLT_PHYSICAL_TIT'],
                                    msg: T['M_CFLT_PHYSICAL_BYP_MSG'].replace('{ip}', targetIp).replace('{suggest_ip}', suggestBypIp),
                                    okText: T['BTN_EDIT'],
                                    isDanger: true
                                });
                                return;
                            }
                        }
                    } else {
                        // 在 LAN 模式（未开启 AP）时，如果填写的 LAN IP 与上级 WAN IP 网段冲突
                        if (sysWanIp && isSameSubnet(targetIp, sysWanIp)) {
                            var safeRouterIp = getSafeRouterIp(sysWanIp);
                            // 跨网段拦截
                            openModal({
                                title: T['M_CFLT_CROSS_TIT'], 
                                msg: T['M_CFLT_CROSS_MSG'].replace('{ip}', targetIp).replace('{wan_ip}', sysWanIp).replace('{safe_ip}', safeRouterIp), 
                                okText: T['BTN_FIX_APPLY'],
                                cancelText: T['BTN_EDIT_MYSELF'],
                                onOk: function() {
                                    container.querySelector('#lan-ip').value = safeRouterIp;
                                    container.querySelector('#nw-global-modal').style.display = 'none';
                                    container.querySelector('#btn-next-2').click();
                                }
                            });
                            return;
                        }
                    }
                } else if (selectedMode === 'router') { 
                    // 主路由模式下的避让，包含 DHCP 和 Static
                    // DHCP 还是配置 Static，路由器的 LAN IP 和现在的 WAN 冲突，修改 LAN IP
                    var currentLanIp = container.querySelector('#lan-ip').value || safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0];
                    
                    if (rType === 'static') { 
                        targetIp = container.querySelector('#router-ip').value.trim(); 
                        targetGw = container.querySelector('#router-gw').value.trim();
                        if (!targetIp || !targetGw) { openModal({title:T['M_INC_TIT'], msg:T['M_INC_WAN'], okText:T['BTN_EDIT']}); return; }
                        if (!isValidIP(targetIp) || !isValidIP(targetGw)) { openModal({title:T['M_FMT_TIT'], msg:(!isValidIP(targetIp)?T['M_FMT_WAN']:T['M_FMT_GW']), okText:T['BTN_EDIT']}); return; }
                    if (targetIp === targetGw) { 
                        openModal({
                            title: T['M_LOGIC_TIT'], 
                            msg: T['M_SAME_GW'],
                            okText: T['BTN_EDIT']
                        }); 
                        return; 
                    }
                    // 主路由/WAN 靜态 IP 模式的物理网关拦截
                    if (window._realUpstreamGw && window._realUpstreamGw !== T['TXT_GETTING']) {
                        if (targetIp === window._realUpstreamGw) {
                            // WAN 口动态生成一個不等于 targetIp 尾数的建义值 (.88 或 .66)
                            var gwTailWan = parseInt(targetIp.split('.')[3], 10);
                            var suggestTailWan = (gwTailWan === 88) ? 66 : 88;
                            var suggestWanIp = targetIp.substring(0, targetIp.lastIndexOf('.')) + "." + suggestTailWan;

                            openModal({
                                title: T['M_CFLT_PHYSICAL_TIT'],
                                msg: T['M_CFLT_PHYSICAL_WAN_MSG'].replace('{ip}', targetIp).replace('{suggest_ip}', suggestWanIp),
                                okText: T['BTN_EDIT'],
                                isDanger: true
                            });
                            return;
                        }
                    }
                        if (!isSameSubnet(targetIp, targetGw)) { openModal({title: T['M_SUB_ERR_TIT'], msg: T['M_SUB_ERR_WAN1'] + '<br>' + T['M_SUB_ERR_WAN2'].replace('{gw}', targetGw).replace('{ip}', targetGw.substring(0, targetGw.lastIndexOf('.'))), okText:T['BTN_EDIT']}); return; }
                        sysWanIp = targetIp; // 静态下，将用户填写的 WAN IP 作为校验基准
                    }

                    // WAN 和 LAN 在主路由模式冲突
                    if (sysWanIp && currentLanIp && isSameSubnet(sysWanIp, currentLanIp)) {
                        var newSafeIp = getSafeRouterIp(sysWanIp);
                        // 主路由模式跨网段避让
                        openModal({
                            title: T['M_CFLT_INTERCEPT_TIT'], 
                            msg: T['M_CFLT_ROUTER_MSG'].replace('{wan_ip}', sysWanIp).replace('{lan_ip}', currentLanIp).replace('{safe_ip}', newSafeIp), 
                            okText: T['BTN_AUTO_EVADE'],
                            cancelText: T['BTN_EDIT_MYSELF'], // 手动修改(取消)按钮
                            isDanger: true,
                            onOk: function() {
                                // 强制重定向到修改 LAN IP，并附带 120 秒回滚保护！
                                container.querySelector('#lan-ip').value = newSafeIp;
                                selectedMode = 'lan'; // 篡改提交模式
                                container.querySelector('#nw-global-modal').style.display = 'none';
                                container.querySelector('#btn-next-2').click(); 
                            }
                        });
                        return; // 拦截本次提交
                    }
                } else if (selectedMode === 'pppoe') {
                    if (window._nwMultiPppoe) {
                        var mBoxes = container.querySelectorAll('.nw-multi-pppoe-box');
                        var mEmpty = false;
                        mBoxes.forEach(function(b) {
                            if (!b.querySelector('.m-user').value.trim() || !b.querySelector('.m-pass').value.trim()) mEmpty = true;
                        });
                        if (mEmpty) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_PPPOE'], okText: T['BTN_EDIT']}); return; }
                    } else {
                        if (!container.querySelector('#pppoe-user').value.trim() || !container.querySelector('#pppoe-pass').value.trim()) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_PPPOE'], okText: T['BTN_EDIT']}); return; } 
                    }
                } else if (selectedMode === 'wifi') {
                    var isSmart = container.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
                    if (isSmart) {
                        if (container.querySelector('#wifi-smart-en').checked) {
                            if (!container.querySelector('#wifi-smart-ssid').value.trim()) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_WIFI'], okText: T['BTN_EDIT']}); return; }
                            var k = container.querySelector('#wifi-smart-key').value;
                            var e = container.querySelector('#wifi-smart-enc').value;
                            if (e !== 'none' && (!k || k.length < 8)) { openModal({title: T['M_FMT_TIT'], msg: T['M_PWD_SHORT'], okText: T['BTN_EDIT']}); return; }
                        }
                    } else {
                        if (container.querySelector('#wifi-2g-en').checked) {
                            if (!container.querySelector('#wifi-2g-ssid').value.trim()) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_WIFI'], okText: T['BTN_EDIT']}); return; }
                            var k2 = container.querySelector('#wifi-2g-key').value;
                            var e2 = container.querySelector('#wifi-2g-enc').value;
                            if (e2 !== 'none' && (!k2 || k2.length < 8)) { openModal({title: T['M_FMT_TIT'], msg: T['M_PWD_SHORT'], okText: T['BTN_EDIT']}); return; }
                        }
                        if (container.querySelector('#wifi-5g-en').checked) {
                            if (!container.querySelector('#wifi-5g-ssid').value.trim()) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_WIFI'], okText: T['BTN_EDIT']}); return; }
                            var k5 = container.querySelector('#wifi-5g-key').value;
                            var e5 = container.querySelector('#wifi-5g-enc').value;
                            if (e5 !== 'none' && (!k5 || k5.length < 8)) { openModal({title: T['M_FMT_TIT'], msg: T['M_PWD_SHORT'], okText: T['BTN_EDIT']}); return; }
                        }
                    }
                    // WISP 密码校验
                    var wispTog = container.querySelector('#wisp-toggle');
                    if (wispTog && wispTog.checked) {
                        var wispSsid = container.querySelector('#wisp-target-ssid').value.trim();
                        if (!wispSsid) {
                            openModal({title: T['M_INC_TIT'], msg: T['MODAL_WISP_TITLE'], okText: T['BTN_EDIT']});
                            return;
                        }
                        var wispEnc = container.querySelector('#wisp-target-enc').value;
                        var wispKey = container.querySelector('#wisp-target-key').value;
                        if (wispEnc !== 'none' && (!wispKey || wispKey.length < 8)) {
                            openModal({title: T['M_FMT_TIT'], msg: T['M_PWD_SHORT'], okText: T['BTN_EDIT']});
                            return;
                        }
                    }
                }
                
                uci.load('network').then(function() {
                    try {
                        var currentLanIp = safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0];
                        var currentLanGw = safeUciGet('network', 'lan', 'gateway', '');
                        var currentWanProto = safeUciGet('network', 'wan', 'proto', '').toLowerCase();
                        var currentWanIp = (currentWanProto === 'static') ? safeUciGet('network', 'wan', 'ipaddr', '').split('/')[0] : (window._liveWanIp || '');
                        var currentWanGw = safeUciGet('network', 'wan', 'gateway', '');
                        
                        var currentBypass = (safeUciGet('dhcp', 'lan', 'ignore', '') === '1' ? '1' : '0');
                        var newBypass = bypassToggle.checked ? '1' : '0';

                        var currentDhcpv6 = safeUciGet('dhcp', 'lan', 'dhcpv6', '');
                        var currentIpv6 = (currentDhcpv6 === 'server' || currentDhcpv6 === 'relay') ? '1' : '0';
                        var ipv6El = container.querySelector('#lan-ipv6-toggle');
                        var newIpv6 = (ipv6El && ipv6El.checked) ? '1' : '0';
                        
                        // 检查黄色的 IPv6 警告灯是否亮起
                        var v6WarnEl = container.querySelector('#tip-ipv6-warn');
                        var needsV6Fix = (v6WarnEl && v6WarnEl.style.display !== 'none');

                        var currentWifiState = getWifiSnapshot();

                        var checkWanIp = (selectedMode === 'router' && rType === 'static') ? targetIp : currentWanIp;
                        var checkLanIp = (selectedMode === 'lan') ? targetIp : currentLanIp;

                        if (checkWanIp && checkLanIp && isSameSubnet(checkWanIp, checkLanIp)) {
                            var cfltMsg = T['M_CFLT_SUB1'].replace('{ip}', checkLanIp) + '<br>' + T['M_CFLT_SUB2'];
                            if (selectedMode === 'router' && rType === 'dhcp') {
                                cfltMsg += '<br><br><span style="color:#ef4444; font-weight:bold;">' + T['M_CFLT_SUGGEST'] + '</span>';
                            }
                            openModal({title: T['M_CFLT_TIT'], msg: cfltMsg, okText: T['BTN_EDIT']});
                            return;
                        }

                        var isNoMod = false;
                        if (selectedMode === 'lan' && targetIp === currentLanIp && targetGw === currentLanGw && newBypass === currentBypass && newIpv6 === currentIpv6 && !needsV6Fix) isNoMod = true;
                        
                        if (selectedMode === 'router' && rType === 'static' && targetIp === currentWanIp && targetGw === currentWanGw) isNoMod = true;
                        if (selectedMode === 'router' && rType === 'dhcp' && currentWanProto === 'dhcp') isNoMod = true;
                        if (selectedMode === 'wifi') {
                            if (window._forceWifiSubmit) {
                                isNoMod = false;
                            } else if (window._origWifiState && currentWifiState === window._origWifiState) {
                                isNoMod = true; 
                            }
                        }

                        if (isNoMod) { openModal({title: T['M_NO_MOD_TIT'], msg: T['M_NO_MOD_MSG'], okText: T['M_EXIT'], onOk: returnToStep1 }); return; }
                        
                        var b = function(t, p) { var h = "<div style='text-align:center; font-size:18px; margin-bottom:15px;'>" + t + "</div><div style='background:rgba(0,0,0,0.15); border-radius:8px; padding:10px 15px; font-size:14.5px;'>"; for (var i=0; i < p.length; i++) h += "<div style='display:flex; justify-content:space-between; align-items:flex-start; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.1); gap:10px;'><span style='opacity:0.8; flex-shrink:0; max-width:45%; word-break:break-word; line-height:1.4;'>" + p[i][0] + "</span><span style='font-family:monospace; word-break:break-word; text-align:right; flex:1; min-width:0;'>" + p[i][1] + "</span></div>"; return h + "</div>"; };

                        // === Diff 高亮渲染带新旧对比助手函数 ===
                        var mkDiff = function(label, newVal, oldVal) {
                            var sNew = String(newVal).trim();
                            var sOld = (oldVal !== undefined && oldVal !== null) ? String(oldVal).trim() : '';
                            
                            // 提取纯文本进行判断
                            var rawOld = sOld.replace(/<[^>]+>/g, '').trim();
                            var isActuallyNew = (rawOld === '' || rawOld === 'undefined' || rawOld === 'null');
                            var isChanged = (sNew !== sOld) && !isActuallyNew;
                            
                            // div 独立成行
                            var highlightBadge = function(txt) {
                                return "<div style='margin-top: 4px;'><span style='font-size: 14px; background: #10b981; color: #fff; padding: 2px 6px; border-radius: 6px; font-weight: bold; box-shadow: 0 2px 4px rgba(16,185,129,0.3); animation: pulse 2s infinite; white-space: nowrap;'>" + txt + "</span></div>";
                            };

                            if (isActuallyNew) {
                                // 文字在上，徽章在下
                                var newHtml = "<div style='display:flex; flex-direction:column; align-items:flex-end; justify-content:center;'>" +
                                                "<div>" + sNew + "</div>" +
                                                highlightBadge(T['TXT_NEW_MOD'] || 'NEW') +
                                              "</div>";
                                return [label, newHtml];
                            } else if (isChanged) {
                                // 旧值 -> 新值 -> 徽章独立在一行
                                var diffHtml = "<div style='display:flex; flex-direction:column; align-items:flex-end; gap:2px; margin-top:2px;'>" +
                                                 "<div style='font-size:14px; text-decoration:line-through; opacity: 0.5;'>" + sOld + "</div>" +
                                                 "<div style='display:flex; align-items:flex-start; justify-content:flex-end; text-align:right;'>" +
                                                   "<span style='color:#10b981; font-weight:bold; margin-right:6px; font-size:16px; line-height:1.2;'>↳</span>" +
                                                   "<div>" + sNew + "</div>" +
                                                 "</div>" +
                                                 highlightBadge(T['TXT_MODIFIED'] || 'OK') +
                                               "</div>";
                                return [label, diffHtml];
                            } else {
                                var dimStyle = "opacity: 0.7; color: rgba(255, 255, 255, 0.85);";
                                return ["<span style='" + dimStyle + "'>" + label + "</span>", "<span style='" + dimStyle + "'>" + sNew + "</span>"];
                            }
                        };
                        // =============================

                        if (selectedMode === 'lan') {
                            confirmText.innerHTML = b(isBypass ? T['MODE_LAN_TITLE']+" - "+T['STAT_BYPASS'] : T['MODE_LAN_TITLE']+" - "+T['STAT_LAN'], [
                                mkDiff(T['TXT_DEV_IP'].replace(':',''), targetIp, currentLanIp), 
                                mkDiff(T['LBL_GW'], targetGw || T['TXT_NOT_SET'], currentLanGw || T['TXT_NOT_SET']), 
                                mkDiff("DHCP", isBypass ? T['TXT_OFF'] : T['TXT_ON'], currentBypass === '1' ? T['TXT_OFF'] : T['TXT_ON']),
                                mkDiff("IPv6 (DHCPv6)", newIpv6 === '1' ? T['TXT_ON'] : T['TXT_OFF'], currentIpv6 === '1' ? T['TXT_ON'] : T['TXT_OFF'])
                            ]);
                        } else if (selectedMode === 'router') {
                            if (rType === 'static') {
                                confirmText.innerHTML = b(T['STAT_SEC_STATIC'], [
                                    mkDiff(T['TXT_WAN_IP'].replace(':',''), targetIp, currentWanIp), 
                                    mkDiff(T['TXT_UP_GW'].replace(':',''), targetGw, currentWanGw)
                                ]);
                            } else {
                                confirmText.innerHTML = b(T['STAT_SEC_DHCP'], [
                                    mkDiff(T['LBL_CONN_TYPE'], T['OPT_DHCP'], currentWanProto === 'dhcp' ? T['OPT_DHCP'] : ''), 
                                    mkDiff(T['M_IP_GW'], T['M_AUTO_UP'], currentWanProto === 'dhcp' ? T['M_AUTO_UP'] : '')
                                ]);
                            }
                        } else if (selectedMode === 'wifi') {
                            var confirmList = [];
                            var sTog = container.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
                            var getSelTxt = function(id) { 
                                var e = container.querySelector(id); 
                                return (e && e.options && e.selectedIndex >= 0) ? e.options[e.selectedIndex].text : (e ? e.value : ''); 
                            };
                            
                            // 解析旧状态对象以便对比
                            var oldS = window._origWifiState ? JSON.parse(window._origWifiState) : {};
                            
                            // 兜底，防止多频合一和分开模式互相切换时产生 undefined 污染
                            oldS.s2 = oldS.s2 || ''; oldS.ec2 = oldS.ec2 || '';
                            oldS.s5 = oldS.s5 || ''; oldS.ec5 = oldS.ec5 || '';
                            oldS.s5g2 = oldS.s5g2 || '';
                            oldS.ss = oldS.ss || ''; oldS.ecs = oldS.ecs || '';
                            oldS.ws = oldS.ws || '';
                            
                            if (sTog) {
                                var isEn = container.querySelector('#wifi-smart-en').checked;
                                confirmList.push(mkDiff(T['LBL_SMART_CONN'], isEn ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>', oldS.es ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>'));
                                if (isEn) {
                                    confirmList.push(mkDiff('<span style="color:#ffffff; font-weight:500;">SSID</span>', '<span style="font-weight:bold; color:#ffffff;">' + container.querySelector('#wifi-smart-ssid').value + '</span>', '<span style="font-weight:bold; color:#ffffff;">' + oldS.ss + '</span>'));
                                    confirmList.push(mkDiff('<span style="color:#ffffff; font-weight:500;">' + T['LBL_WIFI_ENC'] + '</span>', '<span style="color:#ffffff;">' + getSelTxt('#wifi-smart-enc') + '</span>', '<span style="color:#ffffff;">' + (container.querySelector('#wifi-smart-enc').querySelector('option[value="'+oldS.ecs+'"]') ? container.querySelector('#wifi-smart-enc').querySelector('option[value="'+oldS.ecs+'"]').text : oldS.ecs) + '</span>'));
                                    
                                    var roamNew = container.querySelector('#wifi-smart-roaming').checked;
                                    var roamOld = oldS.rs;
                                    if (roamNew || roamOld) {
                                        confirmList.push(mkDiff('<span style="color:#ffffff; font-weight:500;">' + T['LBL_ROAMING'] + '</span>', roamNew ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>', roamOld ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>'));
                                    }
                                    
                                    var hidNew = container.querySelector('#wifi-smart-hidden').checked;
                                    var hidOld = oldS.hs;
                                    if (hidNew || hidOld) {
                                        confirmList.push(mkDiff('<span style="color:#ffffff; font-weight:500;">' + T['LBL_HIDE_SSID'] + '</span>', hidNew ? '<span style="color:#ffffff; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>', hidOld ? '<span style="color:#ffffff; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>'));
                                    }
                                }
                            } else {
                                var en2g = container.querySelector('#wifi-2g-en').checked;
                                confirmList.push(mkDiff('<b style="color:#fde047; font-size:15px;">' + T['TAB_2G'] + '</b>', en2g ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>', oldS.e2 ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>'));
                                if (en2g) {
                                    confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ SSID</span>', '<span style="font-weight:bold; color:#ffffff;">' + container.querySelector('#wifi-2g-ssid').value + '</span>', '<span style="font-weight:bold; color:#ffffff;">' + oldS.s2 + '</span>'));
                                    confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['LBL_WIFI_ENC'] + '</span>', '<span style="color:#ffffff;">' + getSelTxt('#wifi-2g-enc') + '</span>', '<span style="color:#ffffff;">' + (container.querySelector('#wifi-2g-enc').querySelector('option[value="'+oldS.ec2+'"]') ? container.querySelector('#wifi-2g-enc').querySelector('option[value="'+oldS.ec2+'"]').text : oldS.ec2) + '</span>'));
                                    
                                    var r2New = container.querySelector('#wifi-2g-roaming').checked;
                                    var r2Old = oldS.r2;
                                    if (r2New || r2Old) {
                                        confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['LBL_ROAMING'] + '</span>', r2New ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>', r2Old ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>'));
                                    }
                                }
                                
                                var en5g = container.querySelector('#wifi-5g-en').checked;
                                confirmList.push(mkDiff('<b style="color:#67e8f9; font-size:15px;">' + T['TAB_5G'] + '</b>', en5g ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>', oldS.e5 ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>'));
                                if (en5g) {
                                    confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ SSID</span>', '<span style="font-weight:bold; color:#ffffff;">' + container.querySelector('#wifi-5g-ssid').value + '</span>', '<span style="font-weight:bold; color:#ffffff;">' + oldS.s5 + '</span>'));
                                    confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['LBL_WIFI_ENC'] + '</span>', '<span style="color:#ffffff;">' + getSelTxt('#wifi-5g-enc') + '</span>', '<span style="color:#ffffff;">' + (container.querySelector('#wifi-5g-enc').querySelector('option[value="'+oldS.ec5+'"]') ? container.querySelector('#wifi-5g-enc').querySelector('option[value="'+oldS.ec5+'"]').text : oldS.ec5) + '</span>'));
                                    
                                    var r5New = container.querySelector('#wifi-5g-roaming').checked;
                                    var r5Old = oldS.r5;
                                    if (r5New || r5Old) {
                                        confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['LBL_ROAMING'] + '</span>', r5New ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>', r5Old ? '<span style="color:#10b981; font-weight:bold;">' + T['TXT_ON'] + '</span>' : '<span style="color:#ef4444; font-weight:bold;">' + T['TXT_OFF'] + '</span>'));
                                    }
                                }
                                
                                // 5G_Game 确认信息
                                var en5g2El = container.querySelector('#wifi-5g2-en');
                                if (en5g2El && (en5g2El.checked || oldS.e5g2)) {
                                    var en5g2 = en5g2El.checked;
                                    confirmList.push(mkDiff('<b style="color:#f43f5e; font-size:15px;">5G_Game</b>', en5g2 ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>', oldS.e5g2 ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>'));
                                    if (en5g2) {
                                        confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ SSID</span>', '<span style="font-weight:bold; color:#ffffff;">' + container.querySelector('#wifi-5g2-ssid').value + '</span>', '<span style="font-weight:bold; color:#ffffff;">' + oldS.s5g2 + '</span>'));
                                        confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['LBL_WIFI_ENC'] + '</span>', '<span style="color:#ffffff;">WPA2/WPA3 Mixed</span>', '<span style="color:#ffffff;">WPA2/WPA3 Mixed</span>'));
                                    }
                                }
                            }
                            
                            // 中继 (WISP) 的确认信息展示
                            var wTogConfirm = container.querySelector('#wisp-toggle');
                            if (wTogConfirm) {
                                var wNew = wTogConfirm.checked;
                                var wOld = oldS.wt;
                                    if (wNew || wOld) {
                                        confirmList.push(mkDiff('<b style="color:#ffffff; font-size:15px;">🌐 ' + T['LBL_WISP_EN'] + '</b>', wNew ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>', wOld ? '<b style="color:#10b981;">' + T['TXT_ON'] + '</b>' : '<b style="color:#ef4444;">' + T['TXT_OFF'] + '</b>'));
                                        if (wNew) {
                                        confirmList.push(mkDiff('<span style="padding-left:12px; color:#ffffff; font-weight:500; opacity:0.95;">└ ' + T['TXT_TARGET_SSID'] + '</span>', '<span style="font-weight:bold; color:#facc15;">' + container.querySelector('#wisp-target-ssid').value + '</span>', '<span style="font-weight:bold; color:#facc15;">' + oldS.ws + '</span>'));
                                    }
                                }
                            }
                            
                            confirmText.innerHTML = b(T['MODE_WIFI_TITLE'], confirmList);
                        } else {
                            if (window._nwMultiPppoe) {
                                var mDiffs = [];
                                var mBoxes = container.querySelectorAll('.nw-multi-pppoe-box');
                                mBoxes.forEach(function(b) {
                                    var ifc = b.getAttribute('data-iface');
                                    var u = b.querySelector('.m-user').value.trim();
                                    var p = b.querySelector('.m-pass').value.trim();
                                    var oldIf = window._nwMultiPppoe.find(function(x){ return x.name === ifc; });
                                    mDiffs.push(mkDiff(ifc.toUpperCase() + ' ' + (T['M_ACCT']||'Account'), u, oldIf ? oldIf.user : ''));
                                    mDiffs.push(mkDiff(ifc.toUpperCase() + ' ' + (T['M_PWD']||'Password'), p, oldIf ? oldIf.pass : ''));
                                });
                                confirmText.innerHTML = b(T['MODE_PPPOE_TITLE'], mDiffs);
                            } else {
                                var oldPppoeUser = safeUciGet('network', 'wan', 'username', '');
                                var oldPppoePass = safeUciGet('network', 'wan', 'password', '');
                                confirmText.innerHTML = b(T['MODE_PPPOE_TITLE'], [
                                    mkDiff(T['M_ACCT'], container.querySelector('#pppoe-user').value, oldPppoeUser), 
                                    mkDiff(T['M_PWD'], container.querySelector('#pppoe-pass').value, oldPppoePass)
                                ]);
                            }
                        }
                        
                        if (selectedMode === 'lan' && !isBypass && targetGw !== '') { openModal({ title: T['M_WARN_TIT'], msg: T['M_WARN_MSG'], cancelText: T['BTN_EDIT'], okText: T['M_WARN_BTN'], isDanger: true, onOk: function() { container.querySelector('#nw-global-modal').style.display = 'none'; step2.style.display = 'none'; step3.style.display = 'block'; setTimeout(function(){ smoothScrollToTop(650); }, 20); } }); return; }
                        
                        // ===== Wi-Fi 无密码拦截 =====
                        var hasOpenWifi = false;
                        if (selectedMode === 'wifi') {
                            var checkSmart = container.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
                            if (checkSmart) {
                                if (container.querySelector('#wifi-smart-en').checked && container.querySelector('#wifi-smart-enc').value === 'none') hasOpenWifi = true;
                            } else {
                                if (container.querySelector('#wifi-2g-en').checked && container.querySelector('#wifi-2g-enc').value === 'none') hasOpenWifi = true;
                                if (container.querySelector('#wifi-5g-en').checked && container.querySelector('#wifi-5g-enc').value === 'none') hasOpenWifi = true;
                            }
                        }

                        if (hasOpenWifi) {
                            openModal({ 
                                title: T['M_OPEN_WARN_TIT'] || '⚠️ No Password', 
                                msg: T['M_OPEN_WARN_MSG'] || 'Setting up an open Wi-Fi without a password. Continue?', 
                                cancelText: T['BTN_EDIT'], 
                                okText: T['M_WARN_BTN'], 
                                isDanger: true, 
                                onOk: function() { 
                                    container.querySelector('#nw-global-modal').style.display = 'none'; 
                                    step2.style.display = 'none'; 
                                    step3.style.display = 'block'; 
                                    setTimeout(function(){ smoothScrollToTop(650); }, 20); 
                                } 
                            }); 
                            return; 
                        }
                        // ======================================

                        step2.style.display = 'none'; step3.style.display = 'block';
                        setTimeout(function(){ smoothScrollToTop(650); }, 20);
                    } catch (err) {
                        openModal({ title: T['M_SYS_ERR'], msg: (T['M_ERR_DATA_PROC'] || 'Configuration data processing failed') + ': ' + err, okText: T['M_CLOSE'] });
                    }
                }).catch(function(e) {
                    openModal({ title: T['M_SYS_ERR'], msg: T['M_SYS_MSG'], okText: T['M_CLOSE'] });
                });
            } catch (err) {
                openModal({ title: T['M_SYS_ERR'], msg: (T['M_ERR_VALIDATE'] || 'Input validation failed') + ': ' + err, okText: T['M_CLOSE'] });
            }
        });

        var fetchProbe = function(url, ms) {
            return Promise.race([
                fetch(url, { mode: 'no-cors', cache: 'no-store' }),
                new Promise(function(resolve, reject) { setTimeout(function(){ reject(new Error('timeout')); }, ms); })
            ]);
        };

        container.querySelector('#btn-apply').addEventListener('click', function () {
            // 开启“系统忙碌锁”
            window._isSystemBusy = true;
            // 设定 15 秒后自动解锁
            setTimeout(function() { window._isSystemBusy = false; }, 15000);

            try {
                var rTypeEl = container.querySelector('input[name="router_type"]:checked');
                var rType = rTypeEl ? rTypeEl.value : 'dhcp';
                var mode = selectedMode, a1 = '', a2 = '', a3 = '', a4 = '', a5 = '1', a6 = '0';
                var actionDetail = "";
                var mTitle = "";
                
                if (selectedMode === 'lan') { 
                    a1 = container.querySelector('#lan-ip').value.trim(); 
                    a2 = container.querySelector('#lan-gw').value.trim(); 
                    a3 = calculateNetmask(a1); 
                    a4 = bypassToggle.checked ? '1' : '0'; 
                    var safeEl = container.querySelector('#lan-safe-toggle'); 
                    a5 = (safeEl && safeEl.checked) ? '1' : '0';
                    var ipv6El = container.querySelector('#lan-ipv6-toggle');
                    a6 = (ipv6El && ipv6El.checked) ? '1' : '0';
                    actionDetail = '<b style="color:#3b82f6;">' + a1 + '</b>';
                    mTitle = bypassToggle.checked ? T['ACT_BYPASS'] : (a1 !== window.location.hostname ? T['ACT_LAN'] : T['M_RST_TIT']);
                } else if (selectedMode === 'router') { 
                    mode = (rType === 'dhcp') ? 'wan_dhcp' : 'wan_static'; 
                    if(rType === 'static') { a1 = container.querySelector('#router-ip').value.trim(); a2 = container.querySelector('#router-gw').value.trim(); a3 = calculateNetmask(a1); actionDetail = '<b style="color:#3b82f6;">' + a1 + '</b>'; }
                    else { actionDetail = '<b style="color:#10b981;">' + T['OPT_DHCP'] + '</b>'; }
                    mTitle = rType === 'dhcp' ? T['ACT_WAN_DHCP'] : T['ACT_WAN_STATIC'];
                } else if (selectedMode === 'pppoe') { 
                    if (window._nwMultiPppoe) {
                        mode = 'multi_pppoe';
                        actionDetail = '<b style="color:#3b82f6;">Multi-WAN (' + window._nwMultiPppoe.length + ')</b>';
                        mTitle = T['ACT_PPPOE'];
                    } else {
                        a1 = container.querySelector('#pppoe-user').value.replace(/[\r\n\s]+/g, '');
                        a2 = container.querySelector('#pppoe-pass').value; 
                        actionDetail = '<b style="color:#3b82f6;">' + a1 + '</b>';
                        mTitle = T['ACT_PPPOE'];
                    }
                } else if (selectedMode === 'wifi') {
                    var isSmart = container.querySelector('#wifi-smart-toggle').checked && !window._isSingleChip;
                    var legacyB = container.querySelector('#legacy-b-toggle').checked ? '1' : '0';
                    var payload = { smart: isSmart ? "true" : "false" };

                    if (isSmart) {
                        payload.merged = {
                            enabled: container.querySelector('#wifi-smart-en').checked ? "1" : "0",
                            ssid: container.querySelector('#wifi-smart-ssid').value.trim(),
                            key: container.querySelector('#wifi-smart-key').value,
                            encryption: container.querySelector('#wifi-smart-enc').value,
                            hidden: container.querySelector('#wifi-smart-hidden').checked ? "1" : "0",
                            roaming: container.querySelector('#wifi-smart-roaming').checked ? "1" : "0"
                        };
                    } else {
                        payload.radio_2g = {
                            enabled: container.querySelector('#wifi-2g-en').checked ? "1" : "0",
                            ssid: container.querySelector('#wifi-2g-ssid').value.trim(),
                            key: container.querySelector('#wifi-2g-key').value,
                            encryption: container.querySelector('#wifi-2g-enc').value,
                            hidden: container.querySelector('#wifi-2g-hidden').checked ? "1" : "0",
                            mode: container.querySelector('#wifi-2g-mode').value,
                            channel: container.querySelector('#wifi-2g-chan').value,
                            bandwidth: container.querySelector('#wifi-2g-bw').value,
                            roaming: container.querySelector('#wifi-2g-roaming').checked ? "1" : "0"
                        };
                        payload.radio_5g = {
                            enabled: container.querySelector('#wifi-5g-en').checked ? "1" : "0",
                            ssid: container.querySelector('#wifi-5g-ssid').value.trim(),
                            key: container.querySelector('#wifi-5g-key').value,
                            encryption: container.querySelector('#wifi-5g-enc').value,
                            hidden: container.querySelector('#wifi-5g-hidden').checked ? "1" : "0",
                            mode: container.querySelector('#wifi-5g-mode').value,
                            channel: container.querySelector('#wifi-5g-chan').value,
                            bandwidth: container.querySelector('#wifi-5g-bw').value,
                            roaming: container.querySelector('#wifi-5g-roaming').checked ? "1" : "0"
                        };
                        
                        // 5G_Game 逻辑
                        if (container.querySelector('#tab-5g2').style.display !== 'none') {
                            payload.radio_5g2 = {
                                enabled: container.querySelector('#wifi-5g2-en').checked ? "1" : "0",
                                ssid: container.querySelector('#wifi-5g2-ssid').value.trim(),
                                key: container.querySelector('#wifi-5g2-key').value,
                                encryption: "psk2+ccmp",
                                hidden: "0", mode: "auto", channel: "auto", bandwidth: "auto", roaming: "0"
                            };
                        }
                    }
                    // WISP 参数打包
                    var wispTog = container.querySelector('#wisp-toggle');
                    if (wispTog) {
                        var targetEnc = container.querySelector('#wisp-target-enc').value;
                        payload.wisp = {
                            enabled: wispTog.checked ? "1" : "0",
                            ssid: container.querySelector('#wisp-target-ssid').value,
                            // none，强制密码传空，防止残留脏数据导致连接失败
                            key: (targetEnc === 'none') ? '' : container.querySelector('#wisp-target-key').value,
                            encryption: targetEnc,
                            device: container.querySelector('#wisp-target-device').value,
                            bssid: container.querySelector('#wisp-target-bssid').value
                        };
                    }

                    a1 = JSON.stringify(payload);
                    a4 = legacyB;
                    actionDetail = '<b style="color:#10b981;">' + T['MODE_WIFI_TITLE'] + '</b>';
                    mTitle = T['ACT_WIFI'];
                }
                
                openModal({ title: mTitle, msg: '<div style="font-size: 16px; margin-bottom: 10px;">' + T['LBL_TARGET'] + ' ' + actionDetail + '</div><div style="color: #64748b; font-size: 16px;">' + T['MSG_WRITING'] + '</div>', spin: true });
                
                var succ = function() {
                    var h = window.location.hostname, sec = 0;
                    if (selectedMode === 'lan' && a1 && a1 !== h) { 
                        if (a5 === '1') {
                            var countdownTimer = setInterval(function() {
                                sec += 3;
                                if (sec <= 120) {
                                    document.getElementById('nw-global-msg').innerHTML = '<div style="font-size: 16px; margin-bottom: 12px;">' + T['LBL_TARGET'] + ' <b style="color:#3b82f6; font-size: 18px;">' + a1 + '</b></div><div style="color: #64748b; font-size: 14px; font-weight: bold;">' + T['MSG_TIMER'].replace('{sec}', sec).replace('{total}', 120) + '</div>';
                                    if (sec >= 8) { 
                                        fetchProbe('http://' + a1 + '/luci-static/resources/view/netwiz.js?v=' + Date.now(), 2000)
                                        .then(function() { 
                                            clearInterval(countdownTimer); 
                                            var jumpUrl = 'http://' + a1 + '/cgi-bin/luci/admin/netwiz';
                                            var doJump = function() { window.location.href = jumpUrl; };
                                            callNetDefuse().then(doJump).catch(doJump); 
                                            setTimeout(doJump, 1000);
                                        }).catch(function() {}); 
                                    }
                                } else {
                                    clearInterval(countdownTimer); 
                                    var rollbackSec = 0;
                                    var checkOldIpTimer = setInterval(function() { 
                                        rollbackSec += 3; 
                                        document.getElementById('nw-global-msg').innerHTML = '<div style="color:#10b981; font-weight:bold; font-size:15px; margin-top:20px; margin-bottom:10px;">' + T['MSG_WAIT_OLD'].replace('{sec}', rollbackSec) + '</div><div style="color:#64748b; font-size:14px;">' + T['MSG_ABANDONING'] + '</div>'; 
                                        fetchProbe('http://' + h + '/cgi-bin/luci/?v=' + Date.now(), 2000)
                                        .then(function() { 
                                            clearInterval(checkOldIpTimer);
                                            
                                            // 网络恢复后，向后端发送确认信号，解除看门狗回滚警报
                                            var confirmRpc = rpc.declare({ object: 'netwiz', method: 'confirm' });
                                            confirmRpc().then(function() {
                                                // 确认成功后，再刷新页面进入系统
                                                var match = window.location.pathname.match(/;stok=[a-zA-Z0-9]+/);
                                                var stok = match ? match[0] + '/' : '';
                                                window.location.href = window.location.protocol + '//' + h + '/cgi-bin/luci/' + stok + 'admin/netwiz';
                                            }).catch(function() {
                                                // 确认失败，刷新避免卡死
                                                window.location.reload();
                                            });
                                        }).catch(function() {});
                                    }, 3000);
                                }
                            }, 3000);
                        } else {
                            var probeNewTimer = setInterval(function() { 
                                sec += 3; 
                                document.getElementById('nw-global-msg').innerHTML = '<div style="font-size: 16px; margin-bottom: 10px;">' + T['LBL_TARGET'] + ' ' + actionDetail + '</div><div style="color: #059669; font-size: 16px; font-weight: bold;">' + T['MSG_WAIT_NET'].replace('{sec}', sec) + '</div>'; 
                                
                                // 前 9 秒倒数
                                if (sec <= 9) return;

                                fetchProbe('http://' + a1 + '/cgi-bin/luci/?v=' + Date.now(), 2000)
                                .then(function() { 
                                    clearInterval(probeNewTimer); 
                                    var doJump = function() { window.location.href = 'http://' + a1 + '/cgi-bin/luci/admin/netwiz'; };
                                    callNetDefuse().then(doJump).catch(doJump);
                                }).catch(function() {});
                            }, 3000);
                        }
                    } else { 
                        var checkSameTimer = setInterval(function() { 
                            sec += 3; 
                            document.getElementById('nw-global-msg').innerHTML = '<div style="font-size: 16px; margin-bottom: 10px;">' + T['LBL_TARGET'] + ' ' + actionDetail + '</div><div style="color: #059669; font-size: 16px; font-weight: bold;">' + T['MSG_WAIT_NET'].replace('{sec}', sec) + '</div>'; 
                            
                            if (sec <= 9) return;

                            fetchProbe('http://' + h + '/cgi-bin/luci/?v=' + Date.now(), 2000)
                            .then(function() { 
                                clearInterval(checkSameTimer); 
                                var match = window.location.pathname.match(/;stok=[a-zA-Z0-9]+/);
                                var stok = match ? match[0] + '/' : '';
                                var jumpUrl = window.location.protocol + '//' + h + '/cgi-bin/luci/' + stok + 'admin/netwiz';
                                var doJump = function() { window.location.href = jumpUrl; };
                                callNetDefuse().then(doJump).catch(doJump);
                            }).catch(function() {});
                        }, 3000);
                    }
                };
                
                if (mode === 'multi_pppoe') {
                    var mBoxes = container.querySelectorAll('.nw-multi-pppoe-box');
                    mBoxes.forEach(function(b) {
                        var ifc = b.getAttribute('data-iface');
                        var u = b.querySelector('.m-user').value.replace(/[\r\n\s]+/g, '');
                        var p = b.querySelector('.m-pass').value;
                        uci.set('network', ifc, 'username', u);
                        uci.set('network', ifc, 'password', p);
                    });
                    uci.save().then(function() { return uci.apply(); }).then(function() { succ(); }).catch(function() { succ(); });
                } else {
                    callNetSetup(mode, a1, a2, a3, a4, a5, a6).then(function() { succ(); }).catch(function() { succ(); });
                }
            } catch (err) {
                openModal({ title: T['M_SYS_ERR'], msg: 'Application failed: ' + err, okText: T['M_CLOSE'] });
            }
        });
    }
});
