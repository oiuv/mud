// getconfig.h read configuration in /adm/etc

#ifndef _GETCONFIG_H_
#define _GETCONFIG_H_

#include <runtime_config.h>

#define RELEASE_SERVER()        ((string) CONFIG_D->query_string("release server"))
#define LOCAL_MUD_NAME()        ((string) get_config(__MUD_NAME__))
#define LOCAL_PORT()            ((int) get_config(__MUD_PORT__))

#endif
