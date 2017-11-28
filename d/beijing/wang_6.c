inherit ROOM;

void create()
{
	set("short", "王府井");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边是京城的交通要道东长安街，东边邻街
处有一家当铺。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_8",
		"south" : __DIR__"wang_4",
		"west" : __DIR__"wang_5",
		"east" : __DIR__"dangpu",
	]));

	set("objects", ([
		__DIR__"npc/boy2" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

