// Room: /guiyun/nvxiangfang.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "女厢房");
	set("long", @LONG
这里是归云庄女弟子的休息室，摆着几张木床。床旁都有一支高脚
架子，用来挂衣物。屋角一张几凳，放了一盆兰花，散着淡淡幽香。
LONG );
        set("sleep_room",1);
	set("no_clean_up", 0);

	set("exits", ([
		"east" : __DIR__"huating",
	]));
	setup();
	replace_program(ROOM);
}

