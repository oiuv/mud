// road11.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "青石大道");
        set("long", @LONG
沿湖大道旁店铺林立，长街故朴，屋舍鳞次栉比，道上人来车往，
一片太平热闹景象。街东边的一家店铺里传来叮叮当当的打铁声。
LONG);
        set("exits", ([
            "north"     : __DIR__"road10",
            "south"     : __DIR__"road12",
            "east"      : __DIR__"tiejiangpu",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
