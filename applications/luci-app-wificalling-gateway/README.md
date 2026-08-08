# luci-app-wificalling-gateway

Per-device transparent Wi-Fi Calling gateway for OpenWrt / ImmortalWrt.

It forwards selected LAN clients through a selected sing-box node (AnyTLS, Hysteria2,
TUIC, VLESS Reality, VMess WebSocket) via a single sing-box process with nftables TPROXY,
while other clients keep the normal gateway or PassWall policy. It observes ePDG/IPsec
UDP 500/4500 evidence and records handshake outcomes and sustained encrypted
communication in an encrypted IMS activity log (toggleable).

Maintainer docs, install guide and build instructions:
https://github.com/smthdagg/luci-app-wificalling-gateway

## Install

```sh
opkg update
opkg install luci-app-wificalling-gateway
/etc/init.d/rpcd restart
```

Then open **Services -> Wi-Fi Calling Gateway**. Save a node first, then create a
device policy. Devices must have static DHCP leases.
