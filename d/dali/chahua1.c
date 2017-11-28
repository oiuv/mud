inherit ROOM;

void create()
{
	set("short","茶花园门");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园口，对着满园春色，不禁大喜过望。东边就进园
了，北边是一个库房。南边是一栋厢房，是休息的地方。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"north" : __DIR__"bingqiku",
	    	"south" : __DIR__"xiuxishi",
	    	"east" : __DIR__"chahua2",
	    	"west" : __DIR__"tingyuan",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

