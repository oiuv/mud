//Room: /d/dali/chahuashan6.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","茶花山南");
	set("long",@LONG
这儿是茶花山的南面，仍然有大量的茶花盛开着。但显然不如山上的
品种好了，都是凡品。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "westup"     : __DIR__"chahuashan5",
	    "southeast"  : __DIR__"dadieshui",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

