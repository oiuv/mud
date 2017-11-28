#include <ansi.h>
#include <combat.h>

#define SUI "「" HIC "随字诀" NOR "」"

inherit F_SSERVER;

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int perform(object me)
{
	object weapon;
	int skill;
//	string msg;

        if (userp(me) && ! me->query("can_perform/taiji-jian/sui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if ((int)me->query_temp("tjj_sui"))
                return notify_fail("你现在正在施展" SUI "。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" SUI "。\n");

	if ((int)me->query_skill("taiji-jian", 1) < 60)
		return notify_fail("你的太极剑法不够娴熟，难以施展" SUI "。\n");

	if (me->query_skill_mapped("sword") != "taiji-jian") 
		return notify_fail("你没有激发太极剑法，，难以施展" SUI "。\n");

	if ((int)me->query("neili") < 300)
		return notify_fail("你现在的真气不足，难以施展" SUI "。\n");

	message_combatd(HIC "$N" HIC "使出太极剑法「" NOR + CYN "随"
                        HIC "」字诀，手中" + weapon->name() + HIC
                        "圆转不定，剑圈逐渐缩小将周身护住。\n" NOR, me);

	skill = me->query_skill("taiji-jian", 1);

	me->add_temp("apply/defense", skill / 3);
	me->add_temp("apply/attack", -skill / 6);
	me->set_temp("tjj_sui", 1);

	me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3 :), skill / 3);

	me->add("neili", -100);

	if (me->is_fighting())
                me->start_busy(3);

	return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("tjj_sui"))
        {
        	me->add_temp("apply/defense", -amount);
        	me->add_temp("apply/attack", amount / 2);
        	me->delete_temp("tjj_sui");
        	tell_object(me, "你的" SUI "运行完毕，将内力收回丹田。\n");
        }
}
