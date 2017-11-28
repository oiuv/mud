#include <ansi.h>
#include <combat.h>

#define SUN "「" HIR "损筋诀" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object target;
        int skill, ap, dp, damage;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/sanyin-shou/sun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        skill = me->query_skill("sanyin-shou", 1);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SUN "只能对战斗中的对手使用。\n");

        if (skill < 140)
                return notify_fail("你的三阴手等级不够，难以施展" SUN "。\n");

        if (me->query("max_neili") < 1600 )
                return notify_fail("你的内力修为不足，难以施展" SUN "。\n");

        if (me->query("neili") < 200 )
                return notify_fail("你的内力不够，难以施展" SUN "。\n");

        if (me->query_skill_mapped("hand") != "sanyin-shou")
                return notify_fail("你没有激发三阴手，难以施展" SUN "。\n");

        if (me->query_skill_prepared("hand") != "sanyin-shou")
                return notify_fail("你现在没有准备使用三阴手，难以施展" SUN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "悄然游走至$n" HIR "跟前，陡然使出"
              "三阴手绝技「损筋诀」，单掌轻轻拂过$n" HIR "太阳"
              "穴，不着半点力道。\n" NOR;

        damage = skill / 2 + random(skill / 2);

        ap = me->query_skill("hand");
        dp = target->query_skill("parry");
        if (ap / 2 + random(ap) > dp)
        {
                me->add("neili", -200);
                me->start_busy(2);
                target->receive_damage("jing", damage);
                target->receive_wound("jing", damage);
                target->start_busy(1);
                msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK,
                       damage, 0, HIR "$n" HIR "稍不留神，已被$N" HIR
                       "单掌拂中，只觉眼前一黑，几欲晕倒。\n" NOR);
        }
        else
        {
                me->add("neili", -100);
                msg += CYN "$n" CYN "见状大吃一惊，急忙向后猛退数步，"
                       "终于避开了$N" CYN "这一击。\n" NOR;
                me->start_busy(4);
        }
        message_combatd(msg, me, target);
        return 1;
}
