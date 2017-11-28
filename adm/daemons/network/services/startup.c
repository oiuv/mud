/* File    : startup.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to inform a mud we are starting up, and to send
 * information about ourselves.
 */
#include <net/dns.h>
#include <net/macros.h>

inherit F_CLEAN_UP;

// We got a startup message.
void incoming_request(mapping info)
{
        if (! ACCESS_CHECK(previous_object())) return;

        if (stringp(info["NAME"]))
        {
                // send info PING_A so it will be added to the mud address mapping
                PING_A->incoming_request(info);

                // send them a ping answer so they get our mud info
                PING_Q->incoming_request(info);
        }
}

void create()
{
        seteuid(ROOT_UID);
}
