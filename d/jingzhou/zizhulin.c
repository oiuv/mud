inherit ROOM;

void create()
{
	set("short", "紫竹林");
	set("long", @LONG
你来到一片翠绿的紫竹林中，四周全被紫竹所包围，你仿
似迷失了方向。耳旁不时传来一阵阵悦耳的鸟叫声，不禁让人
感到心旷神怡。
LONG);
        set("outdoors", "jingzhou");

	set("exits", ([
		"northup" : __DIR__"shijie",
		"south" : __DIR__"zizhulin1",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

