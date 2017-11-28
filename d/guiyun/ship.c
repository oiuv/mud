// Room: /guiyun/ship.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "战船");
	set("long", @LONG
这是一艘大渔船，船上的人白天打鱼，晚上就干些没本钱的买
卖，接济沿湖的百姓。
LONG );
        set("outdoors", "city");
	set("no_clean_up", 0);
	set("objects", ([
		__DIR__"npc/haojie" : 1,
	]));
	setup();
	replace_program(ROOM);
}
