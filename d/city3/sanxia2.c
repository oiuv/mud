#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "巫峡");
        set("long", @LONG
这里是长江三峡中的巫峡，也是最大最美的一个峡谷，神
女峰高高的耸立在江边，远远看去，犹如一位亭亭玉立的少女，
两岸风景美不胜收。
LONG);
        set("exits", ([
                "east" :  __DIR__"sanxia1",
                "west" : __DIR__"sanxia3",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");
        setup();
        replace_program(ROOM);
}

