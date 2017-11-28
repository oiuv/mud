//Room: /d/dali/taiheju.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","太和居");
	set("long",@LONG
这是大理城内最大的酒楼，楼下卖些大理的小吃，过往行人
常常买来作路菜。楼上是雅座。
LONG);
	set("objects", ([
	   __DIR__"npc/xiaoer2": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "west"  : __DIR__"center",
	    "up"    : __DIR__"taiheju2",
	]));
	setup();
        replace_program(ROOM);
}

