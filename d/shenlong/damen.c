// damen.c

#include <ansi.h>

inherit ROOM;

string* npcs = ({
	__DIR__"npc/boy",
	__DIR__"npc/boy2",
	__DIR__"npc/boy3",
	__DIR__"npc/boy4",
	__DIR__"npc/girl",
	__DIR__"npc/boy",
	__DIR__"npc/boy2",
	__DIR__"npc/boy3",
	__DIR__"npc/boy4",
	__DIR__"npc/girl",
	__DIR__"npc/girl",
});

void create()
{
    set("short", "大门");
    set("long", @LONG
这是间很大的竹屋。门外站着几个年轻弟子.再住北就是神龙教大
厅，隔得虽远，却也可以听得到厅上众人齐声念颂之声。
LONG
    );

    set("exits", ([
		"south" : __DIR__"road2",
		"north" : __DIR__"dating",
    ]));
    set("objects", ([
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
    ]));
    set("outdoors", "shenlong");
    setup();
    replace_program(ROOM); 
}
