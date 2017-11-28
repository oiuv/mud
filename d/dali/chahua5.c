inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园中，发现几朵娇嫩欲滴的茶花，你不禁多看了两
眼。西面是一个小湖，湖面碧绿如玉，曛曛入醉。
LONG);
	set("objects", ([
	   	__DIR__"obj/chahua11": 1,
	   	__DIR__"obj/chahua12": 1,
	   	__DIR__"obj/chahua13": 1,
	   	__DIR__"npc/huanu": 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"northwest"  : __DIR__"chahua3",
	    	"southwest"  : __DIR__"chahua4",
	]));
	setup();
	replace_program(ROOM);
}

