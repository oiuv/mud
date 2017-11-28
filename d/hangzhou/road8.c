#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青石道");
        set("long", @LONG
大道上游人，或步行，或乘轿，或骑马。个个喜气洋洋的来游西
湖。大道延伸向东边和西南边。朝北走便是上宝石山。
LONG);
        set("exits", ([
            "east"      : __DIR__"road9",
            "northup"   : __DIR__"baoshishan",
            "west" : __DIR__"road7",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
