#include <ansi.h>
inherit ROOM;
 
void create()
{
	set("short", HIR "【鬼门大道】" NOR);
       set("long", HIR @LONG

                    鬼     门     大     道

    你走在一条阴森森的路上，浓浓的雾环绕在你的四周，好像永远都
不会散去似的，整条路前後只看到零星的几盏灯笼……


LONG NOR );
        set("exits", ([
		"north" : "/d/death/road6",
		"south" : "/d/death/road4",
	]));

	set("no_fight", 1);
	set("no_sleep_room", 1);

        setup();
}

int valid_leave(object me, string dir)
{
        int i;
        if (dir == "north") {
                i = (int)me->query_temp("long_road");
                i = i + 1;
                if (i == 35) {
                me->delete_temp("long_road");
                return 1;
                }
                else {
                        me->set_temp("long_road",i);
                        return notify_fail( HIB "\n你走著走著……发现四周景色居然都没有变……\n" NOR);
                }
        }
        else {
        if (dir == "south") {
                me->delete_temp("long_road");
                return 1;
                }
        return 1;
        }
}

