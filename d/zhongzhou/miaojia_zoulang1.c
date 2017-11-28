inherit ROOM;

void create()
{
	set("short", "走廊");
	set("long", @LONG
这是一条木制的走廊，地面很是光滑，被打整得一尘不染。
几个苗家的丫鬟在此走动。走廊的两边分接正厅和后厅。
LONG);
	set("exits", ([
  		"east"  : __DIR__"miaojia_houting",
  		"west" : __DIR__"miaojia_zhengting",
  		"north" : __DIR__"miaojia_jushi",
	]));
        set("objects", ([
                __DIR__"npc/yahuan" : 1,
        ]));

	set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}
