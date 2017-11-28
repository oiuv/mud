#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIW "天刀落云式" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg, wn;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/luoyun-dao/tian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你所使用的武器不对，难以施展" LIAN "。\n");

	if ((int)me->query_skill("luoyun-dao", 1) < 100)
		return notify_fail("你的落云刀法不够娴熟，难以施展" LIAN "。\n");

        if (me->query_skill_mapped("blade") != "luoyun-dao")
                return notify_fail("你没有激发落云刀法，难以施展" LIAN "。\n");

	if (me->query("neili") < 300)
		return notify_fail("你目前的真气不够，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

	msg = HIY "\n$N" HIY "将手中" + wn + HIY "立于胸前，施出绝招「" HIW "天"
              "刀落云式" HIY "」，$N身法陡然加快，手中" + wn + HIY "连连挥出，犹"
              "如万马奔腾般袭向$n" HIY "。" NOR;

        message_sort(msg, me, target);

        attack_time = 4;

	ap = me->query_skill("blade");
	dp = target->query_skill("dodge");

        attack_time += random(ap / 40);

        if (attack_time > 8)
                attack_time = 8;

	me->add("neili", -attack_time * 20);

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

                COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(attack_time));

        return 1;
}
