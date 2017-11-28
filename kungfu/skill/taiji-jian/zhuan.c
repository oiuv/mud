#include <ansi.h>
#include <combat.h>

#define ZHUAN "「" HIW "剑轮岚转" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int count;
	int i, attack_time;

        if (userp(me) && ! me->query("can_perform/taiji-jian/zhuan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" ZHUAN "。\n");

	if ((int)me->query_skill("taiji-jian", 1) < 160)
		return notify_fail("你的太极剑法不够娴熟，难以施展" ZHUAN "。\n");

	if (me->query("neili") < 250)
		return notify_fail("你的真气不够，难以施展" ZHUAN "。\n");

        if (me->query_skill_mapped("sword") != "taiji-jian")
                return notify_fail("你没有激发太极剑法，难以施展" ZHUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "一声清啸，手中" + weapon->name() +
              HIW "龙吟不定，化出一个个圆圈，把$n" HIW "圈在当"
              "中。\n" NOR;

	ap = me->query_skill("sword");
	dp = target->query_skill("parry");
        attack_time = 5;
	if (ap / 2 + random(ap * 2) > dp)
	{
		msg += HIY "结果$p" HIY "被$P" HIY
                       "攻了个措手不及，连连后退不暇！\n" NOR;
                count = ap / 10;
                me->add_temp("apply/attack", count);
                attack_time += random(ap / 45);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "这几剑并无破绽"
                       "，不敢大意，小心应付。\n" NOR;
                count = 0;
        }
                
	message_combatd(msg, me, target);

        if (attack_time > 10)
                attack_time = 10;

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
