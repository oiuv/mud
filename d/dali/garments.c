//Room: /d/dali/garments.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","薛记成衣铺");
	set("long",@LONG
这是一家老字号的估衣庄，里面摆满了各式各样的衣物。
绸、绢、丝、布、皮袄、大红斗蓬、葱黄绫子棉裙、水绿色
棉袄，秋香色团花。。。不一而足。
LONG);
	set("objects", ([
	   __DIR__"npc/xueboss": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "south" : __DIR__"taiheeast",
	]));
	setup();
	replace_program(ROOM);
}

