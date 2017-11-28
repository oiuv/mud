#include <ansi.h>
#include <combat.h>

#define DIAN "「" HIM "内点乾坤" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/hexing-bifa/dian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(DIAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所使用的武器不对，难以施展" DIAN "。\n");

	if ((int)me->query_skill("hexing-bifa", 1) < 100)
		return notify_fail("你的鹤形笔法不够娴熟，难以施展" DIAN "。\n");

        if (me->query_skill_mapped("dagger") != "hexing-bifa")
                return notify_fail("你没有激发鹤形笔法，难以施展" DIAN "。\n");

	if (me->query("neili") < 300)
		return notify_fail("你目前的真气不够，难以施展" DIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "\n$N" HIW "身法陡快，手中" + weapon->name() + HIW "一扬，"
              "施出绝招「" HIM "内点乾坤" HIW "」，猛然间，" + weapon->name() + HIW
              "连连点向$n" HIW "周身要穴。" NOR;

        message_sort(msg, me, target);

        attack_time = 4;
	//2015年4月15日 修正连击条件
	ap = me->query_skill("dagger");
	dp = target->query_skill("dodge");
	if (ap / 2 + random(ap) > dp)
		attack_time += random(ap / 40);

	if (attack_time > 8)
		attack_time = 8;

	me->add("neili", -attack_time * 30);


        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (! target->is_busy() && random(3) == 1)
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(attack_time));

        return 1;
}
