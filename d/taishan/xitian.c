// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "西天门");
	set("long", @LONG
这里有两块巨石壁立，有如给人斩削过似的，正是岱顶的西面出口。
LONG );
	set("exits", ([
		"southdown" : __DIR__"yueguan",
	]));
	set("no_clean_up", 0);
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

