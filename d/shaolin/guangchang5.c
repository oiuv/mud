// Room: /d/shaolin/guangchang5.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "广场");
	set("long", @LONG
这是千佛殿前的一个广场。往北上了台阶就是供奉西天诸佛
的千佛殿。往西是供奉地藏王菩萨的地藏殿，往东是供奉白衣观
音大士的白衣殿。这里每年都有不少香客聚集举办水陆大法会。
LONG );
	set("exits", ([
		"east" : __DIR__"bydian",
		"west" : __DIR__"dzdian",
		"south" : __DIR__"wuchang3",
		"northup" : __DIR__"qfdian",
		"southup" : __DIR__"dmyuan",
	]));
	set("outdoors", "shaolin");
	setup();
}

int valid_leave(object me, string dir)
{
	if( !me->query("luohan_winner") && !wizardp(me))
	{
		if (dir == "southup")
		{
			return notify_fail("你级别不够，不能进入达摩院。\n");
		}
	}
	return ::valid_leave(me, dir);
}

