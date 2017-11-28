//Room: /d/dali/tusifu.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","土司府");
	set("long",@LONG
土司府是当地傣族世袭土司刀氏的衙门，一座古老的砖木建筑物，
门庭居高临下，庄严坚实，门前是宽广的石阶，有点象衙门气势，房
屋共三台，占地约八百亩，分作正厅，议事厅，后厅，厢房。
LONG);
	set("objects", ([
	   __DIR__"npc/datusi": 1,
	   __DIR__"npc/shicong": 2,
	]));
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "enter"  : __DIR__"tusimentang",
	    "south"  : __DIR__"dahejiewest",
	]));
	setup();
	replace_program(ROOM);
}

