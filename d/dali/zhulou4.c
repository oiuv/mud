//Room: /d/dali/zhulou4.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","议事堂");
	set("long",@LONG
这间大竹楼的中层是普麽部的议事堂，村中长老逢要日便在此聚
议族内大事，也在此接待外族贵客，或会晤大理国官府派来的使者。
屋内以本族的图腾壁画、鸟兽皮毛装饰四壁。
LONG);
	set("objects", ([
	   __DIR__"npc/zuzhang": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "up"    : __DIR__"zhulou5",
	    "down"  : __DIR__"zhulou3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

