//Room: /d/dali/luojiadian.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short","罗伽甸");
	set("long",@LONG
这里是滇池的东南，是么些蛮的罗伽部落聚居的地方。么些蛮族
属摆夷。摆夷喜居平原沿水，（沿水的平原坝子，即为“甸”）。这
里土壤肥沃，灌溉便易。罗伽是一个大部落，罗伽甸是个相当大的镇
子，大理国在这里设有治府。
LONG);
	set("outdoors", "dali");
	set("exits",([ /* sizeof() == 1 */
	    "northwest"  : __DIR__"yanchi3",
	    "southwest"  : __DIR__"yanan1",
	    "east"       : __DIR__"nongtian2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

