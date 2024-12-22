#!/bin/sh
. /lib/functions.sh
/etc/init.d/zerotier running
[ "$?" -eq "0" ] || exit 1

# see https://openwrt.org/docs/guide-user/firewall/firewall_configuration
nft_incdir="/usr/share/nftables.d/chain-pre"
rm -f "$nft_incdir/input/zerotier.nft" "$nft_incdir/forward/zerotier.nft" "$nft_incdir/srcnat/zerotier.nft"

[ -d "$nft_incdir/input" ] || mkdir -p "$nft_incdir/input"

primaryPort=$(zerotier-cli -j info 2>&1 | jsonfilter -q -e '@.config.settings.primaryPort')
if [ -n "$primaryPort" ]; then
	echo "udp dport $primaryPort counter accept comment \"!fw4: Allow-ZeroTier-Inbound(primaryPort)\"" >> "$nft_incdir/input/zerotier.nft"
	logger -t "zerotier" "primaryPort $primaryPort rules added!"
fi

secondaryPort=$(zerotier-cli -j info 2>&1 | jsonfilter -q -e '@.config.settings.secondaryPort')
if [ -n "$secondaryPort" ]; then
	echo "udp dport $secondaryPort counter accept comment \"!fw4: Allow-ZeroTier-Inbound(secondaryPort)\"" >> "$nft_incdir/input/zerotier.nft"
	logger -t "zerotier" "secondaryPort $secondaryPort rules added!"
fi

zerotier_nat() {
	local cfg="$1"
	local id auto_nat
	local portDeviceName ip_segment
	config_get id "$cfg" 'id'
	config_get_bool auto_nat "$cfg" 'auto_nat' 0
	echo "id $id"
	if [ -n "$id" -a "$auto_nat" -eq "1" ]; then
		portDeviceName=$(zerotier-cli -j listnetworks 2>&1 | jsonfilter -q -e "@[@.nwid=\"$id\"].portDeviceName")
		[ -n "$portDeviceName" ] || return 0
		echo "$portDeviceName"
		[ -d "$nft_incdir/input" ] || mkdir -p "$nft_incdir/input"
		[ -d "$nft_incdir/forward" ] || mkdir -p "$nft_incdir/forward"
		[ -d "$nft_incdir/srcnat" ] || mkdir -p "$nft_incdir/srcnat"
		ip_segment="$(ip route | grep "dev $portDeviceName proto kernel" | awk '{print $1}')"
		echo "iifname $portDeviceName counter accept comment \"!fw4: Zerotier allow inbound $portDeviceName\"" >> "$nft_incdir/input/zerotier.nft"
		echo "iifname $portDeviceName counter accept comment \"!fw4: Zerotier allow inbound forward $portDeviceName\"" >> "$nft_incdir/forward/zerotier.nft"
		echo "oifname $portDeviceName counter accept comment \"!fw4: Zerotier allow outbound forward $portDeviceName\"" >> "$nft_incdir/forward/zerotier.nft"
		echo "oifname $portDeviceName counter masquerade comment \"!fw4: Zerotier $portDeviceName outbound postrouting masq\"" >> "$nft_incdir/srcnat/zerotier.nft"
		[ -z "$ip_segment" ] || echo "ip saddr $ip_segment counter masquerade comment \"!fw4: Zerotier $ip_segment postrouting masq\"" >> "$nft_incdir/srcnat/zerotier.nft"
		logger -t "zerotier" "interface $id auto nat rules added!"
	fi

}
config_load zerotier
config_foreach zerotier_nat 'network'

uci -q set firewall.@defaults[0].auto_includes="1"
uci -q commit firewall
fw4 reload
