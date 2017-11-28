/* File    : warning.c
 * Creator : Pinkfish@Discworld
 *         : Grendel@Tmi-2
 * When    : 93-08-15
 *
 * This file is part of the tmi mudlib.  Please keep this header intact.
 *
 * This protocol is used to let other muds know when we recieved a fake
 * message supposedly from them.
 */
#include <mudlib.h>
#include <net/macros.h>

inherit F_CLEAN_UP;

/*
 * The udp warning service... Hmmm...
 */
void
incoming_request(mapping info)
{
  string warn;

  if(!ACCESS_CHECK(previous_object())) return;

  warn = "DNS warning from "+info["NAME"]+ info["MSG"]+" Fakehost: "+
		info["FAKEHOST"];
  
  dns_log("dns_warning", warn);
}
