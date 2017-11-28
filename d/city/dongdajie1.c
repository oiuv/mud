inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。东边不时
地传来金属撞击声，西边人声嘈杂。北边是一座院子，半月形
的大门上方写着「白鹿书院」四个烫金大字，苍劲有力。里面
不时地传来学生们抑扬顿挫的读书声。南边是一家杂货铺。
LONG );
        set("outdoors", "city");
	set("exits", ([
		"east" : __DIR__"dongdajie2",
		"south" : __DIR__"zahuopu",
		"west" : __DIR__"guangchang",
		"north" : __DIR__"shuyuan",
	]));

	set("objects", ([
		"/clone/npc/xunbu" : 1,
	]));
	setup();
	replace_program(ROOM);
}

