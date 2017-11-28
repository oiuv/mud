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
		"north" : "/d/death/road4",
		"south" : "/d/death/road2",
	]));

	set("no_fight", 1);
	set("no_sleep_room", 1);

        setup();
        replace_program(ROOM);
}
