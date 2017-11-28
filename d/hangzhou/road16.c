#include <room.h>
inherit ROOM;
void create()
{
        set("short", "青石道");
        set("long", @LONG
大道上游人，或步行，或乘轿，或骑马。个个喜气洋洋的来游西
湖。北边可上雷峰。
LONG);
        set("exits", ([
            	"northup" : __DIR__"xizhaoshan",
            	"east"    : __DIR__"road15",
            	"west"    : __DIR__"road20",
        ]));
        set("objects", ([
		__DIR__"npc/baizhen" : 1,
        ]));

        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
