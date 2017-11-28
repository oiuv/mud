#include <ansi.h>
#include <combat.h>

#define FENG "「" HIW "风雨交加" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/longcheng-shendao/feng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你所使用的武器不对，难以施展" FENG "。\n");

	if ((int)me->query_skill("longcheng-shendao", 1) < 120)
		return notify_fail("你的龙城神刀不够娴熟，难以施展" FENG "。\n");

	if ((int)me->query_skill("force", 1) < 150)
		return notify_fail("你的内功修为不足，难以施展" FENG "。\n");

        if (me->query_skill_mapped("blade") != "longcheng-shendao")
                return notify_fail("你没有激发龙城神刀，难以施展" FENG "。\n");

	if (me->query("neili") < 270)
		return notify_fail("你目前的真气不够，难以施展" FENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "大喝一声，施出绝招「" HIW "风雨交加" HIC "」手"
              "中的" + weapon->name() + HIC "如雨点一般向$n" HIC "打去，$n" HIC 
              "如同小舟一般在刀雨中漂泊不定。\n" NOR;

        attack_time = 3;

	ap = me->query_skill("blade");
	dp = target->query_skill("dodge");

        attack_time += random(ap / 40);

        if (attack_time > 7)
                attack_time = 7;

	me->add("neili", -attack_time * 25);

	if (ap / 2 + random(ap) > dp)
	{
		msg += HIR "$n" HIR "见$P" HIR "这招来势汹涌，势不可"
                      "挡，被$N" HIR "攻得连连后退。\n" NOR;
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这几刀来势迅猛无比，毫"
                       "无破绽，只得小心应付。\n" NOR;
        }

        message_combatd(msg, me, target);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, weapon, 20);
        }

	me->start_busy(1 + random(attack_time));

        return 1;
}
