// Room: /d/shaolin/wuxing1.c
// Date: YZC 96/02/06

#include <ansi.h>

inherit ROOM;

string* dirs = ({"east", "south", "west", "north"});

void create()
{
	set("short", HIG "五行洞" NOR);
	set("long", HIG @LONG
这是五行洞。这里地面相对比较干燥些，四壁由宽厚的木板
严严实实的地封了起来，叩上去发出沉闷的笃笃声，看来不是实
心的就是有几尺厚，没有斧凿等利器休想劈开它们。不过你还是
想下手试一试，希望能从这里打开缺口。
LONG
NOR	);
	set("exits", ([
		"east" : __DIR__"wuxing0",
		"south" : __DIR__"wuxing3",
		"west" : __DIR__"wuxing4",
		"north" : __DIR__"wuxing2",
	]));
	set("no_clean_up", 0);
	setup();
}

int check_out(object me)
{
	int metal, wood, water, fire, earth;

	metal = me->query_temp("wuxing/金");
	wood = me->query_temp("wuxing/木");
	water = me->query_temp("wuxing/水");
	fire = me->query_temp("wuxing/火");
	earth = me->query_temp("wuxing/土");

	if ( metal > 0 &&
		metal == wood && metal == water &&
		metal == fire && metal == earth )
	{
		me->delete_temp("wuxing");
		me->move(__DIR__"andao2");
		return (1);
	}
	return (0);
}

int valid_leave(object me, string dir)
{
	int count;

	if (member_array(dir, dirs) != -1)
	{
		if (dir == "south")
		{
//			write("*木生火*\n");
			count = me->query_temp("wuxing/火");
			count++;
			me->set_temp("wuxing/火", count);
			if (check_out(me))
				return notify_fail("你顺利地走出了五行迷宫。\n");
		}
		else if (dir == "west")
		{
//			write("*木克土*\n");
			me->delete_temp("wuxing");
			me->move(__DIR__"jianyu1");
			return notify_fail("你掉进机关，落入僧监。\n");
		}
	}
	return ::valid_leave(me, dir);
}

