inherit ROOM;

void create()
{
	set("short", "走廊");
	set("long", @LONG
这是商家堡内的一条木制的走廊，红漆地面很是光滑，整个
走廊被打整得一尘不染。你不时能够看到几个商家堡的家丁在此
走动，忙碌个不停。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_zoulang2",
		"south"  : __DIR__"shang_houting",
	]));
        set("objects", ([
                __DIR__"npc/shang1" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
