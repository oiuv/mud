#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIR "幻遁寒星" NOR "」"

inherit F_SSERVER;

#include "/kungfu/skill/eff_msg.h";

int perform(object me, object target)
{
        int skill/*, i*/, p;
        int n;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/pidi-shenzhen/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (weapon->query_amount() < 20)
                return notify_fail("至少要有二十枚暗器才能施展" HUAN "。\n");

        if ((skill = me->query_skill("pidi-shenzhen", 1)) < 140)
                return notify_fail("你的辟地神针不够娴熟，难以施展" HUAN "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" HUAN "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不足，难以施展" HUAN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "只听$N" HIR "一声阴笑，身体急速旋转，顿时将手中所有的"
              + weapon->name() + HIR "朝着四面八方打了出去！\n" NOR;

        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");

        if (random(my_exp) > ob_exp)
        {
                n = 4 + random(4);
                if (random(my_exp) > ob_exp) n += 4 + random(4);
                if (random(my_exp / 2) > ob_exp) n += 4 + random(4);
                if (random(my_exp / 4) > ob_exp) n += 4 + random(8);
                if (weapon->query_amount() < n) n = weapon->query_amount();

                msg += HIR "$n" HIR "霎时只见无数寒芒暴雨般向自己袭来，躲"
                       "闪不及，接连中了$P" HIR + chinese_number(n) +
                       weapon->query("base_unit") + weapon->name() + HIR
                       "。\n" NOR;
                target->receive_damage("qi", skill + random(skill), me);
                target->receive_wound("qi", skill / 2 + random(skill / 2), me);
	        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
                while (n--)
                {
                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target,
                                       me->query("jiali") + 100 + n * 15);
                }

                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;

                msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);
        } else
        {
                msg += CYN "$p" CYN "见得$P" CYN "招数奇特，不敢大意，当"
                       "即飞身躲开了所有" + weapon->name() + CYN "。\n" NOR;
                message_combatd(msg, me, target);
        }

        weapon->set_amount(0);
        me->add("neili", -100);
        me->start_busy(2);
        me->reset_action();
        return 1;
}