#include <ansi.h>
#include <combat.h>

#define ZHI "「" HIW "无所不至" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int count;
	int i, attack_time;

        if (userp(me) && ! me->query("can_perform/sanwu-shou/zhi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(ZHI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你所使用的武器不对，难以施展" ZHI "。\n");

	if ((int)me->query_skill("sanwu-shou", 1) < 100)
		return notify_fail("你三无三不手不够娴熟，难以施展" ZHI "。\n");

        if (me->query_skill_mapped("whip") != "sanwu-shou")
                return notify_fail("你没有激发三无三不手，难以施展" ZHI "。\n");

	if (me->query("neili") < 140)
		return notify_fail("你现在的真气不够，难以施展" ZHI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "\n$N" HIM "长啸一声，腾空而起，施出绝招 「" HIW "无"
              "所不至" HIM "」手中" + weapon->name() + HIM "化出无数"
              "光点，犹如满天花雨般洒向$n全身各处" HIM "。" NOR;

        message_sort(msg, me, target);

	ap = me->query_skill("whip");
	dp = target->query_skill("dodge");
        attack_time = 4;

	if (ap / 2 + random(ap * 2) > dp)
	{
		msg = HIR "结果$n" HIR "被$N" HIR "攻了个措手不及，$n"
                      HIR "慌忙招架，心中叫苦。\n" NOR;
                count = ap / 8;
                attack_time += random(ap / 45);
                me->add_temp("apply/attack", count);
        } else
        {
                msg= HIC "$n" HIC "见$N" HIC "这几鞭招式凌厉，凶猛异"
                     "常，只得苦苦招架。\n" NOR;
                count = 0;
        }
	message_combatd(msg, me, target);

        if (attack_time > 7)
                attack_time = 7;

	me->add("neili", -attack_time * 20);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;

	        COMBAT_D->do_attack(me, target, weapon, 0);
	}
        me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(attack_time));

	return 1;
}
