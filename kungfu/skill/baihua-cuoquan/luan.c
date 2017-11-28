#include <ansi.h>
#include <combat.h>

#define LUAN "「" HIW "百花错乱" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill, ap, dp, damage;
	string msg;

        if (userp(me) && ! me->query("can_perform/baihua-cuoquan/luan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUAN "只能对战斗中的对手使用。\n");

        skill = me->query_skill("baihua-cuoquan", 1);

        if (skill < 120)
                return notify_fail("你的百花错拳等级不够，难以施展" LUAN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" LUAN "。\n");
 
        if (me->query_skill_mapped("unarmed") != "baihua-cuoquan")
                return notify_fail("你没有激发百花错拳，难以施展" LUAN "。\n");

        if (me->query_skill_prepared("unarmed") != "baihua-cuoquan")
                return notify_fail("你现在没有准备使用百花错拳，无法使用" LUAN "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "顿步沉身，双掌朝$n" HIW "交错打出，掌锋拳影重"
              "重叠叠，正是一招「百花错乱」。\n" NOR;
	me->add("neili", -50);

        ap = me->query_skill("unarmed");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap * 4 / 3) > dp)
        {
                me->add("neili", -150);
                damage = ap / 8 + random(ap / 8);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 0,
                                           HIR "$n" HIR "只觉$N" HIR "拳影重重，"
                                           "顿时眼花缭乱，连中数拳，被攻了个措手"
                                           "不及。\n" NOR);
                me->start_busy(1);
                if (ap / 2 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 30 + 2);
        } else
        {
                msg += CYN "$n" CYN "只见$N" CYN "拳势汹涌，不敢轻视，急忙凝神聚"
                       "气，奋力化解开来。\n" NOR;
                me->add("neili", -80);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);

        return 1;
}

