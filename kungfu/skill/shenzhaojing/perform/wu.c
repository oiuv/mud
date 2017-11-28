#include <ansi.h>
#include <combat.h>

#define WU "「" HIR "无影拳舞" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int count;
        int i;
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        //if (userp(me) && ! me->query("can_perform/shenzhaojing/wu"))
         //       return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(WU "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能施展" WU "。\n");

        if (me->query_skill_mapped("unarmed") != "shenzhaojing")
                return notify_fail("你没有激发神照经神功为拳脚，无法施展" WU "。\n");

        if (me->query_skill_prepared("unarmed") != "shenzhaojing")
                return notify_fail("你现在没有准备使用神照经神功，无法施展" WU "。\n");

        if ((int)me->query_skill("shenzhaojing", 1) < 200)
                return notify_fail("你的神照经神功火候不够，无法施展" WU "。\n");

        if ((int)me->query_skill("unarmed", 1) < 200)
                return notify_fail("你的基本拳脚火候不够，无法施展" WU "。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，无法施展" WU "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，无法施展" WU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "一声暴喝，将神照功功力聚之于拳，携着雷霆万"
              "钧之势向$n"HIR"连环攻出。\n"NOR;

        ap = me->query_skill("force") + me->query("con") * 10;
        dp = target->query_skill("dodge") + target->query("dex") * 10;

        if (ap / 2 + random(ap) > dp)
        {
                count = ap / 10;
                msg += HIR "$n" HIR "面对$N" HIR "这排山倒海的攻"
                       "势，不禁心生惧意，慌乱中破绽迭出。\n" NOR;
        } else
        {
                msg += HIC "$n" HIC "微一凝神，面对$N" HIC "这排"
                       "山倒海的攻势却丝毫不乱，小心招架。\n" NOR;
                count = 0;
        }

        message_combatd(msg, me, target);
        me->add_temp("apply/attack", count);

        me->add("neili", -200);
        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 0 && ! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
        }

        me->start_busy(1 + random(5));
        me->add_temp("apply/attack", -count);

        return 1;
}
