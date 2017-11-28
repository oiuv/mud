// Room: /d/shaolin/wuxing0.c
// Date: YZC 96/02/06

#include <ansi.h>

inherit ROOM;

string* dirs = ({"east", "south", "west", "north"});

void create()
{
	set("short",HIY "五行洞" NOR);
	set("long", HIY @LONG
这是五行洞。四周一片亮晶晶的，定睛细看，却是无数锋利
的刀尖从墙上，地上，顶上，四面八方向你伸过来，稍不留神就
会自己撞到刀尖上去。刀光眩目，更添彻骨寒意。几具血淋淋的
断肢残骸挂在刀尖上，看来已经有些时日了。墙壁黑乎乎的，似
是钢铁铸成。
LONG
NOR	);
	set("exits", ([
		"east" : __DIR__"wuxing4",
		"south" : __DIR__"wuxing3",
		"west" : __DIR__"wuxing1",
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
		if (dir == "north")
		{
//			write("*金生水*\n");
			count = me->query_temp("wuxing/水");
			count++;
			me->set_temp("wuxing/水", count);
			if (check_out(me))
				return notify_fail("你顺利地走出了五行迷宫。\n");
		}
		else if (dir == "west")
		{
//			write("*金克木*\n");
			me->delete_temp("wuxing");
			me->move(__DIR__"jianyu1");
			return notify_fail("你掉进机关，落入僧监。\n");
		}
	}
	return ::valid_leave(me, dir);
}

