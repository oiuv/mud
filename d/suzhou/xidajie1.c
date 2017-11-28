inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。西大街是
衙门所在，行人稀少，静悄悄地很是冷清。东边是沧浪亭和宝
带桥，南边是兵营。北边就是衙门了。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"  : __DIR__"xidajie2",
		"east"  : __DIR__"zhongxin",
		"north" : __DIR__"yamen",
		"south" : __DIR__"bingying",
	]));
	setup();
	replace_program(ROOM);
}

