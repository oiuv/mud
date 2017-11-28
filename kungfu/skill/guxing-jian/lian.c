#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIM "九星连珠" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/guxing-jian/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LIAN "。\n");

	if ((int)me->query_skill("guxing-jian", 1) < 100)
		return notify_fail("你的孤星剑法不够娴熟，难以施展" LIAN "。\n");

        if (me->query_skill_mapped("sword") != "guxing-jian")
                return notify_fail("你没有激发孤星剑法，难以施展" LIAN "。\n");

	if (me->query("neili") < 300)
		return notify_fail("你目前的真气不够，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "\n$N" HIW "蓦的一声清啸，施出绝学「" HIM "九星连珠"
              HIW "」，手中" + weapon->name() + HIW "呼呼作响。霎时间"
              "孤星剑法剑招连绵涌出，此起彼伏，剑气笼罩$n" HIW "全身。" NOR;

        message_sort(msg, me, target);

        attack_time = 4;

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");

        attack_time += random(ap / 40);

        if (attack_time > 8)
                attack_time = 8;

	me->add("neili", -attack_time * 20);

	if (ap / 2 + random(ap) > dp)
	{
		msg = HIY "$n" HIY "见$P" HIY "剑势汹涌，寒意顿生，竟"
                      "被逼得连连后退，狼狈不已。\n" NOR;
        } else
        {
                msg = HIC "$n" HIC "见$N" HIC "这几剑来势迅猛无比，毫"
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
