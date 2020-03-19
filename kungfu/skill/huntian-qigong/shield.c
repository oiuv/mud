// shield.c 护体神功

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用混天气功来提升自己的防御力。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("huntian-qigong", 1) < 200)
                return notify_fail("你的混天气功修为不够。\n");

        if ((int)me->query_temp("shield"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("huntian-qigong", 1) +
				me->query_skill("checking", 1) +
				me->query_skill("begging", 1);
        me->add("neili", -100);
        me->receive_damage("qi", 0);

        message_combatd(HIW "$N" HIW "使出混天气功绝学「混元天罡」，一股白气"
                        "自顶心泥丸发散而下，全身弥漫在白色薄雾中！\n" NOR, me);
						

        me->add_temp("str", skill / 40);
		me->add_temp("dex", skill / 40);
        me->set_temp("shield", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill / 40 :), skill);

        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("shield"))
        {
                me->add_temp("str", -amount);
				me->add_temp("dex", -amount);
                me->delete_temp("shield");
                tell_object(me, "你的混天气功运行完毕，白色的薄雾渐渐散去。\n");
		}
}
