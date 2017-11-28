// leidong 雷动九天
// by winder 98.12
// modify by rcwiz 2003

#include <ansi.h>

inherit F_CLEAN_UP;

#define LEI "「" HIM "雷动九天" NOR "」"

void remove_effect(object me, int amount);

int perform(object me)
{
	int skill, count/*, count1*/;


        if (userp(me) && ! me->query("can_perform/poyu-quan/lei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if ((int)me->query_temp("lei"))
		return notify_fail("你已经在运功中了。\n");

	if ((int)me->query("neili") < 500)
		return notify_fail("你现在的真气不够。\n");

	//skill = me->query_skill("cuff");
	skill = (int)me->query_skill("poyu-quan",1);

	if (skill < 120)
		return notify_fail("你的劈石破玉拳修为不够，无法施展" LEI "\n");

	me->add("neili", -400);
	message_combatd(HIM "$N" HIM "深深吸了一口气，脸上顿时"
                        "紫气大盛，出手越来越重！\n" NOR, me);

	//count = skill / 10;
	count = skill / 6;

        if (me->is_fighting())
                me->start_busy(2);

	me->add_temp("str", count);
	me->add_temp("dex", count);
	me->set_temp("lei", 1);
	me->start_call_out((: call_other,  __FILE__, "remove_effect", me, count :), skill / 3);

	return 1;
}

void remove_effect(object me, int amount)
{
	if ((int)me->query_temp("lei"))
	{
		me->add_temp("str", -amount);
		me->add_temp("dex", -amount);
		me->delete_temp("lei");
		tell_object(me, CYN "你的雷动九天运行完毕，将内力收回丹田。\n" NOR);
	}
}