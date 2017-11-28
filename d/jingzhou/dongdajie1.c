inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这是一条宽阔的青石板街道，南边是一座简朴的院子，半
月形的大门上方写着“萧湘书院”四个烫金的大字，苍劲挺拔
有力。里面不时地传来学生们抑扬顿挫的读书声。北边是一座
几层高的白塔，相传是一位状元为报母养育之恩而建造的。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
		"east" : __DIR__"dongdajie2",
		"south" : __DIR__"shuyuan",
		"west" : __DIR__"guangchang",
		"north" : __DIR__"baita",
	]));
        set("objects", ([
                "/d/beijing/npc/shusheng1" : 2,
        ]));
	setup();
	replace_program(ROOM);
}

