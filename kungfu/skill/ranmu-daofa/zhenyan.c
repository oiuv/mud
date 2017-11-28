#include <ansi.h>
#include <combat.h>

#define TUN "「" HIR "燃木真焰" NOR "」"

inherit F_SSERVER;

void remove_effect(object me, int skill);

int perform(object me, object target)
{
        object weapon;
        int skill;
        string msg;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail(TUN "你必须用刀法施展。\n");

        if (me->query_temp("zhen_yan"))
                return notify_fail(TUN "无法连续施展。\n");

        if ((int)me->query_skill("ranmu-daofa", 1) < 180)
                return notify_fail("你的燃木刀法修为不够，难以施展" TUN "。\n");

        if (me->query("max_neili") < 2500)
                return notify_fail("你的内力修为不足，难以施展" TUN "。\n");

        if ((me->query_skill_mapped("force") != "hunyuan-yiqi") && (me->query_skill_mapped("force") != "yijinjing") && (me->query_skill_mapped("force") != "luohan-fumogong"))
                return notify_fail("你现在没有激发少林内功为内功，难以施展" TUN "。\n");
        if (me->query_skill_mapped("blade") != "ranmu-daofa")
                return notify_fail("你没有激发燃木刀法为刀法，难以施展" TUN "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" TUN "。\n");


        msg = HIY "$N" HIY "双手持刀，对天咆哮，所施正是燃木刀法绝学「"
              HIR "燃木真焰" HIY "」。霎时呼啸声大作，但见一股澎湃无比的罡劲"

              "自$N" HIY "刀尖涌出，云贯向$N" HIY "而去。\n" NOR;
        message_sort(msg, me);
        if (me->is_fighting())
                me->start_busy(2);
        skill = me->query_skill("ranmu-daofa",1);
        me->set_temp("zhen_yan", 1);       
        me->add_temp("apply/attack", skill * 2 / 5);
        me->add_temp("apply/defense", skill * 2 / 5);
        me->add_temp("apply/damage", skill / 4);
        me->add("neili", -400);
        me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill :), skill);
        return 1;
}

void remove_effect(object me, int skill)
{
        if (me->query_temp("zhen_yan"))
        {
                me->add_temp("apply/attack", -(skill * 2 / 5));
                me->add_temp("apply/defense", -(skill * 2 / 5));
                me->add_temp("apply/weapon_damage", -(skill / 4));
                me->delete_temp("zhen_yan");

                tell_object(me, "你经过调气养息，又可以继续施展「" HIR "燃木真焰" NOR "」了。\n");
        }
}

