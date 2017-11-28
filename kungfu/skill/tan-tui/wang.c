#include <ansi.h>
#include <combat.h>

#define WANG "「" HIY "犀牛望月转回还" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/tan-tui/wang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
                return notify_fail(WANG "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(WANG "只能空手施展。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" WANG "。\n");

        if ((int)me->query_skill("tan-tui", 1) < 120)
                return notify_fail("你的十二路潭腿不够娴熟，难以施展" WANG "。\n");

        if (me->query_skill_mapped("unarmed") != "tan-tui")
                return notify_fail("你没有激发十二路潭腿，难以施展" WANG "。\n");

        if (me->query_skill_prepared("unarmed") != "tan-tui")
                return notify_fail("你没有准备十二路潭腿，难以施展" WANG "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" WANG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "只见$N" HIY "拔地跃起，凌空一个翻滚，陡然间双腿便如"
              "流星般向$n" HIY "连续踢至。\n" NOR;

	me->add("neili", -50);
        ap = me->query_skill("unarmed");
        dp = target->query_skill("force");
        if (ap / 2 + random(ap) > dp)
	{
		damage = me->query_skill("unarmed") / 2;
                damage += random(damage / 3);
		me->add("neili", -100);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 35,
                                           HIR "却听$n" HIR "一声惨嚎，已被$P" HIR
                                           "单腿正中前胸，顿时心脉受震，喷出一大"
                                           "口鲜血。\n" NOR);
		me->start_busy(3);
	} else
	{
		msg += CYN "可是$p" CYN "奋力招架，终于将$P"
                       CYN "的双腿架开，没有受到任何伤害。\n"NOR;
		me->start_busy(4);
	}
	message_combatd(msg, me, target);

	return 1;
}
