/*
 * File    : shutdown.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to remove a mud from a dns database.
 */

// Ported to ES2 mudlib by Annihilator@ES2 (06/17/95)

#include <net/dns.h>
#include <net/macros.h>

inherit F_CLEAN_UP;

// Some mud or other has decied to tell us it is shuting down...
void incoming_request(mapping info)
{
  mapping mud_info;

  if(!ACCESS_CHECK(previous_object())) return;

  if(!info["NAME"])
    return;

  mud_info = (mapping)DNS_MASTER->query_mud_info(info["NAME"]);
  if(!mud_info || !DNS_MASTER->dns_mudp(info["NAME"]))
    return;

  if(info["HOSTADDRESS"] != mud_info["HOSTADDRESS"])
    { // faked
      dns_log("dns_fake", sprintf("Shutdown from: %s for %s (%s) @%s\n",
				mud_info["HOSTADDRESS"], info["NAME"],
				info["HOSTADDRESS"], ctime(time()) ));
      DNS_MASTER->send_udp(mud_info["HOSTADDRESS"], mud_info["PORTUDP"],
			   "@@@"+DNS_WARNING+
			   "||MSG: Faked shutdown message from "+
			   info["HOSTADDRESS"] + "||FAKEHOST:" +
			   info["NAME"] + "@@@");
      return;
    }

  DNS_MASTER->zap_mud_info(info["NAME"]);
}

// we send this when we shut down
void send_shutdown(string host, int port)
{
  if(!ACCESS_CHECK(previous_object())) return;

  DNS_MASTER->send_udp(host, port, "@@@"+DNS_SHUTDOWN+
		       "||NAME:"+Mud_name()+
		       "||PORTUDP:"+udp_port()+
		       "@@@\n");
}

void create()
{
  seteuid(ROOT_UID);
}
