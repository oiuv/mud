#include <ansi.h>
#include <combat.h>

#define FEI "「" HIG "连绵不绝" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int attack_time, i;

        if (userp(me) && ! me->query("can_perform/hanbing-mianzhang/jue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FEI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(FEI "只能空手施展。\n");

        if ((int)me->query_skill("hanbing-mianzhang", 1) < 100)
                return notify_fail("你寒冰绵掌不够娴熟，难以施展" FEI "。\n");

        if (me->query_skill_mapped("strike") != "hanbing-mianzhang")
                return notify_fail("你没有激发寒冰绵掌，难以施展" FEI "。\n");

        if (me->query_skill_prepared("strike") != "hanbing-mianzhang")
                return notify_fail("你没有准备寒冰绵掌，难以施展" FEI "。\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你现在的真气不够，难以施展" FEI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIC "\n$N" HIC "双掌陡然连续拍出，掌风阴寒无比，一招"
              "「" HIG "连绵不绝" HIC "」，已连连罩向$n" HIC "。\n" NOR;
        message_sort(msg, me, target);

        attack_time += 3 + random(ap / 40);

        if (attack_time > 7)
                attack_time = 7;

	me->add("neili", -attack_time * 30);
        me->add_temp("apply/attack", 10);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;
                if (! target->is_busy() && random(3) == 1) 
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
	}
	me->start_busy(1 + random(attack_time));
        me->add_temp("apply/attack", -10);

	return 1;
}
