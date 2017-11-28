#include <ansi.h>

inherit F_SSERVER;

void remove_effect(object me, int amount, int amount1);

inherit F_CLEAN_UP;

int perform(object me, object target)
{
//      object weapon;  
        string msg;
        int count, cnt, skill;

        if ((int)me->query_temp("gui_yuan"))
                return notify_fail("你已经运起「九阴归元」了。\n");

        if ((int)me->query_skill("shexing-lifan", 1)< 150)
                return notify_fail("你的蛇行狸翻等级不够，难以施展此项绝技！\n");

        if ((int)me->query_dex() < 30)
                return notify_fail("你的身法不够使用「九阴归元」绝技！\n");

        if ((int)me->query_skill("force", 1)< 150)
                return notify_fail("你的内功火候不够，难以施展此项绝技！\n");

        if ((int)me->query_skill("dodge", 1)< 150)
                return notify_fail("你的轻功修为不够，不会使用此项绝技！\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不够使用「九阴归元」！\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你此时的内力不足！\n");

        msg = HIW "$N" HIW "运起九阴真气，双臂骨骼一阵爆响，身形一展，整"
                  "个人顿时凌空飘起，速度变得异常敏捷。\n" NOR;
        
        message_combatd(msg, me, target);
        skill = me->query_skill("shexing-lifan", 1);
        cnt =(int)( (int)me->query_condition("drunk") / 3);

        count = skill / 50;

        if (me->is_fighting())
                me->start_busy(2);

        me->add_temp("str", count);
        me->add_temp("dex", count);
        me->set_temp("gui_yuan", 1);
        me->start_call_out((: call_other,  __FILE__, "remove_effect", me, count :), skill / 2);

        me->add("neili", -200);
        return 1;
}

void remove_effect(object me, int amount, int amount1)
{
        if ((int)me->query_temp("gui_yuan"))
        {
                me->add_temp("str", -amount);
                me->add_temp("dex", -amount);
                me->delete_temp("gui_yuan");
                tell_object(me, "你的「九阴归元」运功完毕，将内力收回丹田。\n");
        }
}
