// HSQTAN5.C

inherit ROOM;

void create()
{
        set("short", "深潭");
        set("long", @LONG
这里是瀑布下的寒潭，水中幽暗无比，水中冰冷刺骨，令人难
以忍受，你只觉得气力在一点一点消失。四周有几处出口，东面的
似乎有些亮光透来。
LONG );
        set("exits", ([
                "east" : __DIR__"hsqtan6",
                "west" : __DIR__"hsqtan4",
                "south" :__DIR__"hsqtan5",
                "north" :__DIR__"hsqtan5",
        ]));
        setup();
}

void init()
{
        object me;
        int meqi, meneili, decqi, mq;

        me = this_player();
        meqi = (int)me->query("qi");
        meneili = (int)me->query("neili");
        mq = (int)me->query("max_qi");
        decqi = (int) (mq / (random(4) + 5 + meneili / 200));
        meqi = meqi - decqi;
        me->set("neili", 0);
        if (meqi > 0) me->set("qi",meqi);
        else
        {
                me->set_temp("die_reason", "活活的冻死在冰冷的水中");
                me->die();
        }
}

