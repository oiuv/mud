#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "高昌迷宫");
        set("long", @LONG
这是条黑沈沈的长甬道，甬道前出现了三条岔道。迷宫之
内并无足迹指引，你不知道要往哪条路走。俯身细看，见左首
右首和前方三条路上都有淡淡的足迹。你似乎迷失了方向，象
没头苍蝇般到处乱闯。
LONG);
        set("exits", ([
                "east" : __DIR__"shulin" + (random(8) + 6),
                "west" : __DIR__"shulin" + (random(8) + 6),
                "south" : __DIR__"shulin" + (random(8) + 6),
                "north" : __DIR__"shulin" + (random(8) + 6),
        ]));

        set("outdoors", "gaochang");
        setup();
}

void init()
{
        object me = this_player();

        if (userp(me) && random(2) == 0)
	{
        	message_vision(HIR "\n$N" HIR "一不小心触动了机关，顿时只听得头"
                               "上一阵巨响，一块巨石当头落下。\n$N" HIR "一声惨"
                               "叫，痛得几乎失去了知觉……\n" NOR, me);
        	if ((int)me->query("eff_qi") < 80)
		{
                        me->set_temp("die_reason", "被巨石砸死了");
			me->die();
		} else
		{
	                me->receive_wound("qi", 80);
			me->unconcious();
		}
	}
        return 0;
}

