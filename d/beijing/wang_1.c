inherit ROOM;

void create()
{
	set("short", "王府井街");
	set("long", @LONG
这里就是京城最为著名的王府井大街。你走在这条繁忙的街道上，街道上
车水马龙，人来人往，热闹非凡。南边是京城的交通要道东长安街。西边是一
座富丽堂皇的建筑，那是当朝皇上的第一宠臣——韦公爷的府邸。东边不远是
京城的刑场，是朝廷处决钦犯的场所。
LONG );
       set("exits", ([
		"north" : __DIR__"wang_3",
		"south" : __DIR__"caroad_e1",
		"east" : __DIR__"wang_2",
		"west" : __DIR__"weifu_men",
	]));
	set("objects", ([
		__DIR__"npc/youren" : 1,
	]));

	setup();
       set("outdoors", "beijing");
	replace_program(ROOM);
}

