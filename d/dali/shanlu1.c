//Room: /d/dali/shanlu1.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","川西山路");
	set("long",@LONG
你走在川西山间的一条土路上。此间属古蜀国境内，地势甚高，
可山势相对较平缓。西面可见白雪皑皑的青藏高原群山，向南一路穿
越山陵直通向云南大理。附近山间有些乌夷人的村落。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northup"    : __DIR__"wunong",
	    "south"      : __DIR__"jianchuankou",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

