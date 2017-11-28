#include <ansi.h>
#include <combat.h>

#define JUE "「" HIR "绝命一踢" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	string msg;
	int ap, dp, pp;
        int damage;

        if (userp(me) && ! me->query("can_perform/jueming-tui/jue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
        	me->clean_up_enemy();
        	target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUE "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JUE "只能空手施展。\n");

	if (me->query_skill("jueming-tui", 1) < 80)
                return notify_fail("你绝命腿法不够娴熟，难以施展" JUE "。\n");

        if (me->query_skill_mapped("unarmed") != "jueming-tui")
                return notify_fail("你没有激发绝命腿法，难以施展" JUE "。\n");
 
        if (me->query_skill_prepared("unarmed") != "jueming-tui")
                return notify_fail("你没有准备绝命腿法，难以施展" JUE "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你目前的内力不够，难以施展" JUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        switch (random(3))
        {
        case 0:
	        msg = HIR "只听$N" HIR "一声冷哼，侧身飞踢，右腿横"
                      "扫向$n" HIR "，当真是力不可挡。\n" NOR;
                break;

        case 1:
                msg = HIR "$N" HIR "蓦地大喝一声，单腿猛踢而出，直"
                      "踹$n" HIR "腰际，招式极为迅猛。\n" NOR;
                break;

        default:
                msg = HIR "突然只见$N" HIR "双腿连环踢出，挟着嚯嚯"
                      "风声，以千钧之势扫向$n" HIR "。\n" NOR;
                break;
        }
 
	ap = me->query_skill("unarmed") + me->query("str") * 10;
	dp = target->query_skill("dodge") + target->query("dex") * 10;
	pp = target->query_skill("parry") + target->query("str") * 10;

        if (ap * 7 / 10 + random(ap) < pp)
        {
                msg += HIC "可是$n" HIC "身子一晃，硬生生架住了$N"
                       HIC "这一腿。\n" NOR;
                me->start_busy(3);
                me->add("neili", -30);
        } else
        if (ap * 7 / 10 + random(ap) < dp)
        {
		msg += CYN "却见$n" CYN "镇定的向后一纵，闪开了$N"
                       CYN "这一腿。\n" NOR;
                me->start_busy(3);
                me->add("neili", -30);
        } else
	{
                damage = ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "$n" HIR "连忙格挡，却只觉得力道大"
                                           "得出奇，登时被一脚踢得飞起。\n" NOR);
                me->start_busy(2);
                me->add("neili", -100);
	}
	message_combatd(msg, me, target);
	return 1;
}
