inherit ROOM;

void create()
{
	set("short", "王府井");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边接京城的交通要道东长安街，西边不远
处是繁华的地安门东大街广场。北方是京城著名的“全聚德”烤鸭店。东边是
一家戏院，是京城百姓休息和娱乐的场所。
LONG );
       set("exits", ([
		"north" : __DIR__"quanjude",
		"south" : __DIR__"wang_8",
		"west" : __DIR__"wang_9",
		"east" : __DIR__"xiyuan",
	]));

	set("objects", ([
		__DIR__"npc/youren" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

