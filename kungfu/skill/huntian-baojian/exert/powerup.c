#include <ansi.h>

inherit F_CLEAN_UP;

string *force_name = ({ NOR + HIB "靛沧海", HIY "金晨曦",
                        HIR "血穹苍", NOR + CYN "玄宇宙", }); 

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;
        string name;
        name = force_name[random(sizeof(force_name))];

        if (target != me)
                return notify_fail("你只能用浑天宝鉴来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        me->add("neili", -100);
        me->receive_damage("qi", 0);

        message_combatd(HIW "$N" HIW "微一凝神，运起浑天宝鉴之「" + name +
                        HIW "」心法，一股气流顿将你震退数步。\n" NOR, me);

        me->add_temp("apply/attack", skill / 2);
        me->add_temp("apply/defense", skill / 2);
        me->set_temp("powerup", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 2 :), skill);

        if (me->is_fighting())
                me->start_busy(3);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/defense", -amount);
                me->delete_temp("powerup");
                tell_object(me, "你的浑天宝鉴运行完毕，将内力收回丹田。\n");
        }
}
