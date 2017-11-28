//TOHSQ5.C

inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
水声越来越大，山间充满了浓浓的水气。山路上，断裂的山
隙中，都流出一道道细细的泉水，汇成一股澄碧的小溪，向山下
蜿蜒流去。周围绿意荡漾，鸟语鹦声，如置身仙境。
LONG );
	set("exits", ([
		"north" : __DIR__"tohsq6",
		"south" : __DIR__"tohsq4",
	]));
	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
