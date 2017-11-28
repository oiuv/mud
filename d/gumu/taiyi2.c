
#include <ansi.h>;
inherit ROOM;

void create()
{
        set("short", "太乙池");
        set("long", @LONG
你身在湖水里，只觉得湖水冰凉透骨。但见四周高峰环列，
池面碧波荡漾，山光水影，风景贻人。这里原来是太乙池的东
岸，太累的话，你可以爬(climb) 上岸。远远望去，西边的山
峰之间似乎有一个大洞。想不想游(swim)过去看？
LONG
        );
        set("outdoors", "quanzhen");
        setup();
}

void init()
{
        add_action("do_climb", "climb");
        add_action("do_swim", "swim");
}

int do_climb(string arg)
{
        object me = this_player(); 

        if( !arg || arg != "up")
        {
                write("那个方向没法爬。\n");
                return 1;
        }

        message_vision("$N在太乙池中往岸上爬了上去。\n", me);
        me->move("/d/gumu/taiyi1");
        message_vision("$N从太乙池中爬了上去。\n", me);
        return 1;
}

int do_swim()
{
        int c_skill;
        object me = this_player();

        c_skill = me->query_skill("jinyan-gong", 1);

        if (me->query("qi") < 40)
                return notify_fail("你现在体力不支，没有力气游泳。\n");

        me->receive_damage("qi", 20 + random(20));
        message_vision("$N在太乙池中划了划水，用力游了起来。\n", me);
        if (c_skill < 1)
                return 1;

        if (me->can_improve_skill("jinyan-gong") && c_skill < 51)
                me->improve_skill("jinyan-gong", 1 + me->query_skill("jinyan-gong", 1) / 15);
        return 1;
}
