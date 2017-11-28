#include <ansi.h>
#include <combat.h>

#define ZHEN "「" HIW "震字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill/*, ap, dp*/, damage;
	string msg;

        if (userp(me) && ! me->query("can_perform/taiji-quan/zhen"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHEN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHEN "只能空手施展。\n");

        skill = me->query_skill("taiji-quan", 1);

        if (skill < 150)
                return notify_fail("你的太极拳等级不够，难以施展" ZHEN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" ZHEN "。\n");
 
        if (me->query_skill_mapped("unarmed") != "taiji-quan")
                return notify_fail("你没有激发太极拳，难以施展" ZHEN "。\n");

        if (me->query_skill_prepared("unarmed") != "taiji-quan")
                return notify_fail("你现在没有准备使用太极拳，无法使用" ZHEN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "使出太极拳「震」字诀，左手高，右手低，陡然"
              "回圈，企图以内力震伤$n" HIW "。\n" NOR;
	me->add("neili", -50);

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		me->start_busy(3);
		target->start_busy(random(3));
		
		damage = (int)me->query_skill("force", 1);
                damage = damage / 2 + random(damage / 2);
		
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                           HIR "只见$N" HIR "这一拳变化无方，气劲"
                                           "封了$n" HIR "所有的退路，一拳正好命中"
                                           "。\n:内伤@?");
	} else 
	{
		me->start_busy(3);
		msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，并没有上当。\n" NOR;
	}
	message_combatd(msg, me, target);
	return 1;
}