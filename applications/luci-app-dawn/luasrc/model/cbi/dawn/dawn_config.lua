m = Map("dawn", translate("Dawn Configuration"), translate(""))
s = m:section(TypedSection, "metric", translate("Metric"), translate("Metric")); s.anonymous = true;
s:option(Value, "ht_support", translate("High Throughput Support"))
s:option(Value, "no_ht_support", translate("No High Throughput Support"))
s:option(Value, "vht_support", translate("Very High Throughput Support"))
s:option(Value, "no_vht_support", translate("No Very High Throughput Support"))
s:option(Value, "rssi", translate("RSSI"))
s:option(Value, "low_rssi", translate("Low RSSI"))
s:option(Value, "freq", translate("5GHz"))
s:option(Value, "chan_util", translate("Channel Utilization"))
s:option(Value, "max_chan_util", translate("Above Maximum Channel Utilization"))

s = m:section(TypedSection, "metric", translate("Threshold"), translate("Thresholds")); s.anonymous = true;
s:option(Value, "bandwidth_threshold", translate("Bandwidth Threshold"))
s:option(Value, "rssi_val", translate("RSSI Threshold"))
s:option(Value, "low_rssi_val", translate("Low RSSI Threshold"))
s:option(Value, "chan_util_val", translate("Channel Utilization Threshold"))
s:option(Value, "max_chan_util_val", translate("Maximum Channel Utilization Threshold"))
s:option(Value, "min_probe_count", translate("Minimum Probe Count"))
s:option(Value, "min_number_to_kick", translate("Minimum Number After Kicking Client"))

s = m:section(TypedSection, "metric", translate("Evaluate"), translate("What should be evaluated?")); s.anonymous = true;
s:option(Flag, "kicking", translate("Activate Kicking"))
s:option(Flag, "eval_probe_req", translate("Evaluate Probe Requests"))
s:option(Flag, "eval_auth_req", translate("Evaluate Authentication Requests"))
s:option(Flag, "eval_assoc_req", translate("Evaluate Association Requests"))
s:option(Flag, "use_station_count", translate("Use Station Count"))

s = m:section(TypedSection, "metric", translate("IEE802.11"), translate("Reasons for denying")); s.anonymous = true;
s:option(Value, "deny_auth_reason", translate("Denying Authentication"))
s:option(Value, "deny_assoc_reason", translate("Denying Association"))

s = m:section(TypedSection, "times", translate("Time Configuration"), translate("Time Configs")); s.anonymous = true;
s:option(Value, "update_client", translate("Update Client Information Interval"))
s:option(Value, "denied_req_threshold", translate("Checking if client is connected"))
s:option(Value, "remove_client", translate("Remove Client Information"))
s:option(Value, "remove_probe", translate("Remove Hearing Map Information"))
s:option(Value, "update_hostapd", translate("Check for new Hostapd Sockets"))
s:option(Value, "update_tcp_con", translate("Check for new Routers"))
s:option(Value, "update_chan_util", translate("Update Channel Utilization Interval"))

return m
