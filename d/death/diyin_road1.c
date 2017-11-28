#include <ansi.h>
inherit ROOM;
 
void create()
{
        set("short", RED "【地阴通道】" NOR);
       set("long", RED @LONG

                    地     阴     通     道

    一条由阴司向下延伸的阶梯，不知道通往何方，阶梯深不见底，仿
佛永远没有止境一般。

LONG NOR );
        set("exits", ([
                "up" : __DIR__"lunhuisi",
                "down" : __DIR__"diyin_road2",
        ]));

        set("no_sleep_room", 1);

        setup();
}

int valid_leave(object me, string dir)
{
        int i;
        if (dir == "down")
        {
                i = (int)me->query_temp("long_road");
                i = i + 1;

                if (i == 10)
                {
                        me->delete_temp("long_road");
                        return 1;
                }
           else {
                        me->set_temp("long_road",i);
                        return notify_fail( RED "\n你向下走着这深不见底的阶梯……"
                                            "只觉阶梯似乎在无限延伸，永远到达不了尽头"
                                            "一般。\n" NOR);
                }
        }
   else {
                if (dir == "up")
                {
                        me->delete_temp("long_road");
                        return 1;
                }
        return 1;
        }
}
