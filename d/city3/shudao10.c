#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
一条小石阶，有点破破烂烂，青草从石头的缝隙中长了出
来，有些地方的石阶由于年代久远，已经磨的光滑如镜。向上
看去，只见云雾中有几座房子。
LONG);
        set("exits", ([
                "east" :  __DIR__"baidicheng",
                "west" : __DIR__"sanxia1",
        ]));
        set("objects", ([
                "/d/beijing/npc/old2" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
        replace_program(ROOM);
}

