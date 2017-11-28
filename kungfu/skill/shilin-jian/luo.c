#include <ansi.h>
#include <combat.h>

#define LUO "「" HIW "落英纷飞" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int count;
	int i, attack_time;

        if (userp(me) && ! me->query("can_perform/shilin-jian/luo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(LUO "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LUO "。\n");

	if ((int)me->query_skill("shilin-jian", 1) < 120)
		return notify_fail("你石廪剑法不够娴熟，难以施展" LUO "。\n");

        if (me->query_skill_mapped("sword") != "shilin-jian")
                return notify_fail("你没有激发石廪剑法，难以施展" LUO "。\n");

	if (me->query("neili") < 140)
		return notify_fail("你现在的真气不够，难以施展" LUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "长啸一声，手中" + weapon->name() + HIY "化出"
              "无数剑光，剑势如虹，连连刺向$n" HIY "。\n" NOR;

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");
        attack_time = 4;

	if (ap / 2 + random(ap * 2) > dp)
	{
		msg += HIR "结果$n" HIR "被$N" HIR "攻了个措手不及，$n"
                       HIR "慌忙招架，心中叫苦。\n" NOR;
                count = ap / 8;
                attack_time += random(ap / 45);
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "这几剑招式凌厉，凶猛异"
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
