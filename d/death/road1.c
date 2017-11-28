#include <ansi.h>
inherit ROOM;
 
void create()
{
	set("short", HIR "【鬼门大道】" NOR);
       set("long", HIR @LONG

                    鬼     门     大     道

    你走在一条阴森森的路上，浓浓的雾环绕在你的四周，好像永远都
不会散去似的。往南看去你勉强可以分辨出一个城楼的模样，往北隐约
可以看到几盏灯笼，在浓雾中显得格外的诡异，路的两旁各有一栋木造
的建筑，门都是半开的，但你看不清楚里面有什麽。


LONG NOR );
        set("exits", ([
		"north" : "/d/death/road2",
		"south" : "/d/death/gateway",
		"west" : "/d/death/inn1",
		"east" : "/d/death/inn2",
	]));

	set("no_fight", 1);
	set("no_sleep_room", 1);

        setup();
        replace_program(ROOM);
}
