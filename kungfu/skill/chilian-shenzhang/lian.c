#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIM "赤心连环决" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int attack_time, i;

        if (! me->query("can_perform/chiilian-shenzhang/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(LIAN "只能空手施展。\n");

        if ((int)me->query_skill("chilian-shenzhang", 1) < 100)
                return notify_fail("你赤练神掌不够娴熟，难以施展" LIAN "。\n");

        if (me->query_skill_prepared("strike") != "chilian-shenzhang")
                return notify_fail("你没有准备赤练神掌，难以施展" LIAN "。\n");

        if (me->query_skill("force") < 100)
                return notify_fail("你的内功修为不够，难以施展" LIAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIC "$N" HIC "暗运内功，但见$N" HIC "双掌微微呈显"
              "赤色，陡然连续反转，使出一招「" HIM "赤心连环决" HIC
              "」，掌风凌厉，将$n" HIC "笼罩在双掌之中。\n" NOR;

        message_sort(msg, me, target);

	if (random(ap) > dp / 2)
	{
		msg = HIR "$n" HIR "心中一惊，却被$N" HIR "掌"
                      "风所困，顿时阵脚大乱。\n" NOR;
                me->add_temp("apply/attack", 70);
        } else
        {
                msg = HIY "$n" HIY "看清$N" HIY "这几招的来路，但"
                      "内劲所至，掌风犀利，也只得小心抵挡。\n" NOR;          
        }
	message_vision(msg, me, target);

        attack_time += 4 + random(ap / 40);

        if (attack_time > 8)
                attack_time = 8;

	me->add("neili", -attack_time * 20);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;
                COMBAT_D->do_attack(me, target, 0, 0);
	}
        me->add_temp("apply/attack", -70);
	me->start_busy(1 + random(attack_time));

	return 1;
}
