
//  File    :  /include/telnet.h
//
//  This file holds the various defines used by the telnet daemon.
#ifndef __NET_TELNET_H
#define __NET_TELNET_H
#define SUCCESS      1
#define BAD_ADDRESS  0
#define CONN_REFUSED    -1
#define UNREACHABLE -2
 
//  This file holds the approved telnet sites.
#define APPROVED_SITES  "/adm/etc/approved_sites"
#define BANNED_SITES "/adm/etc/banned_sites"
 
 
//  These are the files that are permitted to perform telnet operations
//  without any checks (assumed to have predefined address targets).
#define APPROVED_TELNET ({  "/adm/daemons/network/telnetd", \
                "/obj/tools/webster",       \
            })
 
#endif //__NET_TELNET_H
