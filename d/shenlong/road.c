#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "大道");
        set("long", @LONG
这是一条宽敞的大道。全由乱石堆成，显然曾花了不少人力。西
边是一片开阔地。
LONG );

        set("exits", ([
	        "west" : __DIR__"kongdi",
	        "north" : __DIR__"road2",
        ]));
        set("objects", ([
	        __DIR__"npc/old": 2,
        ]));
        set("outdoors", "shenlong");
        setup();
        replace_program(ROOM); 
}

