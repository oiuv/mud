#include <ansi.h>
#include <combat.h>

#define DU "「" YEL "金针渡劫" NOR "」"

inherit F_SSERVER;

#include "/kungfu/skill/eff_msg.h";

int perform(object me, object target)
{
        int skill, i, p;
        int n;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/pomie-jinzhen/du"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(DU "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing"))
           || (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (weapon->query_amount() < 30)
                return notify_fail("你至少要拿有二十枚暗器才能施展" DU "。\n");

        if ((skill = me->query_skill("pomie-jinzhen", 1)) < 150)
                return notify_fail("你的破灭金针不够娴熟，难以施展" DU "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" DU "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在的真气不足，难以施展" DU "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = YEL "只见$N" YEL "右手一扬，施出「" HIR "金针渡劫" NOR +
              YEL "」，手中" + weapon->name() + YEL "如急风暴雨般向$n"
              YEL "射去！\n" NOR;

        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");

        if (random(my_exp) > ob_exp)
        {
                n = 4 + random(4);
                if (random(my_exp) > ob_exp) n += 4 + random(4);
                if (random(my_exp / 2) > ob_exp) n += 4 + random(4);
                if (random(my_exp / 4) > ob_exp) n += 4 + random(8);
                if (weapon->query_amount() < n) n = weapon->query_amount();

                msg += HIR "霎时间一片金芒笼罩$n" HIR "四方，听得一声"
                       "惨叫，" + chinese_number(n) + "柱鲜血飞溅而出"
                       "。\n" NOR;

                target->receive_damage("qi", skill + random(skill), me);
                target->receive_wound("qi", skill / 2 + random(skill / 2), me);
	        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
                while (n--)
                {
                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target, me->query("jiali") * 2 + 300 + n * 15);
                }
                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);
        } else
        {
                msg += CYN "可是$n" CYN "丝毫不敢大意，当即左闪右"
                       "避，躲开了所有的暗器。\n" NOR;
                message_combatd(msg, me, target);
        }
        weapon->set_amount(0);
        me->add("neili", -100);
        me->start_busy(2);
        me->reset_action();
        return 1;
}
