// yuelang.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "岳廊");
        set("long", @LONG
岳王庙的匾上是“心昭天日”四个大字。步入大殿，正中是岳飞
的塑像，身後的匾上题着“还我河山”。北边的门通向岳坟，往南是
出去的路。
LONG);
        set("exits", ([
            "north"     : __DIR__"yuefen",
            "south"     : __DIR__"road6",
        ]));
        set("objects" , ([
            "/d/mingjiao/npc/chengchaofeng" : 1,
            __DIR__"npc/honghua2" :2,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
