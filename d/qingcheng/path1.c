// Room: /qingcheng/path1.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "盘山磴道");
	set("long", @LONG
你走在盘山磴道上。山木蔽日，幽静宜人。过了“青城”木牌
楼，西上就是天然图画了。东南方向是建福宫。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"southeast" : __DIR__"jianfugong",
		"westup"    : __DIR__"tianran",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

