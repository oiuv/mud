inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "走廊");
        set("long", @LONG
这里是殿堂走廊。房顶一侧支在南面的高墙上，另一侧则
与北边殿堂的屋顶相连。彩梁画栋，连顶棚也用彩漆绘满了各
种飞天的图形，每幅画似乎都在诉说一个娓娓动人的故事。
LONG);

        set("exits", ([
                "southeast" : __DIR__"zoulange",
                "southwest" : __DIR__"zoulangw",
                "north" : __DIR__"mishi",
        ]));
        set("maze", 1);
        set("objects", ([
                __DIR__"npc/waer" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        int i;
        if (dir == "north")
	{
                i = (int)me->query_temp("long_road");
                i = i + 1;
                if (i == 4)
		{
                	me->delete_temp("long_road");
                	return 1;
                } else
		{
                        me->set_temp("long_road", i);
                	return notify_fail(HIW "\n霎时间，只听前面一个阴森森的声音喝"
                                           "道：“我已经在这里安\n安静静地住了一千年"
                                           "，最讨厌人来打扰我。只要有谁敢大胆过\n来"
                                           "，就立刻给我死。”你顿时只觉得心底涌气一"
                                           "股寒意，脚下\n直哆嗦，不禁放慢了脚步。\n\n" NOR);
                }
        } else
        if (dir == "south")
	{
               	me->delete_temp("long_road");
               	return 1;
        }
	return 1;
}
