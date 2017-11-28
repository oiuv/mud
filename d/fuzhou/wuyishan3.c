// Room: /d/fuzhou/wuyishan3.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "天游峰");
	set("long", @LONG
天游峰为武夷第一胜地，山势陡峭，石阶因山而凿，极为险
峻，山峰巍然屹立，登顶远眺，武夷山全景尽收眼底。只见大王
玉女遥遥相望，默默伤情。
LONG );
	set("exits", ([
		"southdown" : __DIR__"wuyishan5",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

