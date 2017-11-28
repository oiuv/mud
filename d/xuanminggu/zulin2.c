inherit ROOM;

void create()
{
	set("short", "翠竹林");
	set("long", @LONG
这是玄冥峰山腰的一片翠竹林，四处青翠掩映，鸟语花香。
此处比之竹林入口处景色更佳，竹子的幽香气息扑鼻而来。实在
是练武静思之宝地。
LONG );
	set("exits", ([
		"eastdown"  : __DIR__"zulin1",
	]));

        set("objects", ([
                 "/kungfu/class/xuanming/he" : 1,
        ]));

	set("outdoors", "xuanming");
	setup();
	replace_program(ROOM);
}

