// Room: /d/suzhou/yaopu.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "立春堂");
	set("long", @LONG
这是一家药铺，一股浓浓的药味让你几欲窒息，那是从药
柜上的几百个小抽屉里散发出来的。药房先生却不在店内。一
名小伙计站在柜台后招呼着顾客。
LONG );
	set("outdoors", "suzhou");
//	set("no_clean_up", 0);
	set("exits", ([
		"south"  : __DIR__"dongdajie2",
	]));
	set("objects", ([
		__DIR__"npc/huoji" : 1,
	]));
	setup();
	replace_program(ROOM);
}

