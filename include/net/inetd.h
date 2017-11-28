#ifndef __NET_INETD_H
#define __NET_INETD_H
#ifndef DNS_MASTER
#include <net/daemons.h>
#endif
// #define INETD_ADDRESS  -100
// #define INETD_PORT     -200
#define PENDING_CMD       0
#define PENDING_CONNECT   1
#define PENDING_DATA      2
#define READ_SOCKET 0
#define WRITE_SOCKET 1
#define INETD_SERVICES "/adm/etc/services"
#define INETD_PORT(x) (string)DNS_MASTER->get_host_name(x) + " " + \
                      (int)DNS_MASTER->get_mudresource(x, "inetd")
#define AWAITING_CONNECT_ACK 0
#define AWAITING_SERVICE 1
#define AWAITING_DATA 2
#endif //__NET_INETD_H
