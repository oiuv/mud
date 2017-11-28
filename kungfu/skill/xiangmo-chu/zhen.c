#include <ansi.h>
#include <combat.h>

#define ZHEN "「" HIR "镇魂舞" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;
 
        if (userp(me) && ! me->query("can_perform/xiangmo-chu/zhen"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHEN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你所使用的武器不对，难以施展" ZHEN "。\n");

        if (me->query_skill_mapped("hammer") != "xiangmo-chu")
                return notify_fail("你没有激发金刚降魔杵，难以施展" ZHEN "。\n");

	if ((int)me->query_skill("xiangmo-chu", 1) < 100)
		return notify_fail("你金刚降魔杵火候不足，难以施展" ZHEN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不足，难以施展" ZHEN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" ZHEN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "一声断喝，施出「" HIR "镇魂舞" HIY "」绝技，宝相"
              "庄严，气度万千。手中" + weapon->name() + HIY "朝$n" HIY "连续"
              "砸下。\n" NOR;
	message_combatd(msg, me, target);

	me->add("neili", -150);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));
	return 1;
}
