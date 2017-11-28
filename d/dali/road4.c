//Room: /d/dali/road4.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","大路");
	set("long",@LONG
一条贯通南北的大路，是由大理城往南边疆土的官道。沿路向南
丛林愈发茂密，大片雨林覆盖山岭，此间地势较平坦，大路笔直地连
接着北边的大理城和南边的喜州等城镇。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "north"      : __DIR__"shuangheqiao",
	    "south"      : __DIR__"tianweijing",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

