// Room: /lingzhou/baxian.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "八仙道观");
	set("long", @LONG
这里是八仙道观，内有八仙殿，供着张果老、铁拐李、吕洞宾等八
仙的塑像，香案上香烟缭绕。靠墙放着几张太师椅，地上放着几个蒲团。
东西两侧是走廊，北边是东二巷， 南边是后院,种着些杨柳和老槐树，
是道士们休息的地方。后院还有一口井，不过看上去有点异样。
LONG );
	set("exits", ([
		"west" : __DIR__"xiaolu2",
	]));
	set("objects", ([
		__DIR__"npc/laodaoshi" : 1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

