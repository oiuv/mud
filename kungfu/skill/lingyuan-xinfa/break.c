// break -「以柔破钢」
// made by deaner

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;
int exert(object me, object target)
{
        string msg;
        object target_w;

        target_w = target->query_temp("weapon");

        if (! target || target == me)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
                return notify_fail("你只能对战斗中的对手使用「以柔破钢」。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正在发愣，是进攻的好时机！\n");

        if ((int)me->query_skill("lingyuan-xinfa", 1) < 150)
                return notify_fail("你的灵元心法火候不够，还不会使用「以柔破钢」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "沉肩滑步，自丹田中升起一股阴柔之气"
              "顺着血脉经络传至双手劳宫穴，接着这股阴柔之气就"
              "激射而出，喷向$n" HIC "手中的兵刃！\n" NOR;
        me->start_busy(2);

        if (target->query_temp("weapon") || target->query_temp("secondary_weapon"))
        {
                if (random(me->query("combat_exp")) >
                    (int)target->query("combat_exp") / 3)
                {
                        msg += HIW "结果$p" HIW "手中的" +
                               target_w->query("name") +
                               "与这股阴柔之气一碰竟被震落在地上！\n" NOR;
                        target_w->unequip();
                        target_w->move(environment(target));
                        target->reset_action();
                        target->start_busy((int)me->query_skill("lingyuan-xinfa") / 20);
                } else
                {
                        msg += CYN "可是$p" CYN "急急拆招，躲了"
                               "开去，使$P" CYN "的计谋没有得逞。\n" NOR;
                }
                message_combatd(msg, me, target);
                return 1;
        }
        return notify_fail(target->name() + "目前是空手，没什么必要施展「以柔破钢」。\n");
}
