//room: /d/yanziwu/cuixia.c
inherit ROOM;

void create()
{
        set("short","翠霞堂");
        set("long",@LONG
古朴庄严，气度非凡，你一进门就不由的惊叹。好大一座
厅堂! 西边仿佛有一间小厅，东边则是一片竹林，南面有一道
穿堂，不知通向什么地方。
LONG );
        set("exits",([
		"west" : __DIR__"xiaoting",
		"east" : __DIR__"zhulin1",
		"south": __DIR__"chuantang",
        ]));

        set("objects",([
                __DIR__"npc/azhu" : 1,
		__DIR__"npc/deng" : 1,
	]));

        set("valid_startroom", 1);
        setup();
}

int valid_leave(object me, string dir)
{
	object guarder;

	if (dir != "east")
		return 1;

	if (guarder = present("deng baichuan", this_object()))
		return guarder->permit_pass(me, dir);

	return 1;
}
