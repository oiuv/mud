//Room: /d/dali/shanlu7.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","山路");
	set("long",@LONG
行进在南诏崎岖的山林中。高山耸立，雨林茂密繁盛，树木大都
枝杈横生，给行路带来额外困难。附近山民经常行走才开出这样的道
路来，尽管如此，行旅仍然需要挟带砍刀，随时准备砍除路边树木横
出的障碍。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northwest" : __DIR__"nongtian3",
	    "eastup"    : __DIR__"shanlu8",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

