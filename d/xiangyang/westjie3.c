// Room: /d/xiangyang/westjie3.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是一条宽阔的青石街道，向东西两头延伸。西面是白虎
内门，东边是一个大十字街口，只见人来人往，络绎不绝。南
边是大校场。北面是襄阳城的西兵营，隐隐能听见里面传来的
宋兵的操练声。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"westjie2",
		"west"  : __DIR__"westgate1",
		"south" : __DIR__"dajiaochang",
		"north" : __DIR__"bingying4",
	]));
	setup();
	replace_program(ROOM);
}

