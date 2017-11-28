//Room: /d/dali/jingzhuang2.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","第二层");
	set("long",@LONG
为四神坐像，各有表情，衣褶隆起，筋节毕现，肌肉暴起，极富
立体感。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "up"    : __DIR__"jingzhuang3",
	    "down"  : __DIR__"jingzhuang1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

