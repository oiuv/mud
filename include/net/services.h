/*
 * This file contains information about the standard services used by
 * various parts of the mudlib, particularly the network communication
 * daemons such as finger and tell.
 */
#ifndef __NET__SERVICES_H
#define __NET__SERVICES_H
/* These are the protocol types for the services
 */
#define SVC_UNKNOWN    0
#define SVC_KNOWN      1
#define SVC_TCP        2
#define SVC_NO_TCP     4
#define SVC_UDP        8
#define SVC_NO_UDP    16
/* These macros control which ports the services run on.
 */
#define SRVC_PORT_INETD(x)  (x)+5
#define SRVC_PORT_UDP(x)    (x)+4
/* These are the levels of tcp support available
 */
#define TCP_NONE  "none"
#define TCP_SOME  "some"
#define TCP_ALL   "all"
#define TCP_ONLY  "only"
#endif //__NET__SERVICES_H
