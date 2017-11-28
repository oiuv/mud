#include <ansi.h>

#define HUA "「" MAG "化蝶" NOR "」"

inherit F_SSERVER;

inherit F_CLEAN_UP;

void remove_effect(object me, int amount, int amount1);

int perform(object me, object target)
{
//      object weapon;  
        string msg;
        int count, cnt, skill;

        if (userp(me) && ! me->query("can_perform/zhuangzi-wu/hua"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if ((int)me->query_temp("hua_die"))
                return notify_fail("你已经运起" HUA "了。\n");

        if ((int)me->query_skill("zhuangzi-wu", 1) < 150)
                return notify_fail("你的庄子舞等级不够，难以施展" HUA "。\n");

        if ((int)me->query_dex() < 32)
                return notify_fail("你的身法不够，难以施展" HUA "。\n");

        if ((int)me->query_skill("force", 1) < 150)
                return notify_fail("你的内功火候不够，难以施展" HUA "。\n");

        if ((int)me->query_skill("dodge", 1) < 150)
                return notify_fail("你的轻功修为不够，难以施展" HUA "。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不够，难以施展" HUA "。\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你此时的内力不足，难以施展" HUA "。\n");

        msg = MAG "$N" MAG "一声清啸，身形一展，舞步宛如行云流水、彩碟飞"
              "扬，速度变得异常敏捷。\n\n" NOR;
        
        message_combatd(msg, me, target);
        skill = me->query_skill("zhuangzi-wu", 1);
        cnt = (int)((int)me->query_condition("drunk") / 3);

        count = skill / 50;

        if (me->is_fighting())
                me->start_busy(2);

        me->add_temp("dex", count);
        me->set_temp("hua_die", 1);
        me->start_call_out((: call_other,  __FILE__, "remove_effect", me, count :), skill / 2);

        me->add("neili", -200);
        return 1;
}

void remove_effect(object me, int amount, int amount1)
{
        if ((int)me->query_temp("hua_die"))
        {
                me->add_temp("dex", -amount);
                me->delete_temp("hua_die");
                tell_object(me, "你的" HUA "运行完毕，将内力收回丹田。\n");
        }
}