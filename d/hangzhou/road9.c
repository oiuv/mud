#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
大道上游人，或步行，或乘轿，或骑马。个个喜气洋洋的来游西
湖。大道延伸向西边。断桥在大道的西南边。南边则是另一条大道。
LONG);
        set("exits", ([
            "west"      : __DIR__"road8",
            "east"      : __DIR__"marryroom",
            "south"     : __DIR__"road10",
            "southwest" : __DIR__"duanqiao",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
