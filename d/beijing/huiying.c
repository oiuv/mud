#include <room.h>
inherit ROOM;

void create()
{
        set("short", "汇英酒楼");
        set("long", @LONG
汇英酒楼在整个京城中，也算是小有名气的了。酒楼里面
雕梁画壁，装饰有如宫殿，你可以在这里打听到各地的风土人
情。店小二里外忙得不可开交，接待着南腔北调的客人。楼里
桌椅洁净。座中客人衣饰豪奢，十九是富商大贾。
LONG);
       set("exits", ([
                "north" : __DIR__"yong_1",
                "up"    : "/b/yitian/jiulou",
        ]));
        set("objects", ([
                __DIR__"npc/xiaoer2" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}
