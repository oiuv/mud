#include <ansi.h>
#include <combat.h>

#define DING "「" HIY "定岳七方" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int i, ap, dp;

        if (userp(me) && ! me->query("can_perform/zhongping-qiang/ding"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(DING "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("你所使用的武器不对，难以施展" DING "。\n");

        if ((int)me->query_skill("zhongping-qiang", 1) < 120)
                return notify_fail("你中平枪法不够娴熟，难以施展" DING "。\n");

        if (me->query_skill_mapped("club") != "zhongping-qiang")
                return notify_fail("你没有激发中平枪法，难以施展" DING "。\n");

        if ((int)me->query_skill("force") < 180 )
                return notify_fail("你的内功火候不够，难以施展" DING "。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为不够，难以施展" DING "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" DING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "身形一转，施出中平枪法绝技「" HIR "定岳七方"
              HIY "」，手中" + weapon->name() + HIY "接连七刺，枪枪不离"
             "$n" HIY "要害！\n" NOR;

	ap = me->query_skill("club");
	dp = target->query_skill("parry");

	if (ap / 2 + random(ap * 2) > dp)
	{
		msg += HIR "$n" HIR "见$N" HIR "攻势凶猛异常，实非"
                       "寻常，不由心生寒意，招架登时散乱。\n" NOR;
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "攻势凶猛异常，实非"
                       "寻常，急忙打起精神，小心应付开来。\n" NOR;
        }
	message_combatd(msg, me, target);

	me->add("neili", -7 * 20);

	for (i = 0; i < 7; i++)
	{
		if (! me->is_fighting(target))
			break;
		COMBAT_D->do_attack(me, target, weapon, 0);
	}
	me->start_busy(1 + random(7));

	return 1;
}
