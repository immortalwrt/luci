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
    'MODE_ROUTER_TITLE': _('Secondary Router Mode'),
    'MODE_ROUTER_DESC': _('Upstream network dials up, this device acts as a secondary router.'),
    'MODE_PPPOE_TITLE': _('PPPoE Dial-up'),
    'MODE_PPPOE_DESC': _('Dial up directly using account and password on this device.'),
    'MODE_LAN_TITLE': _('LAN Settings'),
    'MODE_LAN_DESC': _('Change device LAN IP, or switch to Bypass Router mode.'),
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
    'LBL_BYPASS': _('Enable Bypass Mode'),
    'WARN_BYPASS': _('<b style="font-size: 16px;">Bypass Mode Enabled:</b><br>1. DHCP will be disabled. <b style="color: #059669;">Devices must use static IPs or get IPs from upstream.</b><br>2. Gateway MUST be the upstream router IP.<br>3. If LAN IP changes, ensure your client is in the same subnet to avoid <b style="color: #059669;">losing access</b>.'),
    'WARN_MAIN': _('<b style="font-size: 16px;">Main Router Mode Enabled:</b><br>1. DHCP will be enabled. This device assigns IPs.<br>2. Gateway is usually left blank.<br>3. If LAN IP changes, ensure your client is in the same subnet to avoid <b style="color: #dc2626;">losing access</b>.'),
    'LBL_LAN_IP': _('Device LAN IP'),
    'LBL_LAN_GW': _('LAN Gateway'),
    'PH_LAN_GW': _('Blank for Main, required for Bypass'),
    'BTN_BACK': _('Back'),
    'BTN_NEXT': _('Next Step'),
    'BTN_EDIT': _('Back to Edit'),
    'TITLE_CONFIRM': _('Confirm Configuration'),
    'DESC_CONFIRM': _('The following settings will be applied, please verify:'),
    'NOTE_TITLE': _('Application Notes:'),
    'NOTE_1': _('After confirmation, the network will restart and apply new settings.'),
    'NOTE_2': _('The system will auto-refresh or redirect in 15 seconds.'),
    'BTN_APPLY': _('Apply Settings'),
    'STAT_BYPASS': _('Bypass Mode'),
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
    'ERR_RD_SYS': _('System read error, anti-freeze triggered'),
    'ERR_CRASH': _('Underlying crash intercepted, please force refresh'),
    'M_INC_TIT': _('Incomplete info'),
    'M_INC_IP': _('Device IP cannot be empty.'),
    'M_INC_WAN': _('Static IP and Gateway cannot be empty.'),
    'M_INC_PPPOE': _('PPPoE username and password cannot be empty.'),
    'M_FMT_TIT': _('Format Error'),
    'M_FMT_IP': _('The device IP is invalid, please check!'),
    'M_FMT_WAN': _('WAN IP is invalid, please check!'),
    'M_FMT_GW': _('Gateway IP is invalid, please check!'),
    'M_LOGIC_TIT': _('Logic Error'),
    'M_LOGIC_BYP': _('Bypass mode requires an upstream gateway IP.'),
    'M_SAME_GW': _('WAN Static IP MUST NOT be the same as the gateway!'),
    'M_SAME_BYP': _('The Bypass Device IP MUST NOT be the same as the Gateway!'),
    'M_NO_MOD_TIT': _('No Changes Needed'),
    'M_NO_MOD_MSG': _('Your settings match the current router config exactly.'),
    'M_EXIT': _('Exit to Home'),
    'M_CFLT_TIT': _('Conflict Blocked'),
    'M_CFLT_IP': _('The WAN IP cannot be the same as the current LAN IP ({ip})!'),
    'M_CFLT_SUB1': _('The WAN port cannot be in the same subnet as the LAN ({ip})!'),
    'M_CFLT_SUB2': _('This causes a routing loop.'),
    'M_SUB_ERR_TIT': _('Subnet Error'),
    'M_SUB_ERR_WAN1': _('The WAN Static IP must be in the same subnet as the Gateway!'),
    'M_SUB_ERR_WAN2': _('e.g., if gateway is {gw}, the IP must be {ip}.x'),
    'M_SUB_ERR_BYP': _('The Bypass Device IP must be in the same subnet as the Gateway!'),
    'M_CFLT_LAN_IP': _('LAN IP cannot be the same as the existing WAN IP ({ip})!'),
    'M_CFLT_LAN_SUB': _('LAN cannot be in the same subnet as WAN ({ip})!'),
    'M_WARN_TIT': _('Config Warning'),
    'M_WARN_MSG': _('You selected [Main Router Mode] but filled in the [Gateway].<br><br><b>For a standard main router, the gateway must be blank.</b> Entering a gateway may cause the device to fail at distributing network, leading to a total outage!<br><br>Are you sure you want to do this?'),
    'M_WARN_BTN': _('Force Apply'),
    'M_SYS_ERR': _('System Exception'),
    'M_SYS_MSG': _('Cannot read underlying config for validation, please refresh.'),
    'M_APP_TIT': _('Applying Config'),
    'M_APP_MSG': _('Writing request, please wait...'),
    'M_SUCC_TIT': _('Config Applied'),
    'M_SUCC_MSG1': _('Since the IP has changed to {ip},'),
    'M_SUCC_MSG2': _('the system will attempt to redirect to the new address in 15 seconds.'),
    'M_SUCC_MSG3': _('Note: You will need to log in again.'),
    'M_RST_TIT': _('Applying Configuration'),
    'M_RST_MSG': _('Underlying network is resetting, please wait...<br><br><span style="font-size: 14px; color: #555;">(If it does not automatically return in 15s, manually refresh)</span>'),
    'M_FAIL_TIT': _('❌ Write Failed'),
    'M_FAIL_MSG': _('Underlying call exception, please try logging in again.'),
    'M_FAIL_CODE': _('Error code: {code}'),
    'M_CLOSE': _('Close'),
    'M_ACCT': _('Account'),
    'M_PWD': _('Password'),
    'M_HIDDEN': _('Hidden'),
    'M_IP_GW': _('IP & Gateway'),
    'M_AUTO_UP': _('Auto-assigned by upstream router')
};

