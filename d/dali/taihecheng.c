//Room: /d/dali/taihecheng.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","太和城");
	set("long",@LONG
此城是乌夷族的治府，全城巷陌都以石垒成，高丈余，连绵数里
不断。太和不算大城，但人口为数并不少，地理上和军事上是大理城
的北门户，历代大理王朝都在此加固城池，派驻精兵。附近有一些乌
夷部族聚居。此南是一片平原，下十五里便达大理城。
LONG);
	set("outdoors", "dali");
	set("objects",([
	    __DIR__"npc/bing": 2,
	    __DIR__"npc/jiang": 1,
	]));
	set("exits",([ /* sizeof() == 1 */
	    "north"  : __DIR__"dehuabei",
	    "south"  : __DIR__"dalinorth",
	]));
	setup();
	replace_program(ROOM);
}

