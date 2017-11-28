// Yanwu.c 烟雾弹

#include <command.h>
#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "烟雾弹" NOR, ({ "yanwu dan", "yanwu", "dan" }) );
        set_weight(100);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一颗特制的烟雾弹。它可以用(apply)来制造混乱，趁机逃走。\n");
                set("unit", "个");
                set("value", 10000);
		set("no_sell", 1);
                set("can_apply_for_wimpy", 1);
        }
        setup();
}

void init()
{
        add_action("do_apply","apply");
}

int apply_for_wimpy(object me)
{
        object *obs;
        int i;
        int sc;

        if (me->is_busy())
                return notify_fail("你现在正在忙着呢。\n");

        me->clean_up_enemy();
        if (me->is_fighting())
        {
                obs = me->query_enemy();
                for (i = 0; i < sizeof(obs); i++)
                {
                        if (! living(obs[i]))
                                continue;
                        sc = obs[i]->query("score") -
                             me->query("score");
                        if (sc < 0) continue;
                        if (sc > 300000) sc = 300000;
                        if (sc / 4 + random(sc) > 100000)
                        {
                                message_vision("\n$N掏出烟雾弹就往地上扔，然而$n"
                                               "大喝一声道：“也不看看" +
                                               RANK_D->query_self(obs[i]) +
                                               "行走江湖有多少年，你居然还敢玩这种把戏？”\n"
                                               "说罢只见$n一脚将$N扔在地上的烟雾弹踢到一旁。\n",
                                               me, obs[i]);
                                destruct(this_object());
                                return 1;
                        }
                }
        }

        me->set_temp("no_follow",1);
        tell_room(environment(me), HIM "\n地面突然腾出一股桃红色的"
				   "烟雾，大家什么也看不见，陷入"
				   "混乱之中。\n" NOR);

	me->set_temp("success_flee", "你借着混乱成功的逃走了。\n");
        GO_CMD->do_flee(me);
        destruct(this_object());
        return 1;
}

int do_apply(string arg)
{
        if (! arg || ! id(arg))
                return notify_fail("你要用什么？\n");

        return apply_for_wimpy(this_player());
}
