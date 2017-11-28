//Room: /d/dali/zonglichu.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","国务总理处");
	set("long",@LONG
总理处是镇南王皇太弟总理国务之处，满桌的奏章整理得井井有
条。四周摆了很多茶花，争奇斗艳。茶花是大理国花，看来主人对它
也是钟爱有加。
LONG);
	set("objects", ([
	    __DIR__"obj/shanchahua": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "north"  : __DIR__"sikong",
	    "south"  : __DIR__"wfdating",
	    "east"   : __DIR__"sima",
	    "west"   : __DIR__"situ",
	]));
	setup();
	replace_program(ROOM);
}

