//Room: /d/dali/wuyiminju1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","乌夷民居");
	set("long",@LONG
这是一所乌夷族的房屋。乌夷民居的建地和走向讲究依傍四面山
势，一般以石为墙和基，以木为梁，结构大致和汉人房屋相仿，皆是
平房，石砌围墙。这家院内有一圈牲畜，猪牛羊皆有。
LONG);
	set("objects", ([
	   __DIR__"npc/muyangnu": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "south"  : __DIR__"wumeng",
	]));
	setup();
	replace_program(ROOM);
}

