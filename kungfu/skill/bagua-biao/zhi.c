#include <ansi.h>
#include "/kungfu/skill/eff_msg.h";

#define ZHI "「" HIY "乾坤一掷" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill/*, i*/, p;
        int n;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/bagua-biao/zhi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHI "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (weapon->query_amount() < 30)
                return notify_fail("至少要有三十枚暗器你才能施展" ZHI "。\n");

        if ((skill = me->query_skill("bagua-biao", 1)) < 120)
                return notify_fail("你的八卦镖诀不够娴熟，难以施展" ZHI "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" ZHI "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不足，难以施展" ZHI "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg= HIY "只见$N" HIY "纵身一跃而起，一声暴喝，十指箕张，将手中所有"
             "的" + weapon->name() + HIY "打了出去！\n";

        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");

        if (random(my_exp) > ob_exp)
        {
                n = 5 + random(5);
                if (random(my_exp) > ob_exp) n += 5 + random(5);
                if (random(my_exp / 2) > ob_exp) n += 5 + random(5);
                if (random(my_exp / 4) > ob_exp) n += 5 + random(10);
                if (weapon->query_amount() < n) n = weapon->query_amount();

                msg += "$p" HIY "刹时只觉眼前金光万道，反应不及，接连中了$P"
                       HIY + chinese_number(n) + weapon->query("base_unit") +
                       weapon->name() + HIY "！\n" NOR;
                target->receive_damage("qi", skill * 3 / 2 + random(skill * 3 / 2), me);
                target->receive_wound("qi", skill * 2 / 3 + random(skill * 2 / 3), me);
                p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                while (n--)
                {
                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target, me->query("jiali") + 150 + n * 30);
                }
                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);
        } else
        {
                msg += NOR + CYN "可是$p" CYN "眼明手快，躲过了$P" CYN "发出"
                       "的所有" + weapon->name() + CYN "。\n" NOR;
                message_combatd(msg, me, target);
        }

        weapon->set_amount(0);
        me->add("neili", -100);
        me->start_busy(2);
        me->reset_action();
        return 1;
}