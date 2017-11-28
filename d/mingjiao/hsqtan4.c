// HSQTAN4.C

inherit ROOM;

void create()
{
        set("short", "深潭");
        set("long", @LONG
这里是瀑布下的寒潭，水中幽暗无比，四周似乎有几处出口，
但实在看不清是通向何处。水中冰冷刺骨，令人难以忍受，你只觉
得气力在一点一点消失。
LONG );
        set("exits", ([
                "east" : __DIR__"hsqtan5",
                "west" : __DIR__"hsqtan4",
                "south" :__DIR__"hsqtan4",
                "north" :__DIR__"hsqtan3",
        ]));
        set("no_clean_up", 0);
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

