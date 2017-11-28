// hui.c 蛤蟆功回息

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int a_amount);

int exert(object me, object target)
{
        int skill;
        string msg;

        if (! (skill = me->query_temp("hmg_dzjm")))
                return notify_fail("你并没有倒转经脉啊。\n");

        msg = HIB "$N" HIB "缓缓吐出一口气，脸色变了变，阴阳不定。\n" NOR;
        message_combatd(msg, me);

        me->add_temp("apply/dodge", -skill / 3);
        me->add_temp("apply/parry", -skill / 3);
        me->add_temp("apply/armor", -skill / 2);
        me->add_temp("apply/dispel_poison", -skill / 2);
        me->delete_temp("hmg_dzjm");

        me->set("neili", 0);
        return 1;
}
