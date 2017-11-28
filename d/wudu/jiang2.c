#include <ansi.h>
inherit RIVER;

void create()
{
        set ("short", "桃花江东岸");
        set ("long", @LONG
这里是桃花江 (river)边，江水清澈，水流平缓，两岸都
是无边的桃树，不断有桃花随风飘入江中，随波逐流。江边停
泊着一条渡船。
LONG);
        set("arrive_room", "/d/wudu/jiang1");
        set("exits", ([
                "east" : __DIR__"cun1",
                "south" : __DIR__"xiao1",
        ]));

        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("resource/fish", ({ "/clone/fish/liyu",
                                "/clone/fish/jiyu",
                                "/clone/fish/qingyu",
                                "/clone/fish/caoyu", }));

        set("outdoors", "wudujiao");
        setup();
        replace_program(RIVER);
}