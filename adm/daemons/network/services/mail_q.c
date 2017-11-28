/*
//
//  File    :  mail_q.c
//  Author  :  Inspiral@Tabor
//  Created :  93-08-20
//  Purpose :  Handles the receipt/transmission of udp mail messages
//
*/
 
#include <net/dns.h>
#include <net/daemons.h>
#include <net/config.h>
#include <net/macros.h>
 
inherit F_CLEAN_UP;
inherit F_SAVE;
 
#define WHO     find_player( "inspiral" )
#define TELL( x ) if( WHO ) tell_object( WHO, x + "\n" )
 
 
// keys: mudname
// values: int representing the index of the msg we are on.
mapping mail_outgoing;
 
// keys: mudname
// values: the fields in the mail message...WIZTO, CC, MSG, etc.
mapping mail_incoming;
 
void create()
{
	seteuid( getuid() );
	mail_outgoing = ([ ]);
	mail_incoming = ([ ]);
	// Turn saving 'on' in the save daemon.
}
 
string query_save_file() { return DATA_DIR + "netmail"; }
 
// We're sent here by mail_a or ping_a
varargs void check_for_mail( string mudname, int flag )
{
  mapping       outmsg, info;
  string        package;
  int   index, size;
  
  outmsg = ([ ]);
  mudname = htonn( mudname );
//  outmsg = ( mapping ) NETMAIL_D -> check_for_mail( mudname );
  
  switch( flag ) {
    case 3:
    // A ping_a calls this, as does the netmail server.
    // It simply means: start sending if there's anything to send,
    // or continue with the current message we are sending.
    if( !mail_outgoing[mudname] ) { 
           // We will have something to send to this mud, and currently,
           // there is nothing in our mail_q outgoing buffer.  So, we 
           // properly initialize it.
           mail_outgoing[mudname] = ([ ]);
        }
     // There seem to be indices for this mud in the mail_q, but no mail to
     // be found to send to them...most likely due to an admin purge
     // of old or bad mail.
     if( !sizeof( outmsg ) ) {
         map_delete( mail_outgoing, mudname );
         break;
     }
    // If more than a minute has passed since the last time we've
    // sent to this mud, start over, since something on one or both ends
    // could be out of sync.
/*
    if( time() - mail_outgoing[mudname]["time"] > 60 ) {
          mail_outgoing[mudname] = ([ "time": time(),
                        "index" : 0 ]);
    }
*/
    // Do nothing, since it came from a ping while we are sending.
    break;
    case 2:
    case 1:
    // case 1 is when the other mud wants us to resend the current
    // message, case 2 is when they want us to send our next message,
    // if we have one.
    if( !sizeof( outmsg ) ) {
      // Nothing to be sent out now, so clear the status.
      // We shouldn't get here from case 1, only case 2.
      map_delete( mail_outgoing, mudname );
      break;
    }
    // Reset the index and time;
    mail_outgoing[mudname] = ([ "time" : time(),
                        "index" : 0 ]);
    break;
    case 0:
    // We get 0 from mail_a, so we continue sending the current message.
    mail_outgoing[mudname]["time"] = time();
    mail_outgoing[mudname]["index"] += MAIL_PACKET_SIZE;
    break;
  }
  
  // One last check on our stack for this mud, before we send data.
  if( !sizeof( outmsg ) || !mail_outgoing[mudname] )
    return;
  
  info = ( mapping ) DNS_MASTER -> query_mud_info( mudname );
  if( !info || !info["NAME"] || !info["PORTUDP"] ) return;
  
  TELL( "MAILQ: Sending to " + mudname );
  
  outmsg["MSG"] = replace_string( outmsg["MSG"], "|", " \b|" );
  outmsg["MSG"] = replace_string( outmsg["MSG"], "@", " \b@" );
  
  TELL( "message size: " + strlen( outmsg["MSG"] ) );
  package =
    "@@@" + DNS_MAIL_Q +
    "||NAME:" + Mud_name() +
    "||PORTUDP:" + udp_port();
  
  if( !mail_outgoing[mudname]["index"] ) {
    package +=
          "||WIZTO:" + outmsg["WIZTO"] +
      "||WIZFROM:" + outmsg["WIZFROM"] +
      "||DATE:" + time() +
      "||SUBJECT:" + outmsg["SUBJECT"];
    
    if( outmsg["CC"] ) 
      package += "||CC:" + outmsg["CC"];
  }
  
  index = mail_outgoing[mudname]["index"];
  size = strlen( outmsg["MSG"] );
  
  if( size <= MAIL_PACKET_SIZE ||
    ( (index-1) + MAIL_PACKET_SIZE ) >= size )  {
         TELL( "Sending ENDMSG:1." );
     package += "||ENDMSG:1";
  }
 
  
  TELL( "MAILQ: Sending: " + (index) + ".." + ((index-1)+MAIL_PACKET_SIZE) );
  package += "||MSG:" + outmsg["MSG"][(index)..( (index-1) + MAIL_PACKET_SIZE )]
;
  package += "@@@\n";
  
  DNS_MASTER -> send_udp( info["HOSTADDRESS"],
    info["PORTUDP"],
    package );
  
  return;
}
 
 
// If we are here, then we are receiving mail from a mud.
void incoming_request( mapping info ) {
  string        field;
  
  if( !info["NAME"] || !info["PORTUDP"] ) return;
 
  if( !DNS_MASTER -> query_mud_info( info["NAME"] ) )
    PING_Q -> send_ping_q( info["HOSTADDRESS"], info["PORTUDP"] );
  
  // Here we put the info in something netmail can use.
//  info["MSG"] = strip_backspace( info["MSG"] );
  
  if( info["WIZTO"] ) {
    // If they send us a WIZTO field, we assume (rightly) that this
    // is a new message, so we effectively set our buffer for this
    // particular mud with whatever we've been sent.
      mail_incoming[ info["NAME"] ] = info;
  } else {
    // If we have no data in the incoming buffer for this mud, and
    // the mud didn't send us a WIZTO field, something must have gone
    // wrong, so we ask them to RESEND the message from the beginning.
    if( !mail_incoming[ info["NAME"] ] )
            info[ "RESEND" ] = 1;
    else mail_incoming[info["NAME"]]["MSG"] += info["MSG"];
  }
 
  // Send them an affirmation that we receive the mail, and suitable
  // affirm also if they sent us an ENDMSG flag (which indicates that
  // we can process the message.
  // If we send RESEND:1, we are asking them to resend the message.
  DNS_MASTER -> send_udp( info["HOSTADDRESS"], info["PORTUDP"],
    "@@@" + DNS_MAIL_A + "||NAME:" + Mud_name() +
    "||PORTUDP:" + udp_port() +
        ( info["ENDMSG"] ? "||ENDMSG:1" : "" ) +
    ( info["RESEND"] ? "||RESEND:1" : "" ) +
    "@@@\n" );
 
        TELL( "MAILQ: Sending mail_a " + 
                ( info["ENDMSG"] ? ", ENDMSG:1 " : "" ) +
                ( info["RESEND"] ? ", RESEND:1" : "" ) +
                "." 
        );
 
  if( info["ENDMSG"] ) {
    // If we received an ENDMSG, then we are ready to process the contents
    // of our buffer.  So, we send off the packet, and clear the incoming
    // buffer for that mud.
        TELL( "MAILQ:  Sending to netmail." );
        catch( NETMAIL_D -> incoming_mail( mail_incoming[ info["NAME"] ] )
 );
        map_delete( mail_incoming, info["NAME"] );
  }
}
 
 
// This is nice for debugging.
void get_status() {
//  write( "mail_outgoing:\n" + identify( mail_outgoing ) +
 //       "\nmail_incoming:\n" + identify( mail_incoming ) + "\n" );
}
 
void clear_queues() {
  mail_outgoing = ([ ]);
  mail_incoming = ([ ]);
}
 
/* EOF */
