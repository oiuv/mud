#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int ap;
        int dp;
        int damage;
        string msg;

        if (target == me || ! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail("你只能用寒气攻击战斗中的对手。\n");

        if (me->query_skill("bingxin-jue", 1) < 150)
                return notify_fail("你的冰心决火候不够，无法运用寒气。\n");

        if ((int)me->query("neili") < 1000)
                return notify_fail("你的内力不够!");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "默运冰心决，一股寒气迎面扑向$n"
              HIW "，四周登时雪花飘飘。\n" NOR;

        ap = me->query_skill("force");
        dp = me->query_skill("force");

        me->start_busy(2);

        if (ap / 2 + random(ap) > random(dp))
        {
                damage = ap / 3 + random(ap / 3);
                target->receive_damage("qi", damage, me);
                target->receive_wound("qi", damage, me);
                if (target->query("neili") > damage)
                        target->add("neili", damage);
                else
                        target->set("neili", 0);

                msg += HIR "$n" HIR "忽然觉得一阵透骨寒意，霎时间"
                       "浑身的血液几乎都要凝固了。\n" NOR;
                target->start_busy(1);
        } else
                msg += HIY "$n" HIY "感到一阵寒意自心底泛起，连忙"
                       "运动抵抗，堪勘无事。\n" NOR;

        message_combatd(msg, me, target);

        return 1;
}

