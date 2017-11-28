inherit ROOM;

void create()
{
	set("short", "王府井街");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边接京城的交通要道东长安街，西边是繁
华的地安门东大街广场。北方穿过地东大街可以到达文庙。
LONG );
       set("exits", ([
		"north" : __DIR__"dong_3",
		"south" : __DIR__"wang_7",
		"east" : __DIR__"wang_10",
		"west" : __DIR__"di_donggc",
	]));

	set("objects", ([
		__DIR__"npc/haoke1" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

