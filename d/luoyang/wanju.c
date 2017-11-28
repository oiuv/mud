inherit ROOM;

void create()
{
	set("short", "玩具店");
	set("long", @LONG
这是一家手艺店，店面不大，但里面各种各样的手工制品还真不少呢，
各式各样的小泥人，五颜六色的布娃娃，还有一些用木材和竹子做成的小
玩艺，引起了来这里的小孩子们的注意，想不想也买个玩玩。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"miaohui",
                "west" : __DIR__"fengwei",
                "east" : __DIR__"hutong2",
                "north" : __DIR__"roudian",
	]));
        set("objects", ([
                "/d/beijing/npc/kid1" : 1,
        ]));

	setup();
	replace_program(ROOM);
}
