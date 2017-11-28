//Room: /d/dali/shanlu3.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","山路");
	set("long",@LONG
一条的山路蜿蜒穿行在茂密的森林中，向东不远可达大理国的中
心--大理城，西去则进入深山。由于接近大理中心，这条路修整的相
当平整，尽管山势崎岖，行路并不困难。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "west"    : __DIR__"shanlu2",
	    "east"    : __DIR__"northgate",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

