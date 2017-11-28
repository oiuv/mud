/*
 * File    : remote_q.c
 * Creator : ken@XAJH
 * When    : 98-1-15
 *
 * This protocol is used to send a intermud emote request.
 */

#undef DEBUG

#include <net/macros.h>
#include <net/dns.h>
#include <net/daemons.h>
#include <net/services.h>
#include <getconfig.h>

inherit F_CLEAN_UP;
inherit F_DBASE;

void create()
{
	seteuid(ROOT_UID);
	set("channel_id", "网路频道");
}

// This is the interface to the intermud channels
void send_remote_q(string mud,string channel,string me,string who,string msg)
{
	mapping rhost;

	if (! this_player() || ! ACCESS_CHECK(previous_object()))
                return;

	mud = htonn(mud);
	if (mud == mud_nname()) return;

	rhost = (mapping)DNS_MASTER->query_mud_info(mud);
	if (! rhost) return;

	msg = replace_string(msg, "|", "");
	msg = replace_string(msg, "@@@", "");

	DNS_MASTER->send_udp(rhost["HOSTADDRESS"], rhost["PORTUDP"],
			"@@@" + "remote_q" +
			"||NAME:" + Mud_name() +
			"||PORTUDP:" + udp_port() +
			"||CHANNEL:" + channel +
			"||SOURCE_ID:" + lower_case(me) +
			"||TARGET_ID:" + lower_case(who) +
                        "||WIZ_LEVEL:" + wiz_level(me) +
			"||MSG:"     + msg+"@@@\n");
}

void incoming_request(mapping info)
{
	mapping rhost;
	object ob;
        string sid;
        string no_emote, can_emote;

	if (! ACCESS_CHECK(previous_object())) return;

	if (undefinedp(info["CHANNEL"])) return;

	if (info["NAME"])
        {
		if (info["NAME"] == Mud_name()) return;

		rhost = DNS_MASTER->query_mud_info(info["NAME"]);
		if (! rhost || ! DNS_MASTER->dns_mudp(info["NAME"]))
                {
			// We don't accept the message.  But ping them anyway.
			PING_Q->send_ping_q(info["HOSTADDRESS"], info["PORTUDP"]);
			return;
		}

		if (info["HOSTADDRESS"] != rhost["HOSTADDRESS"])
                {
			// Faked.  sheeze... 
			dns_log("dns_fake",sprintf( "Gchannel: %s %s\n%s", ctime(time()),
				info["HOSTADDRESS"], info["MYINFO"]));
			DNS_MASTER->send_udp(info["HOSTADDRESS"], info["PORTUDP"],
				"@@@" + DNS_WARNING +
				"||NAME:"+Mud_name() +
				"||MSG: Fake remote_q msg: " + info["CHANNEL"] +
				"||FAKEHOST:" + info["HOSTADDRESS"] +
				"@@@\n");
			return;
		}
 
		ob = find_player(info["TARGET_ID"]);
		if (! objectp(ob) || ! userp(ob) ||
		    ob->query("env/invisible"))
                {
        		(AUX_PATH + "affirmation_a")->send_affirmation_a(info["HOSTADDRESS"],
        			info["PORTUDP"], "remote_q@" + Mud_name(),
        			info["SOURCE_ID"],
                                sprintf("%s没有这个人(%s)。",
                                        LOCAL_MUD_NAME(), info["TARGET_ID"]),
                                "remote_q");
                        return;
                }

                no_emote = ob->query("env/no_emote");
                sid = lower_case(info["SOURCE_ID"] + "@" + info["NAME"]);
        	if ((! info["WIZ_LEVEL"] || info["WIZ_LEVEL"] == "0") &&
                    (no_emote == "all" || no_emote == "ALL" ||
        	     is_sub(sid, no_emote)))
                {
                        can_emote = ob->query("env/can_emote");
                        if (! is_sub(sid, can_emote))
        		{
                		(AUX_PATH + "affirmation_a")->send_affirmation_a(info["HOSTADDRESS"],
                			info["PORTUDP"], "remote_q@" + Mud_name(),
                			info["SOURCE_ID"],
                                        sprintf("%s(%s@%s)不接受你的表情动作。",
                                                ob->name(1), capitalize(ob->query("id")), Mud_name()),
                                        "remote_q");
                                return;
                        }
                }

		DNS_MASTER->send_udp(rhost["HOSTADDRESS"], rhost["PORTUDP"],
			"@@@" + "remote_a" +
			"||NAME:" + Mud_name() +
			"||PORTUDP:" + udp_port() +
			"||CHANNEL:" + info["CHANNEL"] +
			"||SOURCE_ID:" + info["SOURCE_ID"] +
			"||MSG:"  + info["MSG"] +
			"||TARGET:" + sprintf("mud=%s name=%s id=%s age=%d gender=%s respect=%s rude=%s ",
			Mud_name(), ob->name(1), ob->query("id"), ob->query("age"), ob->query("gender"),
			RANK_D->query_respect(ob),RANK_D->query_rude(ob)) +
			"@@@\n");
	}
}
