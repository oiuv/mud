// Room: /d/xiangyang/eastjie3.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这是一条宽阔的青石街道，向东西两头延伸。东面是青龙
内门，南边是木匠铺，锯木声、刨木声声声入耳。北面是襄阳
城的东兵营，隐隐能听见里面传来宋兵的操练声。西边是一个
十字街口，只见人来人往、络绎不绝。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"eastgate1",
		"west"  : __DIR__"eastjie2",
		"south" : __DIR__"mujiang",
		"north" : __DIR__"bingying2",
	]));
	setup();
	replace_program(ROOM);
}

