// Room: /huanghe/wuwei.c
// Java Sep. 22 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "武威");
	set("long", @LONG
武威是西夏国的西南重镇，驻有重兵，城楼高达三丈，门口有两排
官兵正在认真的盘查过往行人，城门口的告示上画着最近通缉的江洋大
盗的图形，城里头看上去还挺热闹。东南就是去永登的方向了，西南面
就是祁连山脉。
LONG );
	set("exits", ([
		"southeast" : __DIR__"wuqiao",
		"north"     : __DIR__"tumenzi",
	]));
	set("objects", ([
		__DIR__"npc/xixiabing" : 3,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

