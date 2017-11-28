/* File    : ping_a.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to answer a ping request from another mud.
 */

// Ported to ES2 mudlib by Annihilator@ES2 (06/15/95)

#include <net/dns.h>
#include <net/macros.h>
 
inherit F_CLEAN_UP;
 
// set our uid
void create()
{
	seteuid(ROOT_UID);
}

// Someone has answered our ping of them.
void incoming_request(mapping info)
{
        if (! ACCESS_CHECK(previous_object())) return;
 
        if (VERSION_D->is_release_server() &&
            info["MUDLIB"] == MUDLIB_NAME &&
            ! CONFIG_D->query(info["HOSTADDRESS"]))
                return 0;

        if (! undefinedp(info["USER"]) && info["USER"] == 0)
                map_delete(info, "USER");

        // set the name in the network master
        if (info["NAME"] && info["NAME"] != Mud_name())
		DNS_MASTER->set_mud_info(htonn(info["NAME"]), info);
}
