// 唱仙法

#include <ansi.h>

int perform(object me)
{
	int skill;
	// string msg;

	if (! me->is_fighting())
		return notify_fail("唱仙法只能在战斗中使用。\n");

	if ((int)me->query_skill("shedao-qigong", 1) < 60)
		return notify_fail("你的蛇岛奇功不够娴熟，不会使用唱仙法。\n");

	if ((int)me->query("neili") < 300)
		return notify_fail("你已经唱得精疲力竭，内力不够了。\n");

	if ((int)me->query_temp("chang") >= 30)
		return notify_fail("你已经唱得太久了，不能再唱了。\n");

	skill = me->query_skill("force");

	me->add("neili", -200);

	message_combatd(HIR "只听$N" HIR "口中念念有词，顷刻"
                        "之间武功大进！\n" NOR, me);

	me->add_temp("apply/attack", 1);
	me->add_temp("apply/dodge", 1);
	me->add_temp("apply/defense", 1);
	me->add_temp("chang", 1);

	return 1;
}
