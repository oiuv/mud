// shield.c 小九阴护体神功
/*
yijin-duangu
dafumo-quan
cuixin-zhang
jiuyin-baiguzhao
shexing-lifan
yinlong-bian
*/

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
	int skill;
	int lvlf, lvlp, lvlc, lvlz, lvld, lvlb;

	lvlf = me->query_skill("yijin-duangu", 1);
	lvlp = me->query_skill("dafumo-quan", 1);
	lvlc = me->query_skill("cuixin-zhang", 1);
	lvlz = me->query_skill("jiuyin-baiguzhao", 1);
	lvld = me->query_skill("shexing-lifan", 1);
	lvlb = me->query_skill("yinlong-bian", 1);
	skill = (lvlf + lvlp + lvlc + lvlz + lvld + lvlb) / 6;
	
	if (target != me)
		return notify_fail("你只能用易筋锻骨来提升自己的防御力。\n");

	if ((int)me->query("neili") < 200)
		return notify_fail("你的内力不够。\n");

	if (lvlf < 200 || lvlp < 200 || lvlc < 200 || lvlz < 200 || lvld < 200 || lvlb < 200)
		return notify_fail("你的小九阴神功修为不够。\n");
	
	if (me->query_skill_prepared("claw") != "jiuyin-baiguzhao" ||
		me->query_skill_prepared("strike") != "cuixin-zhang" ||
		me->query_skill_mapped("whip") != "yinlong-bian" ||
		me->query_skill_mapped("unarmed") != "dafumo-quan" ||
		me->query_skill_mapped("dodge") != "shexing-lifan")
		return notify_fail("你还没有准备好小九阴神功，无法提升自己的防御力。\n");

	if ((int)me->query_temp("shield"))
		return notify_fail("你已经在运功中了。\n");

	me->add("neili", -100);
	me->receive_damage("qi", 0);

	message_combatd(HIW "$N" HIW "双手平举过顶，运起小九阴"
                        "真气，顿时全身笼罩在气劲之中！\n" NOR, me);

	me->add_temp("apply/armor", skill / 4);
	me->add_temp("apply/force", skill / 4);
	me->add_temp("apply/dodge", skill / 4);
	me->add_temp("apply/parry", skill / 4);
	me->add_temp("apply/strike", skill / 4);
	me->add_temp("apply/claw", skill / 4);
	me->add_temp("apply/whip", skill / 4);
	me->add_temp("apply/damage", skill / 12);
	me->add_temp("apply/unarmed_damage", skill / 12);
	me->set_temp("shield", 1);

	me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill / 4 :), skill);

	if (me->is_fighting()) me->start_busy(2);

	return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("shield"))
        {
        	me->add_temp("apply/armor", -amount);
			me->add_temp("apply/force", -amount);
			me->add_temp("apply/dodge", -amount);
			me->add_temp("apply/parry", -amount);
			me->add_temp("apply/strike", -amount);
			me->add_temp("apply/claw", -amount);
			me->add_temp("apply/whip", -amount);
			me->add_temp("apply/damage", -amount / 3);
			me->add_temp("apply/unarmed_damage", -amount / 3);
			me->delete_temp("shield");
        	tell_object(me, "你的小九阴真气运行完毕，将内力收回丹田。\n");
        }
}
