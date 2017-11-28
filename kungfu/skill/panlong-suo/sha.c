#include <ansi.h>

#define SHA "「" HIR "绝命七杀" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int count;
        int i;

        if (userp(me) && ! me->query("can_perform/panlong-suo/sha"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(SHA "只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" SHA "。\n");

	if ((int)me->query_skill("force") < 220)
		return notify_fail("你的内功火候不够，难以施展" SHA "。\n");

	if ((int)me->query_skill("panlong-suo", 1) < 180)
		return notify_fail("你的霹雳盘龙索还不到家，难以施展" SHA "。\n");

        if (me->query_skill_mapped("whip") != "panlong-suo")
                return notify_fail("你没有激发霹雳盘龙索，难以施展" SHA "。\n");

	if ((int)me->query("neili") < 300)
		return notify_fail("你的真气不够，难以施展" SHA "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "突然间$N" HIR "猛的猱身扑上，手中" + weapon->name() +
              HIR "急转，便似不要命般地向$n" HIR "猛攻过去。\n" NOR;

        if (random(me->query_skill("whip")) > target->query_skill("parry") / 2)
        {
                msg += HIR "$n" HIR "卒不及防，登时手忙脚乱，招架疏"
                       "散，慌忙中难以抵挡。\n" NOR;
                count = me->query_skill("whip") / 20;
        } else
        {
                msg += HIC "$n" HIC "心底一惊，连忙全神应对，不敢有"
                       "丝毫大意。\n" NOR;
                count = 0;
        }

	message_combatd(msg, me, target);
	me->add("neili", -180);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(6));
	return 1;
}
