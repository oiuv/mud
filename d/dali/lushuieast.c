//Room: /d/dali/lushuieast.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","东泸水河谷");
	set("long",@LONG
西面这一大片河谷处在碧罗雪山和高黎山之间，由东泸水冲刷而
成，地势低洼，因而气候较温暖，聚居了大量乌夷族人。乌夷先民沿
河谷开发了一些梯田。四周山高林密，男子多从事狩猎。沿着脚下的
向西直抵一个大镇子。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "westdown"   : __DIR__"badidian",
	    "eastup"     : __DIR__"biluoxueshan",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

