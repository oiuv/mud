inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
你走在西大街上，感到这里的街面要比别处的干净、整洁。
大概因为靠近衙门、兵营可受保护的缘故，富人们都喜欢住在
这里。东边静悄悄地没有几个行人，西边是西城门。南边是座
武馆，北边是一所大宅院，门前还聚着一些叫花子。
LONG);
        set("outdoors", "city");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"xidajie1",
		"south" : __DIR__"wuguan",
		"west"  : __DIR__"ximen",
		"north" : __DIR__"ma_damen",
	]));

        set("objects", ([
                "/d/gaibang/npc/1dai" : 1 + random(2),
        ]));

	setup();
	replace_program(ROOM);
}

