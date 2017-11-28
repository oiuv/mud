#include <ansi.h>
#include <combat.h>

#define CAN "「" HIR "天残剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int i;

        if (userp(me) && ! me->query("can_perform/quemen-jian/can"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(CAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CAN "。\n");

        if ((int)me->query_skill("force") < 120 )
                return notify_fail("你的内功火候不够，难以施展" CAN "。\n");

        if ((int)me->query_skill("quemen-jian", 1) < 80)
                return notify_fail("你缺门剑法不够娴熟，难以施展" CAN "。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不够，难以施展" CAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不够，难以施展" CAN "。\n");

        if (me->query_skill_mapped("sword") != "quemen-jian")
                return notify_fail("你没有激发缺门剑法，难以施展" CAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "施出缺门剑法天残剑诀，手中" + weapon->name() +
              HIR "唰唰唰唰连续四剑，笼罩$n" HIR "周身！\n" NOR;
        message_combatd(msg, me, target);

        me->add("neili", -80);

        for (i = 0; i < 4; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->start_busy(1 + random(4));
        return 1;
}
