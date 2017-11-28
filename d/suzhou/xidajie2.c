inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
你走在西大街上，感到这里的街面要比别处的干净、整洁。
大概因为靠近衙门、兵营可受保护的缘故，富人们都喜欢住在
这里。东边静悄悄地没有几个行人，西边是西城门通往郊外。
南边是玄妙观，北边是一个书堂。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east" : __DIR__"xidajie1",
		"west" : __DIR__"ximen",
		"north" : __DIR__"shuchang",
		"south" : __DIR__"xuanmiao",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

