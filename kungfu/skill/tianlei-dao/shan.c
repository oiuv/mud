#include <ansi.h>
#include <combat.h>

#define SHAN "「" HIW "五雷连闪" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg, wn;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/tianlei-dao/shan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对，难以施展" SHAN "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("tianlei-dao", 1) < 150)
                return notify_fail("你天雷绝刀不够娴熟，难以施展" SHAN "。\n");

        if (me->query_skill_mapped("blade") != "tianlei-dao")
                return notify_fail("你没有激发天雷绝刀，难以施展" SHAN "。\n");

        if (me->query_skill("dodge") < 180)
                return notify_fail("你的轻功修为不够，难以施展" SHAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" SHAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

 
        wn = weapon->name();

	msg = HIY "\n$N" HIY "将手中" + wn + HIY "立于胸前，施出绝招「" HIW "五"
              "雷连闪" HIY "」，$N身法陡然加快，手中" + wn + HIY "连续砍出五刀，"
              "刀法之精妙，令人匪夷所思。\n" NOR;

        message_sort(msg, me, target);

        attack_time = 5;

	ap = me->query_skill("blade");
	dp = target->query_skill("dodge");

	me->add("neili", -180);

	if (ap / 2 + random(ap) > dp)
	{
		msg = HIG "$n" HIG "见$P" HIG "这招来势汹涌，势不可"
                     "挡，被$N" HIG "攻得连连后退。\n" NOR;
        } else
        {
                msg = HIC "$n" HIC "见$N" HIC "这几刀来势迅猛无比，毫"
                      "无破绽，只得小心应付。\n" NOR;
        }

        message_combatd(msg, me, target);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, weapon, 15);
        }

	me->start_busy(1 + random(attack_time));

        return 1;
}
