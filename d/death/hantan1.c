#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIB "【碧水寒潭】" NOR);
        set("long", HIB @LONG

                    碧     水     寒     潭

    这里便是阴司的碧水寒潭，传说四神兽之首的青龙常常出没于此潭
中。潭中冰水中幽暗无比，四周似乎有几处出口，但实在看不清是通向
何处。水中冰冷刺骨，令人难以忍受，你只觉得气力在一点一点消失。


LONG NOR );

        set("exits", ([
                "east" : __DIR__"hantan1",
                "west" : __DIR__"hantan1",
                "south" :__DIR__"hantan1",
                "north" :__DIR__"hantan2",
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
        object me;
        int meqi, meneili, decqi, mq;
        me = this_player();

        if ( present("diyin xuemai", me))
        {
                tell_object(me, RED "你怀中的地阴血脉发出一阵阵热量，护住了周身的"
                                "经脉！\n" NOR);
                return 0;
        }
        tell_object(me, HIW "你身陷碧水寒潭，潭中寒冰削肉刮骨，你"
                        "只觉浑身血液都被冻住一般！\n" NOR);
        meqi = (int)me->query("qi");
        meneili = (int)me->query("neili");
        mq = (int)me->query("max_qi");
        decqi = (int)( mq / (random(4) + 5 + meneili/200) );
        meqi = meqi - decqi;
        me->set("neili", 0);

        if(meqi > 0)
        {
                me->set("qi", meqi);
        }
   else {
                me->set_temp("die_reason", "在碧水寒潭给活活冻死了");
                me->die();
        }
        return 0;
}
