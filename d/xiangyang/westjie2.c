inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这儿是很大的十字街口，北边是西内大街，南面是一座彩
楼，楼前高高的挂着一方大匾，上面用正楷写着「聚义馆」三
个大字。东边通向中央广场，西面可达白虎门。
LONG);
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"westjie1",
		"west"  : __DIR__"westjie3",
		"south" : __DIR__"juyiyuan",
		"north" : __DIR__"westroad1",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

