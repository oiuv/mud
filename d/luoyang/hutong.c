inherit ROOM;

void create()
{
	set("short", "胡同口");
	set("long", @LONG
往里走就是洛阳城内老百姓的居住区。只见胡同口两边是有些小店面，
有米行、小杂货铺等。一些居民从这里进进出出。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"eroad5",
  		"north" : __DIR__"hutong2",
	]));

	setup();
	replace_program(ROOM);
}
