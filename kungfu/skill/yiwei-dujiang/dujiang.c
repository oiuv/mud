#include <ansi.h>

inherit F_SSERVER;

void remove_effect(object me, int amount, int amount1);

inherit F_CLEAN_UP;

int perform(object me, object target)
{
        // object weapon;
        string msg;
        int count, skill;

        if ((int)me->query_temp("dujiang"))
                return notify_fail("你已经运起「一苇渡江」了。\n");

        if ((int)me->query_skill("yiwei-dujiang", 1)< 150)
                return notify_fail("你的一苇渡江等级不够，难以施展此项绝技！\n");

        if ((me->query_skill_mapped("force") != "hunyuan-yiqi") && (me->query_skill_mapped("force") != "yijinjing") && (me->query_skill_mapped("force") != "luohan-fumogong"))
                return notify_fail("你现在没有激发少林内功为内功，难以施展"  "。\n");
        if ((int)me->query_dex() < 30)
                return notify_fail("你的身法不够使用「一苇渡江」绝技！\n");

        if ((int)me->query_skill("force", 1)< 150)
                return notify_fail("你的内功火候不够，难以施展此项绝技！\n");

        if ((int)me->query_skill("dodge", 1)< 150)
                return notify_fail("你的轻功修为不够，不会使用此项绝技！\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不够使用「一苇渡江」！\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你此时的内力不足！\n");

        msg = HIB "$N" HIB "运起少林高深内功，施展「一苇渡江」绝技,"
                  "身形一展，整个人顿时凌空飘起，身体变得越来越轻。\n" NOR;

        message_combatd(msg, me, target);
        skill = me->query_skill("yiwei-dujiang", 1);

        count = skill / 50;

        if (me->is_fighting())
                me->start_busy(2);

        me->add_temp("dex", count);
        me->set_temp("dujiang", 1);
        me->start_call_out((: call_other,  __FILE__, "remove_effect", me, count :), skill / 2);

        me->add("neili", -200);
        return 1;
}

void remove_effect(object me, int amount, int amount1)
{
        if ((int)me->query_temp("dujiang"))
        {
                me->add_temp("dex", -amount);
                me->delete_temp("dujiang");
                tell_object(me, "你的「一苇渡江」运功完毕，将内力收回丹田。\n");
        }
}
