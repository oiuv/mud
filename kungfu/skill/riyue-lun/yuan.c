#include <ansi.h>
#include <combat.h>

#define YUAN "「" HIY "圆满势" NOR "」"

inherit F_SSERVER;

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int perform(object me)
{
	object weapon;
	string wp;
        int skill;

        if (userp(me) && ! me->query("can_perform/riyue-lun/yuan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if ((int)me->query_temp("yuan_man"))
                return notify_fail("你现在正在施展" YUAN "。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你所使用的武器不对，难以施展" YUAN "。\n");

        if (me->query_skill_mapped("hammer") != "riyue-lun")
                return notify_fail("你没有激发日月轮法，难以施展" YUAN "。\n");

        if (me->query_skill_mapped("force") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功，难以施展" YUAN "。\n");

        if ((int)me->query_skill("riyue-lun", 1) < 120)
                return notify_fail("你的日月轮法火候不足，难以施展" YUAN "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不足，难以施展" YUAN "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为不足，难以施展" YUAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" YUAN "。\n");

        wp = weapon->name();

        message_combatd(HIY "$N" HIY "吐气扬声，施出日月轮法「" HIW "圆满势"
                        HIY "」，手中" + wp + HIY "运转如飞，迅速护住周身要"
                        "害。\n" NOR, me);

        skill = me->query_skill("riyue-lun", 1);

        me->add("neili", -200);
        me->add_temp("apply/parry", skill / 3);
        me->set_temp("yuan_man", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3 :), skill / 2);

        if (me->is_fighting())
                me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if ((int)me->query_temp("yuan_man"))
        {
                me->add_temp("apply/parry", -amount);
                me->delete_temp("yuan_man");
                tell_object(me, "你的" YUAN "运行完毕，将内力收回丹田。\n");
        }
}
