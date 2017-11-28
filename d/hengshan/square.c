// Room: /d/hengshan/huixiantai.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "见性峰广场");
        set("long", @LONG
这里是恒山主峰见性峰峰顶的广场。在这里俯瞰群山，才理会
得何以恒山是华夏北方万山之宗，这里也是威震江湖的恒山派的根
本重地。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "westdown"  : __DIR__"shandao2",
           "north"     : __DIR__"baiyunan",
        ]));
	set("objects", ([
		__DIR__"npc/yi" : 1,
		__DIR__"npc/qing" : 1,
	]));
        set("outdoors", "hengshan");
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

