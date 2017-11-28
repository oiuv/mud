// Room: /d/shaolin/wuxing2.c
// Date: YZC 96/02/06

#include <ansi.h>

inherit ROOM;

string* dirs = ({"east", "south", "west", "north"});

void create()
{
	set("short", HIB "五行洞" NOR);
	set("long", HIB @LONG
这是五行洞。一进这里，你就陷在齐腰深的水里，脚底是厚
厚的淤泥，一踩上去就松松地散开，还带出一大串气泡冒出水面。
最可怖的是水面上不时飘过来一两具浸得发肿的浮尸，几只老鼠
在上面爬上爬下，把尸体咬得面木全非。四壁用粗糙的片岩垒垛
而成，一颗颗水珠沿着墙壁滚下来，溅在水中．
LONG
NOR	);
	set("exits", ([
		"east" : __DIR__"wuxing1",
		"south" : __DIR__"wuxing4",
		"west" : __DIR__"wuxing0",
		"north" : __DIR__"wuxing3",
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
		if (dir == "east")
		{
//			write("*水生木*\n");
			count = me->query_temp("wuxing/木");
			count++;
			me->set_temp("wuxing/木", count);
			if (check_out(me))
				return notify_fail("你顺利地走出了五行迷宫。\n");
		}
		else if (dir == "north")
		{
//			write("*水克火*\n");
			me->delete_temp("wuxing");
			me->move(__DIR__"jianyu1");
			return notify_fail("你掉进机关，落入僧监。\n");
		}
	}
	return ::valid_leave(me, dir);
}

