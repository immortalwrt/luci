#!/bin/sh
# Copyright (C) 2026 huchd0 <https://github.com/huchd0/luci-app-netwiz>
# Licensed under the GNU General Public License v3.0

# 日志统一存放在 /tmp/ 下，避免损耗路由器闪存
LOG_FILE="/tmp/netwiz.log"
LOCK_FILE="/var/run/netwiz_autodetect.lock"

# 定义最大保留500行
MAX_LINES=500

log() {
    # 写入新日志
    echo "$(date '+%F %T') [Monitor] $1" >> "$LOG_FILE"
    
    # 自动删除
    # 日志超过 600 行时，自动删除，只保留最新的 500 行
    if [ $(wc -l < "$LOG_FILE" 2>/dev/null || echo 0) -gt 600 ]; then
        tail -n $MAX_LINES "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
}

# 获取当前的 WAN 网卡名称
WAN_DEV=$(uci -q get network.wan.device)
[ -z "$WAN_DEV" ] && WAN_DEV=$(uci -q get network.wan.ifname)
[ -z "$WAN_DEV" ] && WAN_DEV="eth0"

# 检查 WAN 口物理连接状态
check_wan_link() {
    if ubus call network.device status "{\"name\":\"$WAN_DEV\"}" 2>/dev/null | grep -q '"carrier": true'; then
        echo "up"
    else
        echo "down"
    fi
}

LAST_WAN_STATE=$(check_wan_link)
# 记录连续断开的次数，用于防抖
DOWN_COUNT=0

log "服务已启动，正在监控 WAN 插拔和 LAN 回退定时器"

while true; do
    # --- 1. WAN 接口插拔监控 (带防抖逻辑) ---
    CURRENT_WAN_STATE=$(check_wan_link)
    
    # 如果自动探测引擎没有在运行，才执行监控
    if [ ! -f "$LOCK_FILE" ]; then
        if [ "$CURRENT_WAN_STATE" = "down" ]; then
            # 发现断开，累加次数
            DOWN_COUNT=$((DOWN_COUNT+1))
        else
            # 发现连通，检查之前是否真的拔出过
            if [ "$LAST_WAN_STATE" = "down" ]; then
                # 只有断开超过 3 个周期 (约 9 秒)，才认为是人工插拔
                if [ "$DOWN_COUNT" -ge 3 ]; then
                    log "确认 WAN 口物理插拔，正在启动探测引擎"
                    /usr/libexec/netwiz-autodetect.sh >/dev/null 2>&1 </dev/null &
                else
                    log "忽略短时间的软件网络波动"
                fi
            fi
            DOWN_COUNT=0
        fi
        LAST_WAN_STATE="$CURRENT_WAN_STATE"
    fi

    # --- 2. LAN 接口防失联雷达与炸弹 ---
    if [ -f /tmp/netwiz_rollback_time ] && [ -f /tmp/netwiz_target_ip ]; then
        TARGET_IP=$(cat /tmp/netwiz_target_ip 2>/dev/null)
        
        # 不仅查并发数，还要强制校验“客户端 IP 子网”！
        # 只有当您的电脑 IP (如 192.168.10.100) 和目标 IP (192.168.10.1) 在同一个 /24 网段时，才算有效连接！
        conns=$(netstat -nt 2>/dev/null | awk -v tip="$TARGET_IP" '
        BEGIN {
            # 提取目标 IP 的前三段作为基准前缀 (例如 192.168.10.)
            split(tip, p, ".")
            prefix = p[1]"."p[2]"."p[3]"."
        }
        /ESTABLISHED/ {
            if ($4 == tip":80" || $4 == tip":443") {
                split($5, c, ":")
                client_ip = c[1]
                # 客户端 IP 的前缀不等于目标 IP 的前缀，直接无视！
                if (substr(client_ip, 1, length(prefix)) == prefix) {
                    count++
                }
            }
        }
        END { print count+0 }
        ')

        # 阈值依然是 2，完美过滤前端的单线程探针
        if [ "$conns" -ge 2 ]; then
            log "成功：雷达检测到同网段真实浏览器访问新 IP ($TARGET_IP)，自动解除定时"
            # 彻底清理所有相关的临时文件和备份
            rm -f /tmp/netwiz_rollback_time /tmp/netwiz_target_ip /etc/config/network.netwiz_bak /etc/config/dhcp.netwiz_bak
        else
            log "等待用户浏览器跳转中... (当前有效目标连接数: $conns)"

            # 读取时间方式：剔除任何可能的空行或隐藏符号
            TARGET_TIME=$(cat /tmp/netwiz_rollback_time 2>/dev/null | tr -cd '0-9')
            CURRENT_TIME=$(date +%s)
            
            # 只有读到了纯数字时间，且当前时间大于目标时间，才执行回退
            if [ -n "$TARGET_TIME" ] && [ "$CURRENT_TIME" -ge "$TARGET_TIME" ]; then
                log "时间到！未检测到任何浏览器访问，确认为失联，开始执行强制性回退"
                rm -f /tmp/netwiz_rollback_time /tmp/netwiz_target_ip
                
                # 从 /tmp/ 读取纯净备份，并使用 cat 暴力覆盖以防权限断裂
                if [ -f /etc/config/network.netwiz_bak ]; then
                    log "正在从闪存中恢复原始配置..."
                    cat /etc/config/network.netwiz_bak > /etc/config/network
                    [ -f /etc/config/dhcp.netwiz_bak ] && cat /etc/config/dhcp.netwiz_bak > /etc/config/dhcp
                    
                    (
                        exec >/dev/null 2>&1 </dev/null
                        /etc/init.d/network restart
                        /etc/init.d/dnsmasq restart
                        /etc/init.d/uhttpd restart
                        sleep 3
                        echo "$(date '+%F %T') [Monitor] 回退操作已全部完成，网络已强制恢复旧 IP" >> "$LOG_FILE"
                        # 恢复完后删除闪存备份
                        rm -f /etc/config/network.netwiz_bak /etc/config/dhcp.netwiz_bak
                    ) &
                fi
            fi
        fi
    fi

    # 每 3 秒执行一次检查
    sleep 3
done
