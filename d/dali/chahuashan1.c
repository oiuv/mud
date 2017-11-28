//Room: /d/dali/chahuashan1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","茶花山");
	set("long",@LONG
你站在一座小山西面脚下，大理盛产茶花，好品种的茶花遍
地生长，东面的这片小山林也长满了好茶。西边不远就是大理城
的北门了。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "west"      : __DIR__"northgate",
	    "eastup"    : __DIR__"chahuashan2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

