//Room: /d/dali/shulinwai.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","树林外");
	set("long",@LONG
你来到了一片黑森森的树林面前，放眼望去，密密麻麻的都是
树木，而且荆棘丛生，隐约可见有些小路东盘西曲。你仔细观察，
发现这显然是个人造的迷宫。其中暗合五行八卦，奇门遁甲，端的
非同小可，千万不要冒然进去。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"      : __DIR__"heilongling",
//	    "south"      : __DIR__"migongshulin",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

