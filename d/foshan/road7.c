inherit ROOM;

void create()
{
	set("short", "小道");
	set("long", @LONG
这里是一条林间小道，在树丛中蜿蜒。东面是岭南重镇佛
山，西边通向广西。
LONG);
	set("objects", ([
	   	__DIR__"obj/shuzhi": 1,
	]));
	set("outdoors", "foshan");
	set("exits", ([
	    	"west" : __DIR__"road6",
	    	"east" : __DIR__"westgate",
	]));
	setup();
	replace_program(ROOM);
}

