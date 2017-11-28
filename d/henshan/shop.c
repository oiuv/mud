inherit ROOM;

void create()
{
	set("short", "小店");
	set("long", @LONG
这里是衡阳县城的一间小店，卖些简单的饮食，专门赚那
些游客的钱。
LONG);
	set("exits", ([
		"north" : __DIR__"hengyang1",
		"up"    : __DIR__"huiyan",
	]));

	set("objects", ([
	        __DIR__"npc/xiaoer" : 1,
	]));

	setup();
	replace_program(ROOM);
}

