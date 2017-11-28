#include <ansi.h>
#include "/kungfu/skill/eff_msg.h";

#define XIAN "「" HIY "金针现影" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int ap, dp, damage, p;
        string pmsg;
        string msg;
        object weapon;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/furong-jinzhen/xian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if ((int)me->query_skill("furong-jinzhen", 1) < 80)
                return notify_fail("你的芙蓉金针不够娴熟，难以施展" XIAN "。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，难以施展" XIAN "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你内力不够了。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -100);
        weapon->add_amount(-1);

        msg = HIY "只见$N" HIY "五指陡然箕张，$n" HIY "但觉眼前金光一"
              "闪，数股劲风随即扑面而来！\n" NOR;

        me->start_busy(2);

        ap = me->query_skill("force") + me->query_skill("throwing");
        dp = target->query_skill("dodge") + target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 5 + random(ap / 5);

                msg += HIR "$n" HIR "微微一愣，却已被$N" HIR
                       "那" + weapon->query("base_unit") +
                       weapon->name() + HIR "正中要穴，入肉"
                       "半寸之深。\n" NOR;

                target->receive_wound("qi", damage, me);
                COMBAT_D->clear_ahinfo();
                weapon->hit_ob(me, target, me->query("jiali") + 100);

                p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);

        } else
        {
                msg += CYN "可是$p" CYN "早料得$P" CYN
                       "有此一着，急忙飞身跃起，躲闪开来。"
                       "\n" NOR;
                message_combatd(msg, me, target);
        }
        me->reset_action();
        return 1;
}
