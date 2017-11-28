#include <ansi.h>
#include <combat.h>

#define JIN "「" HIY "金刚剑气" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/canhe-zhi/jin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(JIN "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" JIN "。\n");

        if ((int)me->query_skill("canhe-zhi", 1) < 160)
                return notify_fail("你的参合指修为有限，难以施展" JIN "。\n");

        if (me->query_skill_prepared("finger") != "canhe-zhi")
                return notify_fail("你现在没有准备使用参合指，难以施展" JIN "。\n");

        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力修为不足，难以施展" JIN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的真气不够，难以施展" JIN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "双手合十，微微一笑，颇得拈花之意。食指并中指"
              "轻轻一弹，顿时一屡罡气电射而出，朝$n" HIY "袭去。\n" NOR;  

        ap = me->query_skill("canhe-zhi", 1) + me->query_skill("force");
        dp = target->query_skill("buddhism", 1) + target->query_skill("force");
        me->start_busy(3);

        if ((int)target->query_skill("buddhism", 1) >= 200
            && random(5) == 1)
        {
                me->add("neili", -400);
                me->start_busy(4);
                msg += HIY "但见$n" HIY "也即脸露笑容，衣袖轻轻一拂，顺势"
                       "裹上，顿将$N" HIY "的指力消逝殆尽。\n" NOR;
        } else
        if (ap * 2 / 3 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                me->add("neili", -400);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 75,
                                           (: final, me, target, damage :));
        } else
        {
                me->add("neili", -200);
                me->start_busy(4);
                msg += CYN "$n" CYN "见$N" CYN "来势汹涌，不敢轻易"
                       "招架，急忙提气跃开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

string final(object me, object target, int damage)
{
        target->receive_damage("jing", damage / 6, me);
        target->receive_wound("jing", damage / 10, me);
        return  HIR "只听“噗嗤”一声，指力竟在$n" HIR
                "胸前穿了一个血肉模糊的大洞，透体而入。\n" NOR;
}
