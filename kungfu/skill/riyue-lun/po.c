#include <ansi.h>
#include <combat.h>

#define PO "「" HIR "破立势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg, wp;
        int ap, dp, damage;

        if (userp(me) && ! me->query("can_perform/riyue-lun/po"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target ) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(PO "只能对战斗中的对手使用。\n");

        if ((int)me->query_temp("yuan_man"))
                return notify_fail("你现在无暇施展" PO "。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你所使用的武器不对，难以施展" PO "。\n");

        if (me->query_skill_mapped("hammer") != "riyue-lun")
                return notify_fail("你没有激发日月轮法，难以施展" PO "。\n");

        if (me->query_skill_mapped("force") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功，难以施展" PO "。\n");

        if ((int)me->query_skill("riyue-lun", 1) < 120)
                return notify_fail("你的日月轮法火候不足，难以施展" PO "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不足，难以施展" PO "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为不足，难以施展" PO "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" PO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wp = weapon->name();

	msg = HIY "$N" HIY "单手高举" + wp + HIY "奋力朝$n" HIY "砸下，气"
              "浪迭起，全然把$n" HIY "卷在其中！\n" NOR;

	ap = me->query_skill("force") + me->query("str") * 10;
	dp = target->query_skill("force") + target->query("con") * 10;

	if (ap / 2 + random(ap) > dp)
	{
		me->add("neili", -300);
		damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "被$N" HIR "这强悍无比的"
                                           "内劲冲击得左摇右晃，接连中招，狂喷鲜"
                                           "血。\n" NOR);
		me->start_busy(3);

	} else
	{
		msg += CYN "却见$p" CYN "浑不在意，轻轻一闪就躲过了$P"
		       CYN "的凶悍招数。\n"NOR;
		me->add("neili", -150);
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
