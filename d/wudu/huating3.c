#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "腾蛟亭");
        set("long", @LONG
这里是一个花园中的小亭子，雕梁画栋，古色古香。壁上
挂着一幅「月下舞剑图」。
LONG);

        set("exits", ([
                "south" : __DIR__"huating1",
                "west" : __DIR__"huayuan3",
        ]));

        set("item_desc", ([
                "tu": HIY "\n你只见图中少女手持钢钩，含笑而立。恍惚间你"
                      "似乎觉得有无\n数道剑气扑面而来。这里面似乎隐含着"
                      "某种奥秘。\n\n" NOR,
        ]));
        setup();
}

void init()
{
        add_action("do_think", "think");
}

int do_think(string arg)
{
        object me = this_player();
        int add;

        if (me->query("special_skill/clever"))
                add = me->query_int() * 4;
        else
                add = me->query_int() * 3;

        if (! living(me) || arg != "tu")
                return notify_fail("你要参悟什么？\n");

        if (me->is_busy() || me->is_fighting())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("sword", 1) < 30)
                return notify_fail("你的基本剑法火候不够，无法领悟图画"
                                   "上的剑法。\n");

        if ((int)me->query_skill("jinwu-goufa", 1) < 30)
                return notify_fail("你发现图中所记载的剑法过于深奥，自"
                                   "己一时难以领会。\n");

        if ((int)me->query_skill("jinwu-goufa", 1) > 150)
                return notify_fail("你发现图中所记载的剑法过于肤浅，自"
                                   "己无法领会到任何东西。\n");

        if ((int)me->query("jing") < 25)
                return notify_fail("你现在精神不济，过于疲倦，还是休息"
                                   "一会吧。\n");

        me->receive_damage("jing", 20);

        if (me->can_improve_skill("jinwu-goufa"))
                me->improve_skill("jinwu-goufa", add);

        me->start_busy(random(2));
        message_vision(HIY "\n$N" HIY "聚精会神的参详图中所记载的剑法，"
                       "似有所悟。\n" NOR, me);
        write(HIC "你对「金蜈钩法」有了新的领悟。\n" NOR);
        return 1;
}
