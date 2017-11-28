//Room: /d/dali/hole.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","大，小芝云洞");
	set("long",@LONG
带着火折进入洞内，迂回蛇行，不久，即见一厅豁然开朗，石钟
乳，石笋，石柱，玲珑剔透，斗奇争胜。光照壁影，如月穿晓岩，溪
云接水，壁气侵寒，石光滴翠，清幽可爱。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "out"      : __DIR__"changhu",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

