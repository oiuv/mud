inherit ROOM;

void create()
{
	set("short", "王府井");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边是京城的交通要道东长安街。可以望见
西边有一座富丽堂皇的建筑，那是当朝皇上的第一宠臣——韦公爷的府邸。东
边就是京城的刑场，是朝廷处决钦犯的场所。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_4",
		"south" : __DIR__"caroad_e2",
		"east" : __DIR__"xingchang",
		"west" : __DIR__"wang_1",
	]));
	set("objects", ([
		__DIR__"npc/shusheng1" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

