
inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这里是荒凉的山路，只有一条蜿蜒崎岖的小径，这里荒无人烟，让人
觉得背后冷飕飕的。
LONG );
	set("exits", ([
		"westup"    : __DIR__"shanlu3",
		"southdown" : __DIR__"shanlu1",
	]));
 	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
