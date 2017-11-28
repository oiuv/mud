#include <ansi.h>
#include <combat.h>

#define TIAN "「" HIW "天下无狗" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp, count;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/dagou-bang/tian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TIAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对，难以施展" TIAN "。\n");

        if (me->query_skill("dagou-bang", 1) < 220)
		return notify_fail("你打狗棒法不够娴熟，难以施展" TIAN "。\n");

        if (me->query_skill_mapped("staff") != "dagou-bang")
                return notify_fail("你没有激发打狗棒法，难以施展" TIAN "。\n");

	if ((int)me->query_skill("force") < 300)
		return notify_fail("你的内功火候不足，难以施展" TIAN "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" TIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "手中" + weapon->name() + HIW "一卷，带"
              "起阵阵风声，犹若千百根相似，层层叠叠将$n" HIW "笼罩"
              "其中。\n" NOR;

        ap = me->query_skill("staff") +
             me->query_skill("martial-cognize",1);

        dp = target->query_skill("dodge") +
             target->query_skill("martial-cognize",1);

        attack_time = 5;

        if (ap / 2 + random(ap) > dp)
        {
                msg += HIR "$n" HIR "只觉眼花缭乱，发现四面八方皆是杖"
                       "影，心底寒意顿生，招架散乱。\n" NOR;
                count = ap / 8;
                me->add_temp("apply/attack", count);
               // me->add_temp("apply/damage", count / 2);
               me->add_temp("apply/damage", count);
                attack_time += random(ap / 45);
        } else
        {
                msg += HIY "$n" HIY "只觉眼前一花，发现四面八方皆是杖"
                       "影，急忙收敛心神，仔细招架。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        if (attack_time > 9)
                attack_time = 9;

        me->add("neili", -attack_time * 30);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, weapon, 0);
        }
        me->add_temp("apply/attack", -count);
        //me->add_temp("apply/damage", -count / 2);
        me->add_temp("apply/damage", -count);
        me->start_busy(1 + random(attack_time));

        return 1;
}
