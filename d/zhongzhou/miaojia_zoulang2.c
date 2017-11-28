inherit ROOM;

void create()
{
	set("short", "走廊");
	set("long", @LONG
这是一条木制的走廊，地面很是光滑，被打整得一尘不染。
几个苗家的丫鬟在此走动。走廊的北边是一个院子。
LONG);
	set("exits", ([
  		"south" : __DIR__"miaojia_houting",
  		"north" : __DIR__"miaojia_houyuan",
	]));
	set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}
