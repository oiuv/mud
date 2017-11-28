#include <ansi.h>

inherit ROOM;

string flower()
{
        int n;

        n = random(300);
        if (n == 88) return __DIR__"obj/hua4";
        if (n < 50)  return __DIR__"obj/hua";
        if (n < 80)  return __DIR__"obj/hua2";
        return __DIR__"obj/hua3";
}

void create()
{
        set("short", "草坪");
        set("long", @LONG
这里是一片青青的草坪，四周开满了各色的鲜花，一阵凉风吹
过，清新的空气中传来几缕淡淡的花香。
LONG );
        set("exits", ([
		"east" : __DIR__"kongdi",
        ]));
        set("objects", ([
		flower() : 1,
		flower() : 1,
		flower() : 1,
        ]));
        set("outdoors", "shenlong");
        setup();
}

void init()
{
        object me = this_player();

	if (objectp(present("duanchang hua", environment(me)))) 
	{
		me->apply_condition("flower_poison", 30 +
                                    (int)me->query_condition("flower_poison"));

                write(HIG "你只觉一股淡香袭来,顿时脑中一阵麻木！\n" NOR);
        }
}

void reset()
{
        set("objects", ([
		flower() : 1,
		flower() : 1,
		flower() : 1,
        ]));
        ::reset();
}
