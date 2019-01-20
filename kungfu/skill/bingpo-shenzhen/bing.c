#include <ansi.h>
#include <combat.h>

#define BING "「" HIG "寒冰针" NOR "」"

#include "/kungfu/skill/eff_msg.h";

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill;
        int ap, dp, p;
        string msg, pmsg;
        object weapon;

        if (! me->query("can_perform/bingpo-shenzhen/bing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中没有拿着暗器，难以施展" BING "。\n");

        if (weapon->query_amount() < 1)
                return notify_fail("你手中没有针，无法施展" BING "。\n");

        if ((skill = me->query_skill("bingpo-shenzhen", 1)) < 120)
                return notify_fail("你的冰魄神针不够娴熟，难以施展" BING "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功修为不足，难以施展" BING "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为不足，难以施展" BING "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不足，难以施展" BING "。\n");

        if ((int)target->query_temp("bingpo"))
                return notify_fail("对方已经中了你的绝招，现在是废人一"
                                   "个，赶快进攻吧！\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -120);
        weapon->add_amount(-1);

        msg = HIY "只见$N" HIY "长袖微拂，手腕一转，一招「" HIW "寒冰针"
              HIY"」，将手中" + weapon->name() + HIY "猛地射出。刹那\n"
              "间，长空破响，" + weapon->name() + HIY "如同一颗流星划过，"
              "袭向$n！\n" NOR;

        ap = me->query_skill("throwing");
        dp = target->query_skill("dodge");

        if (ap + random(ap / 2) > dp)
        {
                if (target->query_skill("parry") < me->query_skill("throwing"))
                {

                        msg += HIR "只听$n" HIR "惨叫一声，" + weapon->name() + HIR
                               "已经射中要害，只感伤口处透处阵阵寒意，顿觉全身软"
                               "弱无力。\n"NOR;

                        target->receive_damage("qi", skill + random(skill), me);
                        target->receive_wound("qi", skill + random(skill / 2), me);
                        target->set_temp("bingpo", 1);
                        target->add_temp("apply/attack", -70);
                        target->add_temp("apply/dodge", -70);
                        target->add_temp("apply/parry", -20);

                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target, me->query("jiali") + 180);

                        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                        if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                                 msg += pmsg;

                        msg += "( $n" + eff_status_msg(p) + " )\n";

                        message_combatd(msg, me, target);

                        tell_object(target, RED "你现在要穴受到重损，乃至全身乏力"
                                            "，提不上半点力道！\n" NOR);
                        tell_object(me, HIC "你心知刚才这招已打中对方要害，不禁暗自冷笑。\n" NOR);
                        call_out("back", 2 + random(skill / 15), target);
                } else
                {
                        msg += HIR "$n" HIR "眼见暗器袭来，左躲右闪，但仍"
                               "然受了一点轻伤。\n" NOR, me, target;

                        target->receive_damage("qi", 100);
                        target->receive_wound("qi", 40);
                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target, me->query("jiali") / 2);
                        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                        msg += "( $n" + eff_status_msg(p) + " )\n";

                        message_combatd(msg, me, target);

                        tell_object(target, RED "你只觉全身几处一阵刺痛，知道自己"
                                            "虽被击中，但却是避开了要害。\n" NOR);
                        me->start_busy(1 + random(2));
                }
        } else
        {        msg += CYN "可是$n" CYN "身法灵巧，小心闪避，好不容易避开了"
                                 CYN "$N" CYN "迅猛如电的攻击。\n" NOR;
                 message_combatd(msg, me, target);
                 me->start_busy(3);
        }
        return 1;
}

void back(object target)
{
        if (objectp(target))
        {
                target->add_temp("apply/attack", 70);
                target->add_temp("apply/dodge", 70);
                target->add_temp("apply/parry", 20);
                tell_object(target, HIY "渐渐的你觉得力气一丝丝的恢复了。\n" NOR);
                target->delete_temp("bingpo");
        }
}
