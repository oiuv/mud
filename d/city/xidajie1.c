inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。西大街是
衙门所在，行人稀少，静悄悄地很是冷清。东边是一个热闹的
广场。南边是一家扇庄。北边就是衙门了。
LONG);
        set("outdoors", "city");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"guangchang",
		"south" : __DIR__"shan",
		"west"  : __DIR__"xidajie2",
		"north" : __DIR__"yamen",
	]));

	setup();
	replace_program(ROOM);
}

