#include <ansi.h>
#include <combat.h>

#define XUAN "「" HIW "玄功无极劲" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill/*, ap, dp*/, damage;
	string msg;

        if (userp(me) && ! me->query("can_perform/xuangong-quan/xuan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(XUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(XUAN "只能空手施展。\n");

        skill = me->query_skill("xuangong-quan", 1);

        if (skill < 120)
                return notify_fail("你的无极玄功拳等级不够，难以施展" XUAN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" XUAN "。\n");
 
        if (me->query_skill_mapped("unarmed") != "xuangong-quan")
                return notify_fail("你没有激发无极玄功拳，难以施展" XUAN "。\n");

        if (me->query_skill_prepared("unarmed") != "xuangong-quan")
                return notify_fail("你现在没有准备使用无极玄功拳，无法使用" XUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "只见$N" HIW "双手回圈，慢慢的引动气流，正当$n"
              HIW "吃惊间，$P" HIW "双拳已陡然破空贯出。\n" NOR;
	me->add("neili", -100);

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		me->start_busy(3);
		target->start_busy(random(3));
		
		damage = (int)me->query_skill("xuangong-quan", 1);
                damage = damage + random(damage);
		
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "$n" HIR "急忙抽身躲避，可已然不及，被$N"
                                           HIR "双拳捶个正中。\n:内伤@?");
	} else 
	{
		me->start_busy(3);
		msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，并没有上当。\n" NOR;
	}
	message_combatd(msg, me, target);
	return 1;
}