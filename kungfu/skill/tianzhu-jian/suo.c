#include <ansi.h>
#include <combat.h>

#define SUO "「" HIW "烟云锁身" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg, wp, wp2;
        object weapon, weapon2;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/tianzhu-jian/suo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SUO "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对，难以施展" SUO "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("tianzhu-jian", 1) < 120)
                return notify_fail("你天柱剑法不够娴熟，难以施展" SUO "。\n");

        if (me->query_skill_mapped("sword") != "tianzhu-jian")
                return notify_fail("你没有激发天柱剑法，难以施展" SUO "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" SUO "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" SUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wp = weapon->name();
        ap = me->query_skill("tianzhu-jian", 1);
        dp = target->query_skill("parry", 1);

        if (me->query("max_neili") > target->query("max_neili") * 3 / 2
           && objectp(weapon2 = target->query_temp("weapon")))
        {
                wp2 = weapon2->name();

		msg = HIW "\n$N" HIW "剑法陡然变快，施展出「烟云锁身剑」，手中" +
                      wp + HIW "幻作一道白芒，撩向$n" HIW "所持的" + wp2 + HIW
                      "。" NOR;

                message_sort(msg, me, target);

       		me->start_busy(2);
       		me->add("neili", -200);

	        if (random(ap) > dp / 2)
        	{
                	msg = HIR "$n" HIR "只见眼前白芒暴涨，登时右手一轻，"
                              + wp2 + HIR "竟脱手飞出。\n" NOR;

                	target->start_busy(3);
                        weapon2->move(environment(target));
        	} else
		{
        		msg += CYN "可是$n" CYN "看破$N" CYN "剑法中的虚招，镇"
                               "定自如，从容应对。\n" NOR;
        	}
	} else
	{
		msg = HIC "\n$N" HIC "剑法陡然变快，施展出「" HIW "烟云锁身剑"
                      HIC "」，手中" + wp + HIC "剑光夺目，欲将$n" HIC "笼罩在"
                      "剑光之中。" NOR;

       		me->start_busy(1);
        	me->add("neili", -100);

	        if (random(ap) > dp / 2)
        	{
                	msg += HIR "\n$n" HIR "惊慌不定，顿时乱了阵脚，竟被困于$N"
                               HIR "的剑光当中。" NOR;

                        target->start_busy(ap / 25 + 1);
        	} else
		{
        		msg += CYN "\n可是$n" CYN "看破$N" CYN "剑法中的虚招，镇"
                               "定自如，从容应对。" NOR;
        	}
	}
        message_combatd(msg, me, target);
        return 1;
}