// 声明后端的 RPC 接口调用
var callNetSetup = rpc.declare({
    object: 'netwiz',
    method: 'set_network',
    params: ['mode', 'arg1', 'arg2', 'arg3', 'arg4'],
    expect: { result: 0 }
});

// 获取外网連線狀態的 RPC 接口
var getWanStatus = rpc.declare({
    object: 'network.interface',
    method: 'dump',
    expect: { '': {} } 
});

return view.extend({
    render: function () {
        // 确保手机端视口缩放正常
        if (!document.querySelector('meta[name="viewport"]')) {
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
            document.head.appendChild(meta);
        }

        var container = dom.create('div', { class: 'cbi-map', id: 'netwiz-container' });

        var htmlTemplate = [
            '<style>',
            'html, body { overflow-y: scroll !important; scrollbar-gutter: stable; }',
            '.nw-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 80vh; padding-top: 10vh; padding-bottom: 10vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }',
            '.nw-header { text-align: center; margin-bottom: 40px; background-color: #5e72e4; padding: 25px; margin-top: -90px; border-radius: 0 0 15px 15px; position: relative; }',
            '.nw-main-title { font-size: 35px; font-weight: 600; margin-bottom: 10px; color: #ffffff; letter-spacing: 2px; }',
            '.nw-header p { color: #ffffff; font-size: 16px; opacity: 0.9; margin: 0; letter-spacing: 1px; }',
            '.nw-step { width: 100%; max-width: 750px; text-align: center; animation: slideUp 0.4s ease-out; }',
            '@keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }',
            '.nw-card-group { display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }',
            '.nw-card { width: 210px; padding: 40px 20px; border-radius: 16px; cursor: pointer; backdrop-filter: blur(12px); border: 1px solid rgba(0,0,0,0.03); box-shadow: 0px 0px 15px 2px #b7b7b7; transition: all 0.25s ease; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }',
            '.nw-card:hover { transform: translateY(-5px); }',
            '.nw-card[data-mode="router"] { background: rgba(79, 150, 101, 0.85); }',
            '.nw-card[data-mode="pppoe"] { background: rgba(80, 0, 183, 0.85); }',
            '.nw-card[data-mode="lan"] { background: rgba(245, 54, 92, 0.85); }',
            '.nw-badge { width: 54px; height: 54px; line-height: 54px; border-radius: 50%; font-size: 20px; font-weight: bold; margin-bottom: 20px; }',
            '.nw-badge-dhcp { background: #e0f2fe; color: #0284c7; }',
            '.nw-badge-pppoe { background: #f3e8ff; color: #9333ea; }',
            '.nw-badge-bypass { background: #d1fae5; color: #059669; }',
            '.nw-card-title { font-size: 20px; margin: 0 0 10px 0; color: #ffffff; font-weight: 600; }',
            '.nw-card span { font-size: 15px; color: #ffffff; line-height: 1.5; opacity: 0.9; }',
            '.nw-form-area, .nw-confirm-board { position: relative; max-width: 460px; margin: 0 auto; text-align: left; padding: 40px; border-radius: 16px; background-color: rgba(255, 255, 255, 0.88); box-shadow: 0 10px 30px rgba(0,0,0,0.06); }',
            '.nw-top-back { position: absolute; top: 20px; left: 20px; width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; z-index: 10; }',
            '.nw-top-back:hover { background: #e2e8f0; color: #0f172a; transform: translateX(-3px); box-shadow: 2px 2px 8px rgba(0,0,0,0.05); }',
            '.nw-top-back svg { width: 20px; height: 20px; }',
            '.nw-step-title { text-align: center; margin-bottom: 30px; color: #111; font-weight: 600; font-size: 20px; }',
            
            // 表单元素样式隔离，防止原生主题污染
            '.nw-form-area .nw-value { border: none !important; padding: 12px 0 !important; display: flex !important; flex-direction: column !important; width: 100% !important; margin: 0 !important; background: transparent !important; }',
            '.nw-form-area .nw-value-title { text-align: left !important; font-weight: 600 !important; color: #334155 !important; font-size: 14.5px !important; margin: 0 0 10px 4px !important; line-height: 1.2 !important; display: block !important; padding: 0 !important; width: auto !important; float: none !important; }',
            '.nw-form-area .nw-value-field { width: 100% !important; margin: 0 !important; padding: 0 !important; display: block !important; float: none !important; }',
            '.nw-form-area input[type="text"], .nw-form-area input[type="password"] { appearance: none !important; -webkit-appearance: none !important; width: 100% !important; box-sizing: border-box !important; padding: 14px 16px !important; border: 1px solid #cbd5e1 !important; border-radius: 8px !important; font-size: 15px !important; outline: none !important; background: #f8fafc !important; color: #0f172a !important; height: auto !important; min-height: 48px !important; line-height: normal !important; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02) !important; margin: 0 !important; transition: all 0.2s ease !important; display: block !important; }',
            '.nw-form-area input:focus { border-color: #3b82f6 !important; background: #ffffff !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }',
            'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 1000px #f8fafc inset !important; -webkit-text-fill-color: #0f172a !important; transition: background-color 5000s ease-in-out 0s !important; }',
            
            '.nw-actions { margin-top: 35px; display: flex; justify-content: center; gap: 15px; }',
            '.nw-actions button { appearance: none !important; border-radius: 8px !important; padding: 12px 28px !important; font-weight: 600 !important; font-size: 15px !important; cursor: pointer !important; border: none !important; min-width: 120px !important; outline: none !important; height: auto !important; line-height: normal !important; margin: 0 !important; box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important; transition: transform 0.1s, background 0.2s !important; }',
            '.nw-actions button:active { transform: scale(0.97) !important; }',
            '.nw-actions .cbi-button-apply { background: #10b981 !important; color: white !important; }',
            '.nw-actions .cbi-button-apply:hover { background: #059669 !important; }',
            '.nw-actions .cbi-button-reset { background: #f43f5e !important; color: #fff !important; }',
            '.nw-actions .cbi-button-reset:hover { background: #e11d48 !important; }',
            
            '.nw-radio-group { display: flex; gap: 24px; font-size: 15px; color: #333; align-items: center; margin: 0; padding: 0; }',
            '.nw-radio-group label { cursor: pointer; display: flex; align-items: center; gap: 6px; margin: 0 !important; padding: 0 !important; height: 20px; line-height: 1 !important; font-weight: normal; }',
            '.nw-radio-group input[type="radio"] { margin: 0 !important; padding: 0 !important; cursor: pointer; width: 16px !important; height: 16px !important; position: relative; top: 0; appearance: auto !important; }',
            '.nw-switch { position: relative; display: inline-block; width: 46px; height: 24px; margin: 0; }',
            '.nw-switch input { opacity: 0; width: 0; height: 0; }',
            '.nw-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }',
            '.nw-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }',
            'input:checked + .nw-slider { background-color: #3b82f6; }',
            'input:checked + .nw-slider:before { transform: translateX(22px); }',
            
            '#nw-global-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.65); z-index: 999999; display: flex; align-items: center; justify-content: center; }',
            '#nw-global-modal .nw-modal-box { background: #fff; padding: 40px; border-radius: 16px; text-align: center; max-width: 420px; width: 90%; }',
            '#nw-global-modal h3 { font-size: 22px; color: #1e293b; margin-bottom: 15px; border:none; }',
            '#nw-global-modal p { font-size: 15px; color: #475569; line-height: 1.6; margin: 0; }',
            '.nw-spinner { width: 50px; height: 50px; border: 4px solid #f1f5f9; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 25px; }',
            '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }',
            '.nw-modal-btn-ok { background: #3b82f6 !important; color: white !important; border: none !important; padding: 12px 30px !important; border-radius: 8px !important; font-size: 15px !important; cursor: pointer !important; flex: 1 !important; transition: background 0.2s !important; height: auto !important; margin: 0 !important; }',
            '.nw-modal-btn-ok:hover { background: #2563eb !important; }',
            '.nw-modal-btn-cancel { background: #f1f5f9 !important; color: #475569 !important; border: none !important; padding: 12px 20px !important; border-radius: 8px !important; font-size: 15px !important; cursor: pointer !important; flex: 1 !important; transition: background 0.2s !important; height: auto !important; margin: 0 !important; }',
            '.nw-modal-btn-cancel:hover { background: #e2e8f0 !important; }',
            '.nw-modal-btn-danger { background: #ef4444 !important; color: white !important; border: none !important; padding: 12px 30px !important; border-radius: 8px !important; font-size: 15px !important; cursor: pointer !important; flex: 1 !important; transition: background 0.2s !important; height: auto !important; margin: 0 !important; }',
            '.nw-modal-btn-danger:hover { background: #dc2626 !important; }',
            
            '.nw-hl { color: #facc15; font-weight: bold; margin-left: 6px; }',
            
            // 手机端响应式样式适配
            '@media screen and (max-width: 768px) {',
            '  .nw-wrapper { padding-top: 3vh; padding-bottom: 5vh; }',
            '  .nw-header { margin: -30px auto 0 !important; padding: 20px 15px !important; width: 100% !important; max-width: 320px !important; box-sizing: border-box !important; border-radius: 12px; }',
            '  .nw-main-title { font-size: 22px; }',
            '  .nw-header p { font-size: 13px; }',
            '  .nw-card-group { flex-direction: column; align-items: center; gap: 15px; margin-top: 15px; }',
            '  .nw-card { width: 100% !important; max-width: 320px !important; padding: 25px 20px !important; text-align: center; box-sizing: border-box !important; margin: 0 auto !important; }',
            '  .nw-badge { margin-bottom: 15px; width: 48px; height: 48px; line-height: 48px; font-size: 18px; }',
            '  .nw-form-area, .nw-confirm-board { width: 100% !important; max-width: 320px !important; margin: 0 auto !important; padding: 25px 20px !important; box-sizing: border-box !important; }',
            '  .nw-top-back { top: 12px; left: 12px; width: 32px; height: 32px; }',
            '  .nw-step-title { font-size: 18px; margin-top: 15px; margin-bottom: 20px; }',
            '  #current-mode-display { width: 100% !important; max-width: 320px !important; min-width: 0 !important; margin: 20px auto 0 !important; padding: 15px !important; box-sizing: border-box !important; display: block !important; }',
            '  .nw-actions { width: 100% !important; max-width: 320px !important; margin: 20px auto 0 !important; display: flex !important; flex-direction: row !important; gap: 12px !important; box-sizing: border-box !important; }',
            '  .nw-actions button { flex: 1 !important; padding: 12px 0 !important; font-size: 15px !important; margin: 0 !important; min-width: 0 !important; box-sizing: border-box !important; }',
            '  #nw-global-modal .nw-modal-box { padding: 25px 20px; width: 85%; }',
            '  #nw-global-btn-wrap { flex-direction: row; gap: 12px; }',
            '  #nw-global-btn-wrap button { flex: 1; padding: 12px 0 !important; margin: 0 !important; }',
            '  .nw-radio-group { flex-wrap: wrap; gap: 12px; }',
            '}',
            '</style>',

            // 主界面 HTML 结构
            '<div class="nw-wrapper">',
            '  <div class="nw-header">',
            '    <div class="nw-main-title">{{TITLE}}</div>',
            '    <p>{{SUBTITLE}}</p>',
            '  </div>',
            '  <div id="nw-global-modal" style="display:none;">',
            '    <div class="nw-modal-box">',
            '      <div id="nw-global-spinner" class="nw-spinner" style="display:none;"></div>',
            '      <h3 id="nw-global-title"></h3>',
            '      <p id="nw-global-msg"></p>',
            '      <div id="nw-global-btn-wrap" style="display:flex; gap:15px; width:100%; margin-top:25px;">',
            '        <button id="nw-global-btn-cancel" class="nw-modal-btn-cancel" style="display:none;"></button>',
            '        <button id="nw-global-btn-ok" class="nw-modal-btn-ok" style="display:none;"></button>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div id="step-1" class="nw-step">',
            '    <div class="nw-card-group">',
            '      <div class="nw-card" data-mode="router"><div class="nw-badge nw-badge-dhcp">🌐</div>',
            '        <div class="nw-card-title">{{MODE_ROUTER_TITLE}}</div><span>{{MODE_ROUTER_DESC}}</span></div>',
            '      <div class="nw-card" data-mode="pppoe"><div class="nw-badge nw-badge-pppoe">🔑</div>',
            '        <div class="nw-card-title">{{MODE_PPPOE_TITLE}}</div><span>{{MODE_PPPOE_DESC}}</span></div>',
            '      <div class="nw-card" data-mode="lan"><div class="nw-badge nw-badge-bypass">💻</div>',
            '        <div class="nw-card-title">{{MODE_LAN_TITLE}}</div><span>{{MODE_LAN_DESC}}</span></div>',
            '    </div>',
            '    <div id="current-mode-display" style="margin-top: 45px; background: #5e72e4; padding: 20px 35px; border-radius: 12px; display: inline-block; box-shadow: 0 8px 20px rgba(94, 114, 228, 0.3); text-align: center; min-width: 320px;">',
            '       <div id="current-mode-text" style="color: #fff;"><div class="nw-spinner" style="width:30px; height:30px; border-width:3px; margin: 0 auto; border-top-color: #fff;"></div><div style="margin-top:10px; font-size:15px; font-weight:bold; color:#fff;">{{LOADING_CONFIG}}</div></div>',
            '    </div>',
            '  </div>',
            '  <div id="step-2" class="nw-step" style="display: none;">',
            '    <div class="nw-form-area">',
            '      <div class="nw-top-back" id="top-back-1" title="{{BTN_HOME}}">',
            '         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
            '      </div>',
            '      <div id="fields-router" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_WAN}}</div>',
            '        <div style="display: flex; align-items: center; width: 100%; padding: 15px 0;">',
            '          <div style="font-weight: 600; color: #222; font-size: 16px; margin-right: 35px; line-height: 1;">{{LBL_CONN_TYPE}}</div>',
            '          <div class="nw-radio-group">',
            '            <label><input type="radio" name="router_type" value="dhcp" checked> {{OPT_DHCP}}</label>',
            '            <label><input type="radio" name="router_type" value="static"> {{OPT_STATIC}}</label>',
            '          </div>',
            '        </div>',
            '        <div id="router-static-fields" style="display: none; margin-top: 10px; border-top: 1px dashed #e5e7eb; padding-top: 15px;">',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_IP}}</label><div class="nw-value-field"><input type="text" id="router-ip" placeholder="{{PH_IP}}" autocomplete="new-password"></div></div>',
            '          <div class="nw-value"><label class="nw-value-title">{{LBL_GW}}</label><div class="nw-value-field"><input type="text" id="router-gw" placeholder="{{PH_GW}}" autocomplete="new-password"></div></div>',
            '        </div>',
            '      </div>',
            '      <div id="fields-pppoe" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_PPPOE}}</div>',
            '        <div class="nw-value"><label class="nw-value-title">{{LBL_USER}}</label><div class="nw-value-field"><input type="text" id="pppoe-user" placeholder="{{PH_USER}}" autocomplete="new-password"></div></div>',
            '        <div class="nw-value"><label class="nw-value-title">{{LBL_PASS}}</label><div class="nw-value-field"><input type="password" id="pppoe-pass" placeholder="{{PH_PASS}}" autocomplete="new-password"></div></div>',
            '      </div>',
            '      <div id="fields-lan" style="display: none;">',
            '        <div class="nw-step-title">{{TITLE_LAN}}</div>',
            '        <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f1f5f9; margin-bottom: 15px;">',
            '           <div style="font-weight: 600; color: #222; font-size: 16px;">{{LBL_BYPASS}}</div>',
            '           <label class="nw-switch"><input type="checkbox" id="lan-bypass-toggle"><span class="nw-slider"></span></label>',
            '        </div>',
            '        <div id="lan-bypass-warning" style="display:none; background: #fef2f2; color: #ef4444; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 15px; border: 1px solid #fecaca; line-height: 1.7; letter-spacing: 1px; font-weight: bolder;">{{WARN_BYPASS}}</div>',
            '        <div id="lan-main-warning" style="background: #f0fdf4; color: #059669; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 15px; border: 1px solid #bbf7d0; line-height: 1.7; letter-spacing: 1px; font-weight: bolder;">{{WARN_MAIN}}</div>',
            '        <div class="nw-value"><label class="nw-value-title">{{LBL_LAN_IP}}</label><div class="nw-value-field"><input type="text" id="lan-ip" placeholder="{{PH_IP}}" autocomplete="new-password"></div></div>',
            '        <div class="nw-value"><label class="nw-value-title">{{LBL_LAN_GW}}</label><div class="nw-value-field"><input type="text" id="lan-gw" placeholder="{{PH_LAN_GW}}" autocomplete="new-password"></div></div>',
            '      </div>',
            '    </div>',
            '    <div class="nw-actions"><button id="btn-back-1" class="cbi-button cbi-button-reset">{{BTN_BACK}}</button><button id="btn-next-2" class="cbi-button cbi-button-apply">{{BTN_NEXT}}</button></div>',
            '  </div>',
            '  <div id="step-3" class="nw-step" style="display: none;">',
            '    <div class="nw-confirm-board">',
            '      <div class="nw-top-back" id="top-back-2" title="{{BTN_EDIT}}">',
            '         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
            '      </div>',
            '      <div class="nw-step-title">{{TITLE_CONFIRM}}</div>',
            '      <p style="color:#555; text-align:center;">{{DESC_CONFIRM}}</p>',
            '      <div id="confirm-mode-text" style="color: #fff; background: #3b82f6; padding: 20px; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); margin-top: 15px;"></div>',
            '      <div style="background-color: #f8fafc; padding: 15px; font-size: 13.5px; margin-top: 20px; border: 1px solid #e2e8f0; line-height: 1.7; color: #475569; border-radius: 12px;">',
            '        <div style="font-weight: bold; color: #0f172a; margin-bottom: 8px; font-size: 14.5px;">{{NOTE_TITLE}}</div>',
            '        <div style="display: flex; gap: 8px;"><span style="color:#3b82f6;">•</span> <span>{{NOTE_1}}</span></div>',
            '        <div style="display: flex; gap: 8px;"><span style="color:#10b981;">•</span> <span>{{NOTE_2}}</span></div>',
            '      </div>',
            '    </div>',
            '    <div class="nw-actions"><button id="btn-back-2" class="cbi-button cbi-button-reset">{{BTN_BACK}}</button><button id="btn-apply" class="cbi-button cbi-button-apply">{{BTN_APPLY}}</button></div>',
            '  </div>',
            '</div>'
        ].join('');

        for (var k in T) {
            htmlTemplate = htmlTemplate.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), T[k]);
        }
        container.innerHTML = htmlTemplate;

        this.bindEvents(container);
        return container;
    },

    bindEvents: function (container) {
        var step1 = container.querySelector('#step-1'), step2 = container.querySelector('#step-2'), step3 = container.querySelector('#step-3');
        var confirmText = container.querySelector('#confirm-mode-text'), modeTextEl = container.querySelector('#current-mode-text');
        var selectedMode = '';

        function safePromise(p, f) { return new Promise(function(r) { var t = setTimeout(function() { r(f); }, 3000); if (!p || !p.then) { clearTimeout(t); return r(f); } p.then(function(res) { clearTimeout(t); r(res); }).catch(function() { clearTimeout(t); r(f); }); }); }
        function safeUciGet(c, s, o, d) { try { var v = uci.get(c, s, o); return (v === null || v === undefined) ? d : String(v).trim(); } catch(e) { return d; } }

        // 获取并显示当前的底层配置状态
        function updateStatusDisplay(isSilent) {
            try {
                if (modeTextEl && !isSilent) modeTextEl.innerHTML = "<div class='nw-spinner' style='width:30px; height:30px; border-width:3px; margin: 0 auto; border-top-color: #fff;'></div><div style='margin-top:10px; font-size:15px; font-weight:bold; color:#fff;'>" + T['LOADING_CONFIG'] + "</div>";
                try { uci.unload('network'); uci.unload('dhcp'); } catch(e) {}

                Promise.all([
                    safePromise(uci.load('network'), null), safePromise(uci.load('dhcp'), null), safePromise(getWanStatus(), {})
                ]).then(function(results) {
                    var rawIfaces = results[2] || {}, ifaces = Array.isArray(rawIfaces.interface) ? rawIfaces.interface : (Array.isArray(rawIfaces) ? rawIfaces : []);
                    var wProto = safeUciGet('network', 'wan', 'proto', '').toLowerCase();
                    var activeWan = ifaces.find(function(i) { return i && (i.interface === 'wan' || i.proto === wProto || i.device === 'eth0' || i.device === 'wan'); }) || {};
                    var liveWanIp = ((activeWan['ipv4-address'] && activeWan['ipv4-address'][0]) ? activeWan['ipv4-address'][0].address : '').split('/')[0];
                    var liveGw = activeWan.nexthop || (activeWan['ipv4-address'] && activeWan['ipv4-address'][0] ? activeWan['ipv4-address'][0].ptpaddress : '') || T['TXT_GETTING'];
                    var wIp = safeUciGet('network', 'wan', 'ipaddr', T['TXT_NOT_GOT']).split('/')[0], wGw = safeUciGet('network', 'wan', 'gateway', T['TXT_NOT_SET']); 
                    var lIp = safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0], lGw = safeUciGet('network', 'lan', 'gateway', T['TXT_NOT_SET']), lIgnore = safeUciGet('dhcp', 'lan', 'ignore', ''), isBypass = (lIgnore === '1' || lIgnore === 'true' || lIgnore === 'on' || lIgnore === 'yes');

                    if (container.querySelector('#pppoe-user')) container.querySelector('#pppoe-user').value = safeUciGet('network', 'wan', 'username', '');
                    if (container.querySelector('#pppoe-pass')) container.querySelector('#pppoe-pass').value = safeUciGet('network', 'wan', 'password', '');
                    if (container.querySelector('#router-ip')) container.querySelector('#router-ip').value = (wIp !== T['TXT_NOT_GOT']) ? wIp : '';
                    if (container.querySelector('#router-gw')) container.querySelector('#router-gw').value = (wGw !== T['TXT_NOT_SET']) ? wGw : '';
                    if (container.querySelector('#lan-ip')) container.querySelector('#lan-ip').value = lIp;
                    if (container.querySelector('#lan-gw')) container.querySelector('#lan-gw').value = (lGw !== T['TXT_NOT_SET']) ? lGw : '';
                    
                    var bypassToggle = container.querySelector('#lan-bypass-toggle');
                    if (bypassToggle) {
                        bypassToggle.checked = isBypass;
                        container.querySelector('#lan-bypass-warning').style.display = isBypass ? 'block' : 'none';
                        container.querySelector('#lan-main-warning').style.display = isBypass ? 'none' : 'block';
                    }

                    // 修复手机端UI排版：使用 flex-wrap 和 white-space 防止换行断裂
                    var mkB = function(bg, txt) { return "<span style='font-size:12px; background:" + bg + "; color:#fff; padding:3px 10px; border-radius:12px; white-space:nowrap;'>" + txt + "</span>"; };
                    var mkD = function(l1, v1, l2, v2) { return "<span style='white-space:nowrap; margin: 0 10px;'>" + l1 + " <span class='nw-hl'>" + v1 + "</span></span><span style='white-space:nowrap; margin: 0 10px;'>" + l2 + " <span class='nw-hl'>" + v2 + "</span></span>"; };

                    var sTitle = "", sDetails = "", statusBadge = "";
                    if (isBypass) { sTitle = T['STAT_BYPASS']; sDetails = mkD(T['TXT_DEV_IP'], lIp, T['TXT_UP_GW'], lGw);
                    } else if (wProto === 'pppoe') { sTitle = T['STAT_MAIN_PPPOE'];
                        if (activeWan.up && liveWanIp) { statusBadge = mkB('#10b981', T['BDG_SUCC']); sDetails = mkD(T['TXT_PUB_IP'], liveWanIp, T['TXT_REM_GW'], liveGw);
                        } else { statusBadge = mkB('#ef4444', T['BDG_DIAL']); sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_STATUS'], T['TXT_WAIT_REM']); }
                    } else if (wProto === 'dhcp') { sTitle = T['STAT_SEC_DHCP'];
                        if (activeWan.up && liveWanIp) { statusBadge = mkB('#10b981', T['BDG_GOT']); sDetails = mkD(T['TXT_WAN_IP'], liveWanIp, T['TXT_UP_GW'], liveGw);
                        } else { statusBadge = mkB('#f59e0b', T['BDG_WAIT']); sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_STATUS'], T['TXT_GET_IP']); }
                    } else if (wProto === 'static') { sTitle = T['STAT_SEC_STATIC'];
                        statusBadge = activeWan.up ? mkB('#10b981', T['BDG_CONN']) : mkB('#ef4444', T['BDG_UNPLUG']);
                        sDetails = mkD(T['TXT_WAN_IP'], wIp, T['TXT_UP_GW'], wGw);
                    } else { sTitle = T['STAT_LAN']; sDetails = mkD(T['TXT_LAN_IP'], lIp, T['TXT_DHCP_SRV'], T['TXT_ON']); }

                    if (modeTextEl) modeTextEl.innerHTML = "<div style='font-size:17px; font-weight:600; margin-bottom:12px; color:#ffffff; font-family: monospace; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;'><span style='white-space:nowrap;'>" + sTitle + "</span>" + statusBadge + "</div>" + "<div style='font-size:14.5px; font-weight:bold; color:#ffffff; font-family:monospace; letter-spacing:0.5px; display:flex; flex-wrap:wrap; justify-content:center; line-height: 1.8;'>" + sDetails + "</div>";
                
                // 底层异常捕捉，切勿删除
                }).catch(function() { if (modeTextEl) modeTextEl.innerHTML = "<div style='color:#ef4444; font-weight:bold;'>" + T['ERR_RD_SYS'] + "</div>"; });
            } catch(e) { if (modeTextEl) modeTextEl.innerHTML = "<div style='color:#ef4444; font-weight:bold;'>" + T['ERR_CRASH'] + "</div>"; }
        }
        
        updateStatusDisplay(false);
        setInterval(function() { if (step1.style.display !== 'none' && container.querySelector('#nw-global-modal').style.display === 'none') updateStatusDisplay(true); }, 5000);

        // IP 和网关的基础校验逻辑
        function calculateNetmask(ip) { if (!ip) return '255.255.255.0'; var b = parseInt(ip.split('.')[0], 10); if (b >= 1 && b <= 126) return '255.0.0.0'; if (b >= 128 && b <= 191) return '255.255.0.0'; return '255.255.255.0'; }
        function isValidIP(ip) { if (!ip) return false; var p = ip.split('.'); if (p.length !== 4) return false; for (var i = 0; i < 4; i++) { var n = parseInt(p[i], 10); if (isNaN(n) || n < 0 || n > 255 || String(n) !== p[i]) return false; } if (p[0] === '0' || p[0] === '127') return false; var l = parseInt(p[3], 10); return (l !== 0 && l !== 255); }
        function isSameSubnet(ip1, ip2) { if (!ip1 || !ip2) return false; var p1 = ip1.split('.'), p2 = ip2.split('.'); return (p1.length === 4 && p2.length === 4 && p1[0] === p2[0] && p1[1] === p2[1] && p1[2] === p2[2]); }

        // 弹窗控制逻辑
        function openModal(o) { var m = container.querySelector('#nw-global-modal'); container.querySelector('#nw-global-title').innerHTML = o.title || ''; container.querySelector('#nw-global-msg').innerHTML = o.msg || ''; container.querySelector('#nw-global-spinner').style.display = o.spin ? 'block' : 'none'; var w = container.querySelector('#nw-global-btn-wrap'), ok = container.querySelector('#nw-global-btn-ok'), can = container.querySelector('#nw-global-btn-cancel'); w.style.display = (o.okText || o.cancelText) ? 'flex' : 'none'; if (o.okText) { ok.style.display = 'block'; ok.innerText = o.okText; ok.className = o.isDanger ? 'nw-modal-btn-danger' : 'nw-modal-btn-ok'; ok.onclick = function() { if (o.onOk) o.onOk(); else m.style.display = 'none'; }; } else ok.style.display = 'none'; if (o.cancelText) { can.style.display = 'block'; can.innerText = o.cancelText; can.onclick = function() { if (o.onCancel) o.onCancel(); else m.style.display = 'none'; }; } else can.style.display = 'none'; m.style.display = 'flex'; }
        function returnToStep1() { container.querySelector('#nw-global-modal').style.display = 'none'; step3.style.display = 'none'; step2.style.display = 'none'; step1.style.display = 'block'; }

        container.querySelectorAll('input[name="router_type"]').forEach(function(r) { r.addEventListener('change', function() { container.querySelector('#router-static-fields').style.display = (this.value === 'static') ? 'block' : 'none'; }); });
        var bypassToggle = container.querySelector('#lan-bypass-toggle');
        bypassToggle.addEventListener('change', function() { container.querySelector('#lan-bypass-warning').style.display = this.checked ? 'block' : 'none'; container.querySelector('#lan-main-warning').style.display = this.checked ? 'none' : 'block'; });

        // 绑定卡片点击事件以切换模式
        container.querySelectorAll('.nw-card').forEach(function (card) {
            card.addEventListener('click', function () {
                selectedMode = card.getAttribute('data-mode');
                step1.style.display = 'none';
                container.querySelector('#fields-router').style.display = (selectedMode === 'router') ? 'block' : 'none';
                container.querySelector('#fields-pppoe').style.display = (selectedMode === 'pppoe') ? 'block' : 'none';
                container.querySelector('#fields-lan').style.display = (selectedMode === 'lan') ? 'block' : 'none';
                step2.style.display = 'block';
            });
        });

        // 页面切换按钮绑定
        container.querySelector('#btn-back-1').addEventListener('click', function () { step2.style.display = 'none'; step1.style.display = 'block'; });
        container.querySelector('#top-back-1').addEventListener('click', function () { step2.style.display = 'none'; step1.style.display = 'block'; });
        container.querySelector('#btn-back-2').addEventListener('click', function () { step3.style.display = 'none'; step2.style.display = 'block'; });
        container.querySelector('#top-back-2').addEventListener('click', function () { step3.style.display = 'none'; step2.style.display = 'block'; });

        // 下一步：数据校验逻辑
        container.querySelector('#btn-next-2').addEventListener('click', function () {
            try {
                var rType = container.querySelector('input[name="router_type"]:checked').value, targetIp = '', targetGw = '', isBypass = false;
                if (selectedMode === 'lan') { targetIp = container.querySelector('#lan-ip').value.trim(); targetGw = container.querySelector('#lan-gw').value.trim(); isBypass = bypassToggle.checked;
                    if (!targetIp) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_IP'], okText:T['BTN_EDIT']}); return; }
                    if (!isValidIP(targetIp)) { openModal({title:T['M_FMT_TIT'], msg:T['M_FMT_IP'], okText:T['BTN_EDIT']}); return; }
                    if (isBypass && (!targetGw || !isValidIP(targetGw))) { openModal({title: (targetGw?T['M_FMT_TIT']:T['M_LOGIC_TIT']), msg: (targetGw?T['M_FMT_GW']:T['M_LOGIC_BYP']), okText:T['BTN_EDIT']}); return; }
                } else if (selectedMode === 'router' && rType === 'static') { targetIp = container.querySelector('#router-ip').value.trim(); targetGw = container.querySelector('#router-gw').value.trim();
                    if (!targetIp || !targetGw) { openModal({title:T['M_INC_TIT'], msg:T['M_INC_WAN'], okText:T['BTN_EDIT']}); return; }
                    if (!isValidIP(targetIp) || !isValidIP(targetGw)) { openModal({title:T['M_FMT_TIT'], msg:(!isValidIP(targetIp)?T['M_FMT_WAN']:T['M_FMT_GW']), okText:T['BTN_EDIT']}); return; }
                } else if (selectedMode === 'pppoe') { if (!container.querySelector('#pppoe-user').value.trim() || !container.querySelector('#pppoe-pass').value.trim()) { openModal({title: T['M_INC_TIT'], msg: T['M_INC_PPPOE'], okText: T['BTN_EDIT']}); return; } }

                uci.load('network').then(function() {
                    var currentLanIp = safeUciGet('network', 'lan', 'ipaddr', window.location.hostname).split('/')[0], currentLanGw = safeUciGet('network', 'lan', 'gateway', ''), currentWanProto = safeUciGet('network', 'wan', 'proto', '').toLowerCase();
                    var currentWanIp = (currentWanProto === 'static') ? safeUciGet('network', 'wan', 'ipaddr', '').split('/')[0] : '', currentWanGw = safeUciGet('network', 'wan', 'gateway', ''), currentBypass = (safeUciGet('dhcp', 'lan', 'ignore', '') === '1' ? '1' : '0'), newBypass = bypassToggle.checked ? '1' : '0';
                    
                    if ((selectedMode === 'lan' && targetIp === currentLanIp && targetGw === currentLanGw && newBypass === currentBypass) || (selectedMode === 'router' && rType === 'static' && targetIp === currentWanIp && targetGw === currentWanGw) || (selectedMode === 'router' && rType === 'dhcp' && currentWanProto === 'dhcp')) { openModal({title: T['M_NO_MOD_TIT'], msg: T['M_NO_MOD_MSG'], okText: T['M_EXIT'], onOk: returnToStep1 }); return; }
                    
                    // 防呆：处理 IP 与网关的冲突逻辑
                    if (selectedMode === 'router' && rType === 'static') { 
                        if (targetIp === currentLanIp || isSameSubnet(targetIp, currentLanIp)) { 
                            openModal({title:T['M_CFLT_TIT'], msg: (targetIp === currentLanIp ? T['M_CFLT_IP'].replace('{ip}', currentLanIp) : T['M_CFLT_SUB1'].replace('{ip}', currentLanIp) + '<br>' + T['M_CFLT_SUB2']), okText:T['BTN_EDIT']}); return; 
                        } 
                        if (targetIp === targetGw || !isSameSubnet(targetIp, targetGw)) { 
                            openModal({title:(targetIp===targetGw?T['M_LOGIC_TIT']:T['M_SUB_ERR_TIT']), msg:(targetIp===targetGw?T['M_SAME_GW'] : T['M_SUB_ERR_WAN1'] + '<br>' + T['M_SUB_ERR_WAN2'].replace('{gw}', targetGw).replace('{ip}', targetGw.substring(0, targetGw.lastIndexOf('.')))), okText:T['BTN_EDIT']}); return; 
                        } 
                    }
                    
                    if (selectedMode === 'lan') { 
                        if (isBypass && (targetIp === targetGw || !isSameSubnet(targetIp, targetGw))) { 
                            openModal({title:(targetIp===targetGw?T['M_LOGIC_TIT']:T['M_SUB_ERR_TIT']), msg:(targetIp===targetGw?T['M_SAME_BYP']:T['M_SUB_ERR_BYP']), okText:T['BTN_EDIT']}); return; 
                        } 
                        if (currentWanIp && (targetIp === currentWanIp || isSameSubnet(targetIp, currentWanIp))) { 
                            openModal({title:T['M_CFLT_TIT'], msg:(targetIp===currentWanIp ? T['M_CFLT_LAN_IP'].replace('{ip}', currentWanIp) : T['M_CFLT_LAN_SUB'].replace('{ip}', currentWanIp) + '<br>' + T['M_CFLT_SUB2']), okText:T['BTN_EDIT']}); return; 
                        } 
                    }

                    // 动态生成确认画面的内容
                    var b = function(t, p) { var h = "<div style='text-align:center; font-size:18px; margin-bottom:15px;'>" + t + "</div><div style='background:rgba(0,0,0,0.15); border-radius:8px; padding:10px 15px; font-size:14.5px;'>"; for (var i=0; i < p.length; i++) h += "<div style='display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.1);'><span style='opacity:0.8;'>" + p[i][0] + "</span><span style='font-family:monospace;'>" + p[i][1] + "</span></div>"; return h + "</div>"; };
                    if (selectedMode === 'lan') confirmText.innerHTML = b(isBypass ? T['MODE_LAN_TITLE']+" - "+T['STAT_BYPASS'] : T['MODE_LAN_TITLE']+" - "+T['STAT_LAN'], [[T['TXT_DEV_IP'].replace(':',''), targetIp], [T['LBL_GW'], targetGw || T['TXT_NOT_SET']], ["DHCP", isBypass ? T['TXT_OFF'] : T['TXT_ON']]]);
                    else if (selectedMode === 'router') confirmText.innerHTML = (rType === 'static' ? b(T['STAT_SEC_STATIC'], [[T['TXT_WAN_IP'].replace(':',''), targetIp], [T['TXT_UP_GW'].replace(':',''), targetGw]]) : b(T['STAT_SEC_DHCP'], [[T['LBL_CONN_TYPE'], T['OPT_DHCP']], [T['M_IP_GW'], T['M_AUTO_UP']]]));
                    else confirmText.innerHTML = b(T['MODE_PPPOE_TITLE'], [[T['M_ACCT'], container.querySelector('#pppoe-user').value], [T['M_PWD'], T['M_HIDDEN']]]);
                    
                    // 特殊情况警告拦截
                    if (selectedMode === 'lan' && !isBypass && targetGw !== '') { openModal({ title: T['M_WARN_TIT'], msg: T['M_WARN_MSG'], cancelText: T['BTN_EDIT'], okText: T['M_WARN_BTN'], isDanger: true, onOk: function() { m.style.display = 'none'; step2.style.display = 'none'; step3.style.display = 'block'; } }); return; }
                    step2.style.display = 'none'; step3.style.display = 'block';
                });
            } catch (e) { openModal({title:T['ERR_RD_SYS'], msg:T['ERR_CRASH'], okText:T['M_CLOSE']}); }
        });

        // 最终提交：向后端 RPC 发送写入请求
        container.querySelector('#btn-apply').addEventListener('click', function () {
            var mode = selectedMode, a1 = '', a2 = '', a3 = '', a4 = '', rType = container.querySelector('input[name="router_type"]:checked').value;
            if (selectedMode === 'lan') { a1 = container.querySelector('#lan-ip').value.trim(); a2 = container.querySelector('#lan-gw').value.trim(); a3 = calculateNetmask(a1); a4 = bypassToggle.checked ? '1' : '0';
            } else if (selectedMode === 'router') { mode = (rType === 'dhcp') ? 'wan_dhcp' : 'wan_static'; if(rType === 'static') { a1 = container.querySelector('#router-ip').value.trim(); a2 = container.querySelector('#router-gw').value.trim(); a3 = calculateNetmask(a1); }
            } else if (selectedMode === 'pppoe') { a1 = container.querySelector('#pppoe-user').value; a2 = container.querySelector('#pppoe-pass').value; }

            openModal({title:T['M_APP_TIT'], msg:T['M_APP_MSG'], spin:true});
            var start = Date.now(), done = false;
            var succ = function() {
                var h = window.location.hostname, ts = new Date().getTime();
                // 若修改了 LAN IP，尝试重定向至新地址
                if (selectedMode === 'lan' && a1 && a1 !== h) { 
                    var succHtml = T['M_SUCC_MSG1'].replace('{ip}', '<b style="color:#3b82f6;">' + a1 + '</b>') + '<br>' + T['M_SUCC_MSG2'] + '<br><br><small>' + T['M_SUCC_MSG3'] + '</small>';
                    openModal({ title: T['M_SUCC_TIT'], msg: succHtml, spin: true }); 
                    setTimeout(function() { window.location.href = 'http://' + a1 + '?v=' + ts; }, 15000);
                } else { 
                    openModal({ title: T['M_RST_TIT'], msg: T['M_RST_MSG'], spin: true }); 
                    setTimeout(function() { window.location.href = window.location.href.split('?')[0] + '?v=' + ts; }, 15000); 
                }
            };
            callNetSetup(mode, a1, a2, a3, a4).then(function() { done = true; succ(); }).catch(function(e){ 
                if (Date.now() - start < 1500) { 
                    done = true; 
                    var failHtml = T['M_FAIL_MSG'] + '<br><small>' + T['M_FAIL_CODE'].replace('{code}', (e.message || 'Unknown')) + '</small>';
                    openModal({ title: T['M_FAIL_TIT'], msg: failHtml, okText: T['M_CLOSE'], isDanger: true }); 
                } else { 
                    done = true; succ(); 
                } 
            });
            setTimeout(function() { if (!done) succ(); }, 8000);
        });
    }
});
