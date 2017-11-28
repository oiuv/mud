inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
这里是襄阳城里的繁华地段，虽然久经战火，但在郭靖等
人的保卫下，襄阳的老百姓过着非常安安稳稳的生活。西边是
襄阳城内最大的一家赌场。东边是一座两层的楼阁，挂着“酒”
的招帘，门额上悬挂一方横匾，上书“觅香楼”三字。一阵阵
酒肉香味扑鼻而来。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"nixianglou",
		"west"  : __DIR__"duchang",
		"south" : __DIR__"southjie3",
		"north" : __DIR__"southjie1",
	]));
	set("objects", ([
		"/d/city/npc/liumang" : 1,
                "/clone/npc/walker" : 1,
	]));
	setup();
	replace_program(ROOM);
}
