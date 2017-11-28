//Room: /d/dali/shanlu8.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","山路");
	set("long",@LONG
道路在山林中蜿蜒继续，从西面的山岭通向东面的低洼地带。这
里山势较为平缓，山丛中偶有人烟，透过丛林的缝隙中向东望去，隐
约可见一汪碧水和些许人烟。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "eastdown"  : __DIR__"yangzong",
	    "westdown"  : __DIR__"shanlu7",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

