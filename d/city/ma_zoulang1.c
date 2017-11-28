inherit ROOM;

void create()
{
        set("short", "走廊");
        set("long", @LONG
这是马庄内的一条木制的走廊，红漆地面很是光滑。整个
走廊被打整得一尘不染。你不时能够看到几个丐帮的弟子在此
走动，忙碌个不停。
LONG);
        set("exits", ([
                "south"  : __DIR__"ma_zhengting",
                "north"  : __DIR__"ma_zoulang2",
        ]));
        set("objects", ([
		"/d/gaibang/npc/1dai" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
