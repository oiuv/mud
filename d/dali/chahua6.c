inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园中，四周是翠绿的灌木，环绕着的是碧玉般柔润
的寒茵，一条清彻的小溪轻轻流下南面的小湖，中间是一盆
娇艳的茶花。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua5" : 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"south"  : __DIR__"chahua3",
	    	"north"  : __DIR__"chahua7",
	]));
	setup();
	replace_program(ROOM);
}

