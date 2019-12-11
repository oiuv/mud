// fugu.c 金蛇游身掌-附骨缠身

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        // object weapon;
        // int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("附骨缠身只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon"))
                return notify_fail("你不是空手，不能使用附骨缠身。\n");

        if ((int)me->query_skill("jinshe-zhang", 1) < 100)
                return notify_fail("你的金蛇掌不够娴熟，不会使用附骨缠身。\n");

        if ((int)me->query("neili", 1) < 300)
                return notify_fail("你现在内力太弱，不能使用附骨缠身。\n");

        if (me->query_skill_prepared("strike") != "jinshe-zhang")
                return notify_fail("你现在没有激发金蛇掌法，无法使用附骨缠身。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "大喝一声，缠身而上左手一探刁住$n"
              HIC "手腕，右掌猛下杀手！\n"NOR;
        message_combatd(msg, me, target);

        if (target->is_busy() ||
            random(me->query_skill("strike")) > target->query_skill("parry") / 2)
        {
                if (! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
                COMBAT_D->do_attack(me, target, 0, 0);
                COMBAT_D->do_attack(me, target, 0, 0);

                me->add("neili", -150);
                me->start_busy(2);
                msg = HIR "结果$n" HIR "被$N" HIR "的左手所制，"
                      "在「附骨缠身」下，一时竟然无法还手！\n" NOR;
        }
        else
        {
                me->start_busy(2);
                msg = CYN "可是$p" CYN "识破了$P"
                      CYN "这一招，手肘一送，摆脱了对方控制。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
