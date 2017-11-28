// Room: /u/zqb/tiezhang/hhyuan-1.c

inherit ROOM;

void create()
{
	set("short", "后花园");
	set("long", @LONG
这是一处环境优雅的花园。只见乔松修竹，苍翠蔽天，层峦奇岫，静窈
幽深。西面有一座假山，东面是大片的花圃。北面是通往山上的路。
LONG	);
	set("exits", ([ /* sizeof() == 4 */
  "north" : __DIR__"shanlu-3",
  "south" : __DIR__"hxfang",
  "west" : __DIR__"hhyuan-3",
  "east" : __DIR__"hhyang-2",
]));
	set("no_clean_up", 0);
	set("outdoors", "tiezhang");

	setup();
	replace_program(ROOM);
}
