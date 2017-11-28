#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int perform(object me, object target)
{
        int skill;

        if ((int)me->query("neili") < 300)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("jingang-buhuaiti", 1) < 100)
                return notify_fail("你的金刚不坏护体神功修为不够。\n");

        if ((int)me->query_temp("jingangbuhuai"))
                return notify_fail("你已经运起金刚不坏护体神功了。\n");
                
        if ((int)me->query_temp("jinzhongzhao"))
                return notify_fail("你已经运起[金钟罩]作为护体神功了。\n");
                
        //不坏体与神魔金身效果不兼容
        if ((int)me->query_temp("special/jinshen"))
                return notify_fail("你已经运起神魔金身之术了。\n");

        skill = me->query_skill("force");
        me->add("neili", -200);
        me->receive_damage("qi", 0);

        message_combatd(HIY "只听$N" HIY "高呼佛号，全身肌肉紧缩，霎那间皮肤竟犹如镀金一般，发出灿灿金光。\n" NOR, me);

        me->add_temp("apply/armor", skill / 2);
        me->add_temp("apply/force", skill / 3);
        me->set_temp("jingangbuhuai", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill :), skill);

        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("jingangbuhuai"))
        {
                me->add_temp("apply/armor", -(amount / 2));
                me->add_temp("apply/force", -(amount / 3));
                me->delete_temp("jingangbuhuai");
                tell_object(me, "你的金刚不坏护体神功运行完毕，将内力收回丹田。\n");
        }
}
