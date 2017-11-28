#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIM "快剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/xiaoyao-jian/kuai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LIAN "。\n");

	if ((int)me->query_skill("xiaoyao-jian", 1) < 120)
		return notify_fail("你的逍遥剑法不够娴熟，难以施展" LIAN "。\n");

        if (me->query_skill_mapped("sword") != "xiaoyao-jian")
                return notify_fail("你没有激发逍遥剑法，难以施展" LIAN "。\n");

	if (me->query("neili") < 300)
		return notify_fail("你目前的真气不够，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "\n$N" HIW "蓦的一声清啸，施出绝学「" HIM "快剑诀"
              HIW "」，手中" + weapon->name() + HIW "呼呼作响。霎时间"
              "奇妙的剑招连绵涌出。\n" NOR;

        attack_time = 4;

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");

        attack_time += random(ap / 40);

        if (attack_time > 9)
                attack_time = 9;

	me->add("neili", -attack_time * 30);
        me->add_temp("apply/attack", 20);

        message_combatd(msg, me, target);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (! target->is_busy() && random(3) == 1)
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(attack_time));
        me->add_temp("apply/attack", -20);

        return 1;
}
