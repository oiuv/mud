// trick.c 鬼话连篇
// Created by Doing Lu 10/7/2K

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

string name() { return HIM "鬼话连篇" NOR; }

int perform(object me, string skill)
{
        int ap, dp;
        object target;

        if (me->query("jing") < 50)
                return notify_fail("你的精神不济，难以构思谎言。\n");

        me->clean_up_enemy();
        target = me->select_opponent();

        if (! me->is_fighting())
                return notify_fail("你又不是在打架，没事说谎干什么？\n");

        if (! target->query("can_speak") || target->query("not_living"))
                return notify_fail("可惜啊！看来" + target->name() +
                                   "是听不懂你的话了。\n");

        message_vision(HIM "$N" HIM "情急生智，对着$n" HIM
                       "就来了一套长篇大论，当真是天花乱坠。\n",
                       me, target);
        ap = me->query_int();
        dp = target->query_int();
        if (me->query("character") == "狡黠多变")
                ap += ap / 4;
        if (me->query("character") == "阴险奸诈")
                ap += ap / 6;

        me->receive_damage("jing", 30 + random(20));

        if (ap / 3 + random(ap) > random(dp + 10))
        {
                // 施展鬼话连篇成功
                message_vision(HIM "$n" HIM "听得晕晕乎乎，不知所以，"
                               "手只是缓了一缓，$N" HIM "趁机溜走。\n" NOR,
                               me, target);
                me->set_temp("success_flee", HIG "你成功的逃走了！\n" NOR);
                GO_CMD->do_flee(me);
        } else
        {
                message_vision(CYN "$n" CYN "冷冷的等$N" CYN
                               "说完，才道：“你还是认命了吧"
                               "！”说罢就是一招！\n" NOR,
                               me, target);
                me->start_busy(1 + random(4));
        }

        return 1;
}
