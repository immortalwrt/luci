#!/bin/sh

CONFIG="luci-app-openvpn-server"
OVPN_PATH=/var/etc/openvpn-server
LOG_FILE=${OVPN_PATH}/client.log
AUTH_FILE=${OVPN_PATH}/auth
TIME="$(date "+%Y-%m-%d %H:%M:%S")"

IP=${untrusted_ip}

USER_INFO=$(awk '!/^;/&&!/^#/&&$1=="'${username}'"{print $2" "$3" "$4;exit}' ${AUTH_FILE})
CORRECT_PASSWORD=$(echo "${USER_INFO}" | awk '{print $1}')
EXPIRE_TIME=$(echo "${USER_INFO}" | awk '{print $2}')
ACCESS_TIME=$(echo "${USER_INFO}" | awk '{print $3}')
if [ "${CORRECT_PASSWORD}" = "" ]; then 
	echo "${TIME}: ${username}/${IP} Fail authentication. input password=\"${password}\"." >> ${LOG_FILE}
	exit 1
fi

if [ -n "${EXPIRE_TIME}" ] && [ "${EXPIRE_TIME}" != "0" ]; then
	TODAY="$(date "+%Y-%m-%d")"
	if [ "${TODAY}" \> "${EXPIRE_TIME}" ]; then
		echo "${TIME}: ${username}/${IP} Fail authentication. account expired at ${EXPIRE_TIME}." >> ${LOG_FILE}
		exit 1
	fi
fi

if [ -n "${ACCESS_TIME}" ] && [ "${ACCESS_TIME}" != "0" ]; then
	echo "${ACCESS_TIME}" | grep -Eq '^[0-2][0-9]:[0-5][0-9]-[0-2][0-9]:[0-5][0-9]$' && {
		NOW_H="$(date "+%H")"
		NOW_M="$(date "+%M")"
		NOW_H="${NOW_H#0}"
		NOW_M="${NOW_M#0}"
		[ -n "${NOW_H}" ] || NOW_H=0
		[ -n "${NOW_M}" ] || NOW_M=0
		START_TIME="${ACCESS_TIME%-*}"
		END_TIME="${ACCESS_TIME#*-}"
		START_H="${START_TIME%:*}"
		START_M="${START_TIME#*:}"
		END_H="${END_TIME%:*}"
		END_M="${END_TIME#*:}"
		START_H="${START_H#0}"
		START_M="${START_M#0}"
		END_H="${END_H#0}"
		END_M="${END_M#0}"
		[ -n "${START_H}" ] || START_H=0
		[ -n "${START_M}" ] || START_M=0
		[ -n "${END_H}" ] || END_H=0
		[ -n "${END_M}" ] || END_M=0
		NOW_MIN=$((NOW_H * 60 + NOW_M))
		START_MIN=$((START_H * 60 + START_M))
		END_MIN=$((END_H * 60 + END_M))
		if [ "${START_MIN}" -le "${END_MIN}" ]; then
			[ "${NOW_MIN}" -lt "${START_MIN}" -o "${NOW_MIN}" -gt "${END_MIN}" ] && {
				echo "${TIME}: ${username}/${IP} Fail authentication. outside allowed time ${ACCESS_TIME}." >> ${LOG_FILE}
				exit 1
			}
		else
			[ "${NOW_MIN}" -lt "${START_MIN}" -a "${NOW_MIN}" -gt "${END_MIN}" ] && {
				echo "${TIME}: ${username}/${IP} Fail authentication. outside allowed time ${ACCESS_TIME}." >> ${LOG_FILE}
				exit 1
			}
		fi
	}
fi

if [ "${password}" = "${CORRECT_PASSWORD}" ]; then 
	echo "${TIME}: ${username}/${IP} Successful authentication." >> ${LOG_FILE}
	exit 0
fi

echo "${TIME}: ${username}/${IP} Fail authentication. input password=\"${password}\"." >> ${LOG_FILE}
exit 1
