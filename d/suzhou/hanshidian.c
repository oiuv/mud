// Room: /d/suzhou/hanshidian.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "寒拾殿");
	set("long", @LONG
这里供奉着相传为“和合二仙”化身的寒山，拾得金身塑
像，形态生动，逗人喜爱。寒山寺每年除夕半夜，撞钟一百零
八响，其含义是除旧迎新和纪念佛门一百零八位高僧。
LONG );
	set("no_clean_up", 0);
	set("exits", ([
		"out"   : __DIR__"fengqiao",
		"west"  : __DIR__"zhengdian",
	]));
	setup();
	replace_program(ROOM);
}

