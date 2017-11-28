/* File    : support_q.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to query another mud to see what protocols/services
 * they support.
 */

// Ported to ES2 mudlib by Annihilator@ES2 (06/15/95)

#include <net/dns.h>
#include <net/macros.h>

inherit F_CLEAN_UP;

void create() { seteuid(ROOT_UID); }

// Support.  Do we support this protocol?
void incoming_request(mapping info)
{
	if(!ACCESS_CHECK(previous_object())) return;

	if (stringp(info["NAME"]) && stringp(info["PORTUDP"])) {
		// dont want requests from ourself
		if(info["NAME"] == Mud_name()) return;

		if(!DNS_MASTER->dns_mudp(info["NAME"]))
			PING_Q->send_ping_q(info["HOSTADDRESS"], info["PORTUDP"]);

		// if the file exists that is enough to know that we support
		// it, unless there is a param request, in which case we have
		// to call_other to the file to check.
		if( file_size(AUX_PATH+info["CMD"]+".c") <= 0
		||	(!undefinedp(info["PARAM"])
		&&	call_other(AUX_PATH+info["CMD"], "support_"+info["PARAM"]))) {
			// we don't support it
			DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
				sprintf("@@@%s||NAME:%s||PORTUDP:%d||CMD:%s||NOTSUPPORTED:yes||ANSWERID:%s@@@\n",
					DNS_SUPPORT_A, Mud_name(), udp_port(),
					info["CMD"]+ (!undefinedp(info["PARAM"]) ? "||PARAM:"+info["PARAM"] : ""),
					info["ANSWERID"]));
		} else {
			// we do support it
			DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
				sprintf("@@@%s||NAME:%s||PORTUDP:%d||CMD:%s||SUPPORTED:yes||ANSWERID:%s@@@\n",
					DNS_SUPPORT_A, Mud_name(), udp_port(),
					info["CMD"]+(!undefinedp(info["PARAM"]) ? "||PARAM:"+info["PARAM"] : ""),
					info["ANSWERID"]));
		}
	} //if (stringp(info["NAME"]) && stringp(info["PORTUDP"]))
}

void send_support_q(string host, mixed port, string cmd, string param)
{
	int idx;
	function f;

	if(!ACCESS_CHECK(previous_object())) return;

if (!param) param = "";

	f = (: previous_object(), "support_q_callback" :);

	idx = index_add(f);

	DNS_MASTER->send_udp(host, port,
		sprintf("@@@%s||NAME:%s||PORTUDP:%d||CMD:%s||ANSWERID:%d@@@\n",
			DNS_SUPPORT_Q, Mud_name(), udp_port(),
			cmd + (strlen(param) ? "||PARAM:"+param : ""), idx));
}

