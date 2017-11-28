#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
大道上游人，或步行，或乘轿，或骑马。个个喜气洋洋的来游西
边是灵隐寺和飞来峰。往南是上天竺。
LONG);
        set("exits", ([
                "southup"   : __DIR__"shanlu1",
                "southwest" : __DIR__"road1",
                "east" : __DIR__"road3",
        ]));
        set("objects", ([
           __DIR__"npc/xianghuo" : 1,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
