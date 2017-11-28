inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是红花会总舵内的一条木制的走廊，红漆地面很是光滑
整个走廊被打整得一尘不染。你不时能够看到几个红花会的会
众或是弟子在此走动，忙碌个不停。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_zhengting",
  		"east" : __DIR__"hh_yanting2",
	]));
        setup();
        replace_program(ROOM);
}
