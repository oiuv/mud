// Room: /d/xiangyang/eastjie1.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。东边是一
个大十字街口。西面是襄阳的中央广场，北边是襄阳守城大将
王坚的府邸大门，只见那儿守备森严，闲杂人等一般是不能接
近的。南面飘来一缕缕的药香，噢，原来是一家药铺。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"eastjie2",
		"west"  : __DIR__"guangchang",
		"south" : __DIR__"yaopu",
		"north" : __DIR__"jiangjungate",
	]));
	setup();
	replace_program(ROOM);
}

