inherit ROOM;

void create()
{
	set("short", "试剑石");
	set("long", @LONG
在山道东侧是试剑石，呈椭圆形，正中有条深而齐裂的裂
缝，相传吴王得“干将”，“莫邪”剑后，为试其锋利，将石
劈开。石旁刻着元代顾瑛的诗句“剑试一痕秋，崖倾水断流，
如何百年后，不斩赵高头？”的诗句。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"north" : __DIR__"zhenniang",
		"south" : __DIR__"zhishuang",
		"west"  : __DIR__"zhenshi",
		"east"  : __DIR__"wanjing",
	]));
	set("objects", ([
		"/d/taishan/npc/jian-ke" : 1,
	]));
	setup();
	replace_program(ROOM);
}

