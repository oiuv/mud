#include <ansi.h>
#include <combat.h>

#define TUN "「" HIR "龙吞势" NOR "」"

inherit F_SSERVER;

inherit F_CLEAN_UP;

void remove_effect(object me);

int perform(object me, object target)
{
//      object weapon;
        int ap, dp, foc, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/longxiang-gong/tun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TUN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(TUN "只能空手施展。\n");

        if (me->query_temp("long_tun"))
                return notify_fail(TUN "无法连续施展。\n");

        if ((int)me->query_skill("longxiang-gong", 1) < 180)
                return notify_fail("你的龙象般若功修为不够，难以施展" TUN "。\n");

        if (me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，难以施展" TUN "。\n");

        if (me->query_skill_mapped("unarmed") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功为拳脚，难以施展" TUN "。\n");

        if (me->query_skill_mapped("force") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功为内功，难以施展" TUN "。\n");

        if (me->query_skill_prepared("unarmed") != "longxiang-gong")
                return notify_fail("你没有准备使用龙象般若功，难以施展" TUN "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" TUN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "双臂左右分张，形若龙嘴，所施正是龙象般若功绝学「"
              HIR "龙吞势" HIY "」。霎时呼\n啸声大作，但见一股澎湃无比的罡劲"
              "至$N" HIY "双掌间涌出，云贯向$n" HIY "而去。\n" NOR;

        me->set_temp("long_tun", 1);
        me->start_call_out((: call_other, __FILE__, "remove_effect", me :), 50);

        ap = me->query_skill("unarmed") +
             me->query_skill("force");

        dp = target->query_skill("parry") +
             target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                foc = target->query_skill("force");
                damage = ap / 2 + random(ap) + random(foc);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80,
                                               HIR "$n" HIR "一声哀嚎，被$N" HIR "的罡"
                                               "气划中气门，真气在体内四处乱窜，惨不堪"
                                               "言。\n" NOR);

                me->start_busy(3);
                me->add("neili", -300);
        } else
        {
                me->start_busy(4);
                me->add("neili", -200);
                msg += CYN "可是$n" CYN "见$N" CYN "此招来势非凡，急"
                       "忙向后横移数尺，终于躲避开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

void remove_effect(object me)
{
        if (me->query_temp("long_tun"))
        {
                me->delete_temp("long_tun");
                tell_object(me, "你经过调气养息，又可以继续施展" TUN "了。\n");
        }
}
