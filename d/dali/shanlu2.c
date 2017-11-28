inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", @LONG
一条山路，四面皆是茂密的树林和延绵不绝的大山，道路两旁间
或可见一些夷族的村镇，西面一片高山高耸入云，山颠白雪皑皑终年
不化。正路向西上山，一条岔路向南北蜿蜒着。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "east"    : __DIR__"shanlu3",
                "south"   : __DIR__"shanlu4",
                "northup" : __DIR__"nianhuasi",
                "westup"  : __DIR__"biluoxueshan",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

