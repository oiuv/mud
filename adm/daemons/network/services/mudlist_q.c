/* File    : mudlist_q.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to request a list of muds from another mud.
 */

// Ported to ES2 mudlib by Annihilator (06/15/95)

#include <mudlib.h>
#include <net/dns.h>
#include <net/macros.h>

inherit F_CLEAN_UP;

void create() { seteuid(ROOT_UID); }

/*
 * Incoming mudlist query.  They want to know which muds we know.
 * We will only tell them about the DNS-enabled muds and not the
 * old tcp ones...
 */
string *build_mudlist(mapping muds)
{
        mapping svc;
	string *names, *ret;
        mapping cr;
        string local_mudlib;
	int i, pos;

	ret = ({ "" });

	// only want to send them DNS muds
        if (! mapp(svc = DNS_MASTER->query_svc()))
                return ret;

	names = keys(svc);

        // I will only build the information of me & my
        // subsits
        local_mudlib = MUDLIB_NAME;
        names = filter_array(names, (: $(muds)[$1]["MUDLIB"] == $(local_mudlib) &&
                                       ($1 == INTERMUD_MUD_NAME ||
                                        CONFIG_D->query($(muds)[$1]["HOSTADDRESS"]) == "valid") :));

	// we want to break the mudlist up into smaller packets
	for (i = 0, pos = 0; i < sizeof(names); i++)
        {
                cr = muds[names[i]];
                if (! mapp(cr)) continue;
		// add the mud to the packet
		ret[pos] += "||" + i + ":"+
                        (undefinedp(cr["MUDNAME"]) ? "" : "|MUDNAME:" + cr["MUDNAME"]) +
                        (undefinedp(cr["USERS"]) ? "" : "|USERS:" + cr["USERS"]) +
                        (undefinedp(cr["DRIVER"]) ? "" : "|DRIVER:" + cr["DRIVER"]) +
			"|NAME:" + cr["NAME"] +
			"|HOST:" + cr["HOST"]+
			"|HOSTADDRESS:" + cr["HOSTADDRESS"]+
			"|PORT:" + cr["PORT"]+
			"|PORTUDP:" + cr["PORTUDP"] +
			(undefinedp(cr["ZONE"]) ? "" 
					: "|ZONE:" + cr["ZONE"]) +
			(undefinedp(cr["MUDLIB"]) ? "" 
					: "|MUDLIB:" + cr["MUDLIB"]) +
			(undefinedp(cr["TCP"]) ? "" 
					: "|TCP:" + cr["TCP"]);
		if (strlen(ret[pos]) > 256)
                {
			// start a new packet
			ret += ({ "" });
			pos++;
		}
	}
	return ret;
}

void send_mudlist_q(string host, string port)
{
	if (! ACCESS_CHECK(previous_object())) return;

	DNS_MASTER->send_udp(host, port, "@@@" + DNS_MUDLIST_Q +
		"||NAME:" + Mud_name() +
		"||PORTUDP:" + udp_port() + "@@@\n");
}

// someone has requests a mudlist from us
void incoming_request(mapping info)
{
	int i;
	mapping minfo;
	string *bits;

	if (! ACCESS_CHECK(previous_object())) return;

        // sub-sites dosn't relase mudlist
        if (! VERSION_D->is_release_server()) return;

	minfo = DNS_MASTER->query_mud_info(info["NAME"]);
	if (! minfo || ! DNS_MASTER->dns_mudp(info["NAME"]) ||
            minfo["HOSTADDRESS"] != info["HOSTADDRESS"])
		PING_Q->send_ping_q(info["HOSTADDRESS"], info["PORTUDP"]);

	if (info["PORTUDP"])
        {
		bits = build_mudlist((mapping)DNS_MASTER->query_muds());
		for (i = 0;i < sizeof(bits); i++) 
			DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
				"@@@" + DNS_MUDLIST_A + bits[i]+ "@@@\n");
	}

        // 同时发布本站点信息
	DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
		"@@@" + DNS_PING_A + (string)DNS_MASTER->start_message() + "@@@\n");
}
