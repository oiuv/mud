inherit ROOM;

void create()
{
	set("short","茶花园后门");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园后门口，对着满园春色，不禁大喜过望。东边就
进园了，西面是一条石铺甬道。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    "east" : __DIR__"chahua7",
	    "west" : __DIR__"yongdao2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

