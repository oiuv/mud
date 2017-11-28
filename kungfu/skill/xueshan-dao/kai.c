#include <ansi.h>
#include <combat.h>

#define KAI "「" HIW "冰河开封" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/xueshan-dao/kai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(KAI "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" KAI "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，难以施展" KAI "。\n");

        if ((int)me->query_skill("xueshan-dao", 1) < 80)
                return notify_fail("你的雪山刀法还不到家，难以施展" KAI "。\n");

        if (me->query_skill_mapped("blade") != "xueshan-dao")
                return notify_fail("你没有激发雪山刀法，难以施展" KAI "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的真气不够，难以施展" KAI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "只见$N" HIW "手中的" + weapon->name() +  HIW "豪光绽放，嗡"
              "嗡作响，刀锋顿时迸出一道寒芒向$n" HIW "砍落！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 2 + random(ap / 2);
                me->add("neili", -100);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 35,
                                           HIR "$n" HIR "招架不及，顿时被$N" HIR
                                           "凌厉的刀芒划中要害，鲜血狂溅而出！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "凝神聚气，护住门户，$P"
                       CYN "刀芒虽然凌厉，始终奈何不得。\n" NOR;
                me->add("neili", -50);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
