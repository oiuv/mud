// drive.c
//
// 可以驾驶的物品

#include <dbase.h>

int is_transport() { return 1; }

void set_owner(object me)
{
        set_temp("owner", me);
}

object query_owner()
{
        return query_temp("owner");
}

// 我是否可以驾驶？
int can_drive_by(object me)
{
        object owner;

        if (! objectp(owner = query_owner()))
                return 1;

        if (owner == me || environment(owner) != environment())
                return 1;

        return notify_fail("这是" + owner->name() + "的车，你乱动什么？\n");
}
