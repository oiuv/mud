#include <ansi.h>

#define TAO "「" HIC "三环套月" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
	string msg;

	if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/rouyun-jian/tao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
	        return notify_fail(TAO "只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");

	if (me->query_skill("rouyun-jian", 1) < 140)
		return notify_fail("你的柔云剑法修为不够，难以施展" TAO "。\n");

	if (me->query_skill("force") < 180)
		return notify_fail("你的内功修为不够，难以施展" TAO "。\n");

	if (me->query_skill("dodge") < 180)
		return notify_fail("你的轻功修为不够，难以施展" TAO "。\n");

	if (me->query("neili") < 200)
		return notify_fail("你的真气不够，难以施展" TAO "。\n");

        if (me->query_skill_mapped("sword") != "rouyun-jian")
                return notify_fail("你没有激发柔云剑法，难以施展" TAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "使出柔云剑法「三环套月」，一招之中另蕴三招，铺天"
              "盖地罩向$n" HIC "！\n" NOR;
        message_combatd(msg, me, target);
	me->add("neili", -150);

        me->add_temp("apply/attack", 40);
      	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 60);
	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 80);
	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", -180);
	me->start_busy(1 + random(3));
	return 1;
}
