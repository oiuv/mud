//Room: /d/dali/jingzhuang4.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","第四层");
	set("long",@LONG
雕有八坐佛，四隅略大，其中东、南两佛面目驳落，容不可辨。
坐佛莲花座皆有梵文佛经。经文尾处刻有“慈济和尚--大理人”字
样。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "up"    : __DIR__"jingzhuang5",
	    "down"  : __DIR__"jingzhuang3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

