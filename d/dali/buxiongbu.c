inherit ROOM;

void create()
{
	set("short", "步雄部");
	set("long", @LONG
这里属江川路，是摆夷的一支徒蛮聚居的地方。此地较
偏远，镇子也不大，南面一片汪洋叫做星云湖，四面山清水
秀，桑林密布。镇北是一片小平原，有着些农田。而此间桑
树多，产丝，乡间民妇多擅纺丝织麻。
LONG);
	set("objects", ([
	   	__DIR__"npc/bshangfan" : 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
                "west"   : __DIR__"banshan",
                "east"   : __DIR__"yangcanfang",
                "south"  : __DIR__"xingyunhu",
                "north"  : __DIR__"nongtian5",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

