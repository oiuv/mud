/* File    : ping_q.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to ask another mud for infomation about itself.
 */
 
// Ported to ES2 mudlib by Annihilator@ES2 (06/15/95)

#include <net/dns.h>
#include <net/macros.h>

inherit F_CLEAN_UP;
inherit F_DBASE;

string my_address;
int my_port;

void create()
{
	seteuid(ROOT_UID);
	my_address = query_host_name();
	my_port = udp_port();
	set("channel_id", "网路回应精灵");
}

// Someone has ping'd us
void incoming_request(mapping info)
{
	if (! ACCESS_CHECK(previous_object())) return;

	if (info["NAME"] == Mud_name())
        {
		dns_warning("ping_q::incoming_request: ping from ourselves\n");
		// we pinged ourselves!
		return;
	}

	if (info["PORTUDP"])
        {
		// check we have an entry for the sender
		if (! DNS_MASTER->dns_mudp(info["NAME"]))
			PING_Q->send_ping_q(info["HOSTADDRESS"], info["PORTUDP"]);

		// send a ping answer along with our mud info
		DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
			"@@@" + DNS_PING_A + (string)DNS_MASTER->start_message()+ "@@@\n");
        }
}

// send a pinq query
void send_ping_q(string host, mixed port)
{
	if (! ACCESS_CHECK(previous_object())) return;

	DNS_MASTER->send_udp(host, port, "@@@" + DNS_PING_Q +
		"||NAME:" + Mud_name() +
		"||PORTUDP:" + udp_port() +
		"@@@\n");
}
