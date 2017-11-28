inherit ROOM;

void create()
{
	set("short", "王府井");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边是京城的交通要道东长安街。东边是一
个宽阔的校场，从那里传来一阵阵士兵操练的声音。东边是朝阳道，通朝阳门，
出了朝阳门就是北京城的西郊了。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_6",
		"south" : __DIR__"wang_2",
		"east" : __DIR__"chaoyang_dao1",
		"west" : __DIR__"wang_3",
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

