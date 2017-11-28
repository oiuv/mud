#include <ansi.h>
#include <combat.h>

#define XUE "「" HIW "缤纷雪舞" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/ningxue-zhang/xue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(XUE "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你所使用的武器不对，难以施展" XUE "。\n");

	if ((int)me->query_skill("ningxue-zhang", 1) < 50)
		return notify_fail("你的凝雪杖法不够娴熟，难以施展" XUE "。\n");

        if (me->query_skill_mapped("staff") != "ningxue-zhang")
                return notify_fail("你没有激发凝雪杖法，难以施展" XUE "。\n");

	if (me->query("neili") < 200)
		return notify_fail("你目前的真气不够，难以施展" XUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "\n$N" HIC "蓦的一声清啸，施出绝学「" HIM "缤纷雪舞"
              HIC "」，手中" + weapon->name() + HIC "呼呼作响。霎时间"
              "连连攻向$n" HIC "。" NOR;

        message_sort(msg, me, target);

        attack_time = 4;

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");

        attack_time += random(ap / 40);

        if (attack_time > 6)
                attack_time = 6;

	me->add("neili", -attack_time * 20);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(attack_time));

        return 1;
}
