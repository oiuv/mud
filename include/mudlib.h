#ifndef __MUDLIB__
#define __MUDLIB__

#include <getconfig.h>

//  The base distribution mudlib name.  

// MUDLIB information
#define MUDLIB_NAME             "Heros"
#define MUDLIB_VERSION_NUMBER	"1.1"
#define MUDLIB_VERSION		    (MUDLIB_NAME + " " + MUDLIB_VERSION_NUMBER)

#define INTERMUD_MUD_NAME	    ((string) CONFIG_D->query_string("internet mud name"))
#define CHINESE_MUD_NAME	    LOCAL_MUD_NAME()
#define MUD_DRIVER              ((string) CONFIG_D->query_string("mudos"))
#define	MUD_ENCODING		    ((string) CONFIG_D->query_string("encoding"))
#define	MUD_ZONE		        ((string) CONFIG_D->query_string("zone"))

// MAIL information
#define SMTP_SERVER             ((string) CONFIG_D->query_string("smtp server"))
#define SMTP_DOMAIN             ((string) CONFIG_D->query_string("smtp domain"))
#define SENDER                  ((string) CONFIG_D->query_string("smtp sender"))

// 所有监听的节点
#define MUDLIST_DNS1            ((string) CONFIG_D->query_string("mudlist1"))
#define MUDLIST_DNS2            ((string) CONFIG_D->query_string("mudlist2"))
#define MUDLIST_DNS3            ((string) CONFIG_D->query_string("mudlist3"))
#define MUDLIST_DNS4            ((string) CONFIG_D->query_string("mudlist4"))
#define MUDLIST_DNS5            ((string) CONFIG_D->query_string("mudlist5"))

#endif
