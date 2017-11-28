//Room: /d/dali/taiheju2.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","太和居二楼");
	set("long",@LONG
这里是太和居的二楼，楼梯边上坐了些手持云板，瑶琴的歌
女。富商土豪在这里边吃喝作乐，也有文人墨客在此饮酒清谈，
从南面窗口望出，可以看道城外五华楼前的一波碧水。
LONG);
	set("objects", ([
	   __DIR__"npc/genu": 2,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "down"  : __DIR__"taiheju",
	]));
	setup();
	replace_program(ROOM);
}

