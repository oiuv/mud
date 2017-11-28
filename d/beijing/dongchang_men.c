inherit ROOM;
#include <ansi.h>

void create()
{
        set("short","东厂大门");
        set("long", @LONG
这里就是京城的特务机构——东厂的大门。这里警备深严，不时有穿着制
服的东厂官兵进进出出，望大门里望去，可以望见大门里面有许多太监。大门
两旁的东厂官兵正如狼似虎的盯着你看，如果你不想找死的话，最好还是赶快
离开的好。
LONG NOR);
        set("exits", ([
                "south" : __DIR__"dongchang",
                "north" : __DIR__"dong_1",
        ]));
        set("objects", ([
                __DIR__"npc/bing2" : 2,
                __DIR__"npc/taijian" : 1,
        ]));
        setup();
        replace_program(ROOM);
}

