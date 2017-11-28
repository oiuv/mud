//HSQMEN.C

inherit ROOM;

void create()
{
	set("short", "洪水旗大门");
	set("long", @LONG
这里是明教洪水旗的大门, 庄严古朴, 门前对插四面镶蓝蟠
龙旗门前水声潺潺, 却是一条水流从门下流出, 正是瀑布的上源,
原来, 整个洪水旗就建筑在这条小河之上.
LONG );
	set("exits", ([
		"enter" : __DIR__"hsqchanglang",
		"south" : __DIR__"tohsq7",
	]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}
