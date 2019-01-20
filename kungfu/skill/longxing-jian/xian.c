// 神龙再现

#include <ansi.h>

int perform(object me)
{
        int skill;
        // string msg;

        if (! me->is_fighting())
                return notify_fail("神龙再现只能在战斗中使用。\n");

        if ((int)me->query_skill("longxing-jian", 1) < 150)
                return notify_fail("你的龙形剑法不够娴熟，不会使用神龙再现。\n");

        if ((int)me->query_skill("buddhism", 1) < 150)
                return notify_fail("你的佛法修为不够娴熟，不会使用神龙再现。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你已经精疲力竭，内力不够了。\n");

        if ((int)me->query_temp("xian") >= 50)
                return notify_fail("你已经念佛念得太久了，神龙已经厌倦了。\n");

        skill = me->query_skill("force");

        me->add("neili", -100);
        me->start_busy(1);
        message_combatd(HIR "只听$N" HIR "口中念念有词，神龙从天而将，"
                        "钻入$N体中！\n" NOR, me);

        me->add_temp("apply/attack", 2);
        me->add_temp("apply/dodge", 1);
        me->add_temp("apply/parry", 1);
        me->add_temp("xian", 1);

        return 1;
}
