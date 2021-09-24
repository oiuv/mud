#include <ansi.h>
#include "test.h"

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
    if (!wizardp(me))
        return notify_fail("test what???\n");
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
