// MODIFY BY RCWIZ 2003

#include <ansi.h>
#include <combat.h>

#define FEI "「" HIG "虚无缥缈" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	// object weapon;
	string msg;
	int skill;

	skill = me->query_skill("shenxing-baibian", 1);


		if (skill < 60)
				return notify_fail("你的神行百变不够娴熟，不会使用" FEI  "。\n");

        if (me->query_skill_mapped("dodge") != "shenxing-baibian")
                return notify_fail("你没有使用神行百变，无法施展" FEI  "。\n");

		if (me->query_temp("shenxing"))
                return notify_fail("你已经运起「虚无缥缈」了。\n");

        if (me->query("neili") < 60)
                return notify_fail("你现在真气不够，无法施展" FEI  "。\n");

        msg = HIM "只见$N" HIM "将全身的内力旋转震动，身形东一溜，西一晃，"
              "忽又左右摇摆作势欲发，虚虚实实，飘渺不定。\n" NOR;

		message_sort(msg, me);


			me->add("neili", -100);
			me->add_temp("apply/dodge", skill);
			me->set_temp("shenxing", 1);
			me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill :), skill / 10);

	return 1;
}

void remove_effect(object me, int amount)
{
        if ((int)me->query_temp("shenxing"))
        {
                me->add_temp("apply/dodge", -amount);
                me->delete_temp("shenxing");
                tell_object(me, "你的「虚无缥缈」运功完毕，将内力收回丹田。\n");
        }
}
