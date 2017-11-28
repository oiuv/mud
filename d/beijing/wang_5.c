inherit ROOM;

void create()
{
	set("short", "王府井街");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边是京城的交通要道东长安街。向北可以
地安门东大街。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_7",
		"south" : __DIR__"wang_3",
		"east" : __DIR__"wang_6",
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

