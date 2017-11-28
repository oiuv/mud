// Yanwu.c 烟雾弹

#include <command.h>
#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "麝香粉" NOR, ({ "shexiang fen" }) );
        set_weight(80);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "一包散发出异香的药粉。它可以用(apply)来散发香味，借机逃走。\n");
                set("unit", "包");
                set("value", 100000);
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
                        if (sc > 500000) sc = 500000;
                        if (sc / 4 + random(sc) > 200000)
                        {
                                message_vision("\n$N掏出麝香粉就往空中一洒，然而$n"
                                               "大喝一声道：“也不看看" +
                                               RANK_D->query_self(obs[i]) +
                                               "行走江湖有多少年，你居然还敢玩这种把戏？”\n"
                                               "说罢只见$n伸手一挥，将$N的香粉全部震开。\n",
                                               me, obs[i]);
                                destruct(this_object());
                                return 1;
                        }
                }
        }

        me->set_temp("no_follow",1);
        tell_room(environment(me), HIM "\n忽然一阵异香传来，真是"
				   "沁人心肺，舒泰无比，众人一时间只想睡觉。\n" NOR);

	me->set_temp("success_flee", "你借着众人迷乱成功的逃走了。\n");
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
