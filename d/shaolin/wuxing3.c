// Room: /d/shaolin/wuxing3.c
// Date: YZC 96/02/06

#include <ansi.h>

inherit ROOM;

string* dirs = ({"east", "south", "west", "north"});

void create()
{
	set("short", HIR "五行洞" NOR);
	set("long", HIR @LONG
这是五行洞。进来顿觉一股热浪扑面而来，冲得你差点晕了
过去。四周一片通红，地面上冒着丝丝白气，脚底剧烈的炙痛使
你几乎立脚不住。热风带着隆隆巨响冲击着耳鼓，令你觉得置身
洪炉之中，全身的水分都在被一滴滴地烤干。墙角上几具枯柴般
的干尸就证明了这一点。
LONG
NOR	);
	set("exits", ([
		"east" : __DIR__"wuxing1",
		"south" : __DIR__"wuxing2",
		"west" : __DIR__"wuxing0",
		"north" : __DIR__"wuxing4",
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
//			write("*火生土*\n");
			count = me->query_temp("wuxing/土");
			count++;
			me->set_temp("wuxing/土", count);
			if (check_out(me))
				return notify_fail("你顺利地走出了五行迷宫。\n");
		}
		else if (dir == "west")
		{
//			write("*火克金*\n");
			me->delete_temp("wuxing");
			me->move(__DIR__"jianyu1");
			return notify_fail("你掉进机关，落入僧监。\n");
		}
	}
	return ::valid_leave(me, dir);
}

