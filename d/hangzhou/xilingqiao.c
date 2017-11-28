// xilingqiao.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "西泠桥");
        set("long", @LONG
西泠桥衔结孤山，跨过里西湖。桥的东南边是孤山。北边则是一
条青石大道。
LONG);
        set("exits", ([
            "southeast" : __DIR__"gushan",
            "north"     : __DIR__"road7",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
