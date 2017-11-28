/*
 * Intermud finger server
 * Original author: Huthar@Portals
 * Rewritten: Blackthorn@Genocide (10/31/92)
 * TMI-2 conversion: Buddha@tmi-2 (11/5/92)
 * 93-08-14 Grendel@tmi-2 Updated to work with dns
 */

#include <net/daemons.h>
#include <net/services.h>
#include <net/config.h>
#include <net/dns.h>

#define log(x) log_file("FS", x)

mapping requests;

// The interface to the mudlib
void remote_finger(object source, string user,string mud);
private void udp_finger(object source, string user,string mud);
private void tcp_finger(object source, string user,string mud);

// The inetd functions
void service_request(int id, mixed *parms);
void read_callback(int id, string msg);
void close_callback(int id);
void timeout(int id);

void
create()
{
  seteuid(ROOT_UID);
  requests = ([ ]);
}

// this is called by the finger command.  it works out which type of protocol
// to use, then acts appropriatley
void
remote_finger(object source, string user, string mud)
{
  mapping minfo;
  int msvc;

  if(!DNS_MASTER->query_mud_info(mud))
    {
      tell_object(source, "fingerd: no mud with that name presently active\n");
      return;
    }
  msvc = (int)DNS_MASTER->query_service_method(mud, "finger");

#if PREF_FINGER & SVC_TCP
  if(msvc & SVC_TCP)
    tcp_finger(source, user, mud);
  else if(msvc & SVC_UDP)
    udp_finger(source, user, mud);
#elif PREF_FINGER & SVC_UDP
  if(msvc & SVC_UDP)
    udp_finger(source, user, mud);
  else if(msvc & SVC_TCP)
    tcp_finger(source, user, mud);
#else
  if(0) ; //force the following else to be taken
#endif
  else
     tell_object(source, "fingerd: cannot determine protocol\n");
}

private void
udp_finger(object source, string user,string mud)
{
  if (!DNS_MASTER->query_mud_info(mud))
    {
      // this is bad, you had to have a service entry to get here
      tell_object(source, "fingerd: error: unknown mud has service entry\n");
      return;
    }
  if (user != "")
    (AUX_PATH+"gfinger_q")->send_gfinger_q(mud, user, source);
  else
    (AUX_PATH+"rwho_q")->send_rwho_q(mud, source, 1);
  tell_object(source, "Finger on its way.  May take some time.\n");
  return ;
}

private void
tcp_finger(object source, string user,string mud)
{
  int id;

  id = INETD->open_service(mud, "finger", ({ user }));
  if (id < 0)
    {
      tell_object(source, "Remote mud does not exist.\n");
      return;
    }
  requests[id] = ({ source, user, mud });
  call_out("timeout", SERVICE_TIMEOUT, id);
}

/* The inetd daemon interface */

/* This is called by the inet daemon when it receives an incoming
 * finger request
 */
void
service_request(int id, mixed *parms)
{
  string *lines;
  int i;

  if (!parms || !sizeof(parms) || !parms[0])
    {
      lines = explode((string)FINGER_D->finger_all(), "\n"); 
      INETD->write_socket(id, "\n");
      for (i=0;i<sizeof(lines);i++) 
	INETD->write_socket(id, lines[i] + "\n");
    }
  else
    {
      if (stringp(parms[0]))
	{
	  lines = explode((string)FINGER_D->finger_user(parms[0]), "\n");
	  INETD->write_socket(id, "\n");
	  for (i=0;i<sizeof(lines);i++) 
	    INETD->write_socket(id, lines[i] + "\n");
	}
    }
  INETD->close_socket(id);
}

void
read_callback(int id, string msg)
{
  if (!msg) return;
  tell_object(requests[id][0], msg);
}

void
close_callback(int id)
{
  map_delete(requests, id);
}   

void
timeout(int id)
{
  if (!requests[id]) return;
  tell_object(requests[id][0], "Remote finger connection timed out.\n");
  INETD->close_socket(id);
  map_delete(requests, id);
}
