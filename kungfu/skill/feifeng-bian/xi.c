#include <ansi.h>
#include <combat.h>

#define XI "「" HIW "凤栖于梧" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int i;

        if (userp(me) && ! me->query("can_perform/feifeng-bian/xi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(XI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" XI "。\n");

	if ((int)me->query_skill("feifeng-bian", 1) < 120)
		return notify_fail("你的飞凤鞭法法不够娴熟，难以施展" XI "。\n");

        if (me->query_skill_mapped("whip") != "feifeng-bian")
                return notify_fail("你现在没有激发飞凤鞭法，难以施展" XI "。\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功修为不够，难以施展" XI "。\n");

	if ((int)me->query("neili") < 300)
		return notify_fail("你现在的真气不够，难以施展" XI "。\n");
	
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "力贯鞭梢，手中" + weapon->name() + HIW "急舞，画"
              "出一个又一个的圈子缠向$n" HIW "！\n" NOR;
        message_combatd(msg, me, target);

        me->add("neili", -100);

        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(5) == 0 && ! target->is_busy())
                        target->start_busy(1);
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(6));
        return 1;
}
