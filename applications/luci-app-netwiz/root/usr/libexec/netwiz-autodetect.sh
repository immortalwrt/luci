#!/bin/sh
# Copyright (C) 2026 huchd0 <https://github.com/huchd0/luci-app-netwiz>
# Licensed under the GNU General Public License v3.0

LOG_FILE="/tmp/netwiz.log"

log() {
    echo "$(date '+%F %T') [Engine] $1" >> "$LOG_FILE"
    if [ $(wc -l < "$LOG_FILE" 2>/dev/null || echo 0) -gt 600 ]; then
        tail -n 500 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

# === 智能推算子网掩码 ===
calc_netmask() {
    local ip="$1"
    local b="${ip%%.*}"
    case "$b" in ''|*[!0-9]*) echo "255.255.255.0"; return ;; esac
    
    if [ "$b" -ge 1 ] && [ "$b" -le 126 ]; then
        echo "255.0.0.0"
    elif [ "$b" -ge 128 ] && [ "$b" -le 191 ]; then
        echo "255.255.0.0"
    else
        echo "255.255.255.0"
    fi
}

LOCK_FILE="/var/run/netwiz_autodetect.lock"
# WAN 备份名，与 LAN 向导的备份隔离
BAK_FILE="/etc/config/network.netwiz_wan_bak"

# ================= 退出与异常清理机制 =================
cleanup() {
    rm -f "$LOCK_FILE"
    # 如果脚本退出时，备份文件依然存在，说明脚本被意外中止
    if [ -f "$BAK_FILE" ]; then
        log "⚠️ 检测到脚本被外部异常中断，触发安全清理，正在恢复原配置..."
        cp "$BAK_FILE" /etc/config/network
        rm -f "$BAK_FILE"
        /etc/init.d/network reload &
    fi
}
# 捕获 EXIT(正常或报错退出), INT(Ctrl+C), TERM(系统kill)
trap cleanup EXIT INT TERM
# ==========================================================

# 防止 kill -9 (强制抹杀，不触发 trap) 导致的残酷遗留
if [ -f "$BAK_FILE" ] && [ ! -f "$LOCK_FILE" ]; then
    log "警告：发现无主遗留备份文件，先恢复配置..."
    cp "$BAK_FILE" /etc/config/network
    rm -f "$BAK_FILE"
fi

if [ -f "$LOCK_FILE" ]; then exit 0; fi
touch "$LOCK_FILE"

WAN_DEV=$(uci -q get network.wan.device)
[ -z "$WAN_DEV" ] && WAN_DEV=$(uci -q get network.wan.ifname)
[ -z "$WAN_DEV" ] && WAN_DEV="eth0"

wait_for_internet() {
    local max_wait=20
    local i=0
    local offline_strikes=0
    
    while [ $i -lt $max_wait ]; do
        if ! ubus call network.device status "{\"name\":\"$WAN_DEV\"}" 2>/dev/null | grep -q '"carrier": true'; then
            offline_strikes=$((offline_strikes+1))
        else
            offline_strikes=0
        fi
        
        if [ $offline_strikes -ge 3 ]; then
            log "检测到网线已物理拔出，终止探测"
            return 1
        fi
        
        # 多目标 Ping，只要一个通就算有网
        if ping -c 1 -W 1 223.5.5.5 >/dev/null 2>&1 || \
           ping -c 1 -W 1 114.114.114.114 >/dev/null 2>&1 || \
           ping -c 1 -W 1 8.8.8.8 >/dev/null 2>&1; then
            return 0
        fi
        sleep 2
        i=$((i+1))
    done
    return 1
}

log "检测到 WAN 口网线插入，启动自动探测引擎..."
sleep 5
if wait_for_internet; then 
    log "当前配置网络正常，无需切换协议"
    exit 0
fi

log "当前配置无法连通互联网，准备进行协议切换探测"
cp /etc/config/network "$BAK_FILE"
sync

ORIG_PROTO=$(uci -q get network.wan.proto)
HAS_PPPOE_USER=$(uci -q get network.wan.username)
SAVED_STATIC_IP=$(uci -q get network.wan.ipaddr)
SAVED_STATIC_GW=$(uci -q get network.wan.gateway)
SAVED_STATIC_MASK=$(uci -q get network.wan.netmask)
success=0

# 1、切换DHCP
if [ "$ORIG_PROTO" != "dhcp" ]; then
    log "正在尝试通过 DHCP 自动获取 IP 地址..."
    uci set network.wan.proto='dhcp'
    uci commit network
    /etc/init.d/network reload
    if wait_for_internet; then success=1; fi
fi

test_static_ip() {
    local try_mask="$1"
    log "正在探测静态 IP: $SAVED_STATIC_IP，网关: $SAVED_STATIC_GW，掩码: $try_mask"
    cp "$BAK_FILE" /etc/config/network 
    uci set network.wan.proto='static'
    uci set network.wan.ipaddr="$SAVED_STATIC_IP"
    uci set network.wan.gateway="$SAVED_STATIC_GW"
    uci set network.wan.netmask="$try_mask"
    uci commit network
    /etc/init.d/network reload
    if wait_for_internet; then return 0; else return 1; fi
}

# 2、切换静态 IP
if [ "$success" -eq 0 ] && [ "$ORIG_PROTO" != "static" ] && [ -n "$SAVED_STATIC_IP" ] && [ -n "$SAVED_STATIC_GW" ]; then
    CALC_MASK=$(calc_netmask "$SAVED_STATIC_IP")
    
    if [ -n "$SAVED_STATIC_MASK" ]; then
        if test_static_ip "$SAVED_STATIC_MASK"; then
            success=1
        else
            if [ "$SAVED_STATIC_MASK" != "$CALC_MASK" ]; then
                log "原掩码无响应，尝试切换为推算掩码再试..."
                if test_static_ip "$CALC_MASK"; then success=1; fi
            fi
        fi
    else
        if test_static_ip "$CALC_MASK"; then success=1; fi
    fi
fi

# 3、切换 PPPoE
if [ "$success" -eq 0 ] && [ "$ORIG_PROTO" != "pppoe" ] && [ -n "$HAS_PPPOE_USER" ]; then
    log "前置探测均失败，正在探测 PPPoE 服务器..."
    cp "$BAK_FILE" /etc/config/network
    uci set network.wan.proto='pppoe'
    uci commit network
    /etc/init.d/network reload
    if wait_for_internet; then success=1; fi
fi

# === 最终 ===
if [ "$success" -eq 1 ]; then
    log "新协议探测连通成功，已保存配置"
    rm -f "$BAK_FILE"
else
    log "未检测到有效的网络协议，正在回退到原始配置"
    cp "$BAK_FILE" /etc/config/network
    rm -f "$BAK_FILE"
    /etc/init.d/network reload
fi

# 正常退出时，清理变量已消除，Trap 将只执行清理 LOCK_FILE
exit 0
