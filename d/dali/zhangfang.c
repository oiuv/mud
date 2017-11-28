//Room: /d/dali/zhangfang.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","帐房");
	set("long",@LONG
这里是镇南王府的帐房，王府每天的银米出入，往来消耗，
全由这里经手，包括家丁下人的薪俸赏赐，在在都是麻烦多多。
这里却从来没出过差错。
LONG);
	set("objects", ([
	   __DIR__"npc/huo": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "east"  : __DIR__"wfdating",
	]));
	setup();
	replace_program(ROOM);
}

