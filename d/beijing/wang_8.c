inherit ROOM;

void create()
{
	set("short", "王府井");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边接京城的交通要道东长安街，西边通往
地安门东大街。从东边传来一阵嘈杂的喧闹声，那是京城著名的怡红院。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_10",
		"south" : __DIR__"wang_6",
		"east" : __DIR__"yihongyuan",
		"west" : __DIR__"wang_7",
	]));

	set("objects", ([
		__DIR__"npc/richman1" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

