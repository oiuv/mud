#include <ansi.h>
#include "test.h"

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    // if (!wizardp(me))
    if (!SECURITY_D->valid_grant(me, "(admin)"))
        return 0;

    write("\n");

    /**
     * test code here
     */

    return 1;
}

int help()
{
    return 1;
}
