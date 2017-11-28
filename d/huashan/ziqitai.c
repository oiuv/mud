#include <ansi.h>
inherit BUILD_ROOM;

void create()
{
        set("short", NOR MAG "紫气台" NOR);
        set("long", @LONG
紫气台终年云遮雾掩，迷蒙不见天日，在悬崖边上长着一根长长
的紫藤(teng)，很是怪异。更为怪异的是：每逢下雨天，山谷之中就
隐隐有紫气出现。极目四望，风景如画，在这里隐居相必非常惬意。
LONG);
        set("outdoors", "huashan");
        set("exits",([ /* sizeof() == 1 */
            "eastdown": __DIR__"chaopath2",
        ]));
        set("max_room", 3);
        set("item_desc", ([
              "teng"  : MAG "一根紫藤，看起来很结实的样子，好像可以用它爬（climb）下悬崖。\n" NOR,
        ]));   
        setup();
        //replace_program(ROOM);
}
void init()
{
        add_action("do_climb", "climb");
}
int do_climb(string arg)
{
        object me;
        me = this_player();

        if (! arg || arg == "")
        	return 0;

        if (arg == "teng")
        {
                if (me->is_busy())
                {
                        return notify_fail("你的动作还没有完成，不能移动。\n");
                        return 1; 
                }

                message_vision(MAG "$N拉着紫藤，慢慢的爬了下去。\n"
                               NOR, me);

                me->move("/d/jinshe/shanbi");
                message("vision", HIC + me->name() + HIC "顺着紫藤从上面的紫气台爬了下来。\n"
                                  NOR, environment(me), ({me}));
                me->start_busy(2);
                return 1;
        }
}
