inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
这是玄冥峰的山路，四周树木高耸，走兽成群。
LONG );
	set("exits", ([
		"northdown"    : __DIR__"xuanminggu",
		"southdown"    : __DIR__"shanlu2",
	]));

	set("outdoors", "xuanming");
	setup();
	replace_program(ROOM);
}

