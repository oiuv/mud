inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
你走在东大街上，踩着坚实的青石板地面。东边是东大街
的延伸，南面是苏州城里一个老字号的当铺，北面是一条小胡
同。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"  : __DIR__"zhongxin",
		"east"  : __DIR__"dongdajie2",
		"north" : __DIR__"hutong1",
		"south" : __DIR__"dangpu",
	]));
	set("objects", ([
		__DIR__"npc/kid" : 1,
	]));
	setup();
	replace_program(ROOM);
}

