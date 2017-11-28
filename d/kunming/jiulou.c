inherit ROOM;

void create()
{
	set("short", "酒楼");
	set("long", @LONG
这是一家极为普通的酒楼，平日里就卖些米酒，包子，大
部分来这里的人都是随便买点东西就走了，也有些人叫点花生
米，切点熟牛肉来对饮两盅的。
LONG);
	set("exits", ([
		"west" : __DIR__"nandajie1",
	]));
	set("objects", ([
		"/d/city/npc/xiaoer2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

