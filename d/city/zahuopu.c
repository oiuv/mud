inherit ROOM;

void create()
{
	set("short", "杂货铺");
	set("long", @LONG
这是一家小小的杂货铺，大箱小箱堆满了一地，都是一些
日常用品。杨掌柜懒洋洋地躺在一只躺椅上，招呼着过往行人。
据说私底下他也卖一些贵重的东西。
LONG );
	set("exits", ([
		"north" : __DIR__"dongdajie1",
		"up"    : __DIR__"garments",
	]));
	set("objects", ([
		__DIR__"npc/yang": 1,
	]));
	setup();
	replace_program(ROOM);
}

