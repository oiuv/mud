inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园中，北面是一片波光涟滟的湖面。靠着岸的柳树
之下，有几盆茶花，娇艳照人，在满园烂漫的茶花围中，仍
骄然出群。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua4": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"northeast"  : __DIR__"chahua5",
	    	"northwest"  : __DIR__"chahua2",
	]));
	setup();
	replace_program(ROOM);
}

