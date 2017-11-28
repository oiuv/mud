// shield.c 护体神功
//

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
	int skill;

	if (target != me)
		return notify_fail("你只能用龙象般若功来提升自己的防御力。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的内力不够。\n");

	if ((int)me->query_skill("longxiang", 1) < 60)
		return notify_fail("你的龙象般若功修为不够。\n");

	if ((int)me->query_temp("shield"))
		return notify_fail("你已经在运功中了。\n");

	skill = me->query_skill("force");
	me->add("neili", -100);
	me->receive_damage("qi", 0);

	message_combatd(HIW "$N" HIW "大喝一声，眼中神光四射，"
                        "只见一股白雾蒸腾而起，笼罩了$N"
                        HIW "的全身！\n" NOR, me);

	me->add_temp("apply/armor", skill / 2);
	me->set_temp("shield", 1);

	me->start_call_out((: call_other, __FILE__,
                           "remove_effect", me, skill / 2:), skill);

	if (me->is_fighting()) me->start_busy(2);

	return 1;
}

void remove_effect(object me, int amount)
{
	me->add_temp("apply/armor", -amount);
	me->delete_temp("shield");
	tell_object(me, "你的龙象般若功运行完毕，将内力收回丹田。\n");
}
