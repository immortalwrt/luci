#!/bin/sh

CONFIG="luci-app-openvpn-server"

port=$(uci -q get ${CONFIG}.server.port || echo "1194")
proto=$(uci -q get ${CONFIG}.server.proto || echo "udp")
ddns=$(uci -q get ${CONFIG}.server.ddns || echo "example.com")
cipher=$(uci -q get ${CONFIG}.server.cipher || echo "AES-256-GCM")
auth=$(uci -q get ${CONFIG}.server.auth || echo "SHA256")
tls_crypt=$(uci -q get ${CONFIG}.server.tls_crypt || echo "0")
tls_auth=$(uci -q get ${CONFIG}.server.tls_auth || echo "0")
remote_list=$(uci -q get ${CONFIG}.server.remote_list)
extra_client_config=$(uci -q get ${CONFIG}.server.extra_client_config)

cat <<-EOF > /tmp/openvpn.ovpn
	client
	dev tun
	proto ${proto}
	remote ${ddns} ${port}
	$(for remote in ${remote_list}; do
		host="${remote%:*}"
		rport="${remote##*:}"
		[ "${host}" = "${rport}" ] && rport="${port}"
		[ -n "${host}" ] && echo "remote ${host} ${rport}"
	done)
	resolv-retry infinite
	nobind
	persist-key
	persist-tun
	auth-user-pass
	$([ "${cipher}" != "none" ] && echo "data-ciphers ${cipher}:AES-256-GCM:AES-128-GCM")
	$([ "${cipher}" != "none" ] && echo "cipher ${cipher}")
	$([ "${auth}" != "none" ] && echo "auth ${auth}")
	$([ "${tls_crypt}" -eq 1 ] && [ -s /usr/share/openvpn-server/tls-crypt.key ] && echo "tls-crypt [inline]")
	$([ "${tls_crypt}" -ne 1 ] && [ "${tls_auth}" -eq 1 ] && [ -s /usr/share/openvpn-server/tls-auth.key ] && echo "tls-auth [inline] 1")
	verb 3
	${extra_client_config}
	<ca>
	$(cat /usr/share/openvpn-server/ca.crt)
	</ca>
EOF

[ "${tls_crypt}" -eq 1 ] && [ -s /usr/share/openvpn-server/tls-crypt.key ] && {
	cat <<-EOF >> /tmp/openvpn.ovpn
		<tls-crypt>
		$(cat /usr/share/openvpn-server/tls-crypt.key)
		</tls-crypt>
	EOF
}

[ "${tls_crypt}" -ne 1 ] && [ "${tls_auth}" -eq 1 ] && [ -s /usr/share/openvpn-server/tls-auth.key ] && {
	cat <<-EOF >> /tmp/openvpn.ovpn
		<tls-auth>
		$(cat /usr/share/openvpn-server/tls-auth.key)
		</tls-auth>
	EOF
}
