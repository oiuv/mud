inherit ROOM;

void create()
{
	set("short","大厅");
	set("long",@LONG
这里是五华楼的前大厅，大厅内异常宽敞明亮，足有一
里见方。全是云石铺地，黑白相间，足足可以容纳二、三千
人。时时可见锦衣侍者手托美食来回行走。
LONG);
	set("objects", ([
	   	__DIR__"npc/shizhe": 3,
	]));
	set("exits", ([
	    	"north"   : __DIR__"louti",
	    	"out"     : __DIR__"gudao",
	]));
	setup();
	replace_program(ROOM);
}

