// liu.c

#include <ansi.h>
#include "/kungfu/skill/eff_msg.h";

#define LIU "「" HIY "流星电闪" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill, i, p;
        int n;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/kunlun-qifa/liu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIU "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器，无法施展" LIU "。\n");

        if (weapon->query_amount() < 20)
                return notify_fail("至少要有二十枚暗器你才能施展" LIU "。\n");

        if ((skill = me->query_skill("kunlun-qifa", 1)) < 120)
                return notify_fail("你的昆仑器法尚不娴熟，难以施展" LIU "。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" LIU "。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你内力不够，难以施展" LIU "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg= HIY "$N" HIY "一声冷笑，飞身跃起，半空中十指陡然箕张，手中的"
             + weapon->name() + HIY "便如流星一般向$n" HIY "飞去！\n";

        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");

        if (random(my_exp) > ob_exp)
        {
                n = 5 + random(5);
                if (random(my_exp) > ob_exp) n += 5 + random(5);
                if (random(my_exp / 2) > ob_exp) n += 5 + random(5);
                if (random(my_exp / 4) > ob_exp) n += 5 + random(10);
                if (weapon->query_amount() < n) n = weapon->query_amount();

                msg += "$p" HIY "只觉眼前寒光一闪而过，反应不及，接连中了$P"
                       HIY + chinese_number(n) + weapon->query("base_unit") +
                       weapon->name() + HIY "！\n" NOR;
                target->receive_wound("qi", skill / 3 + random(skill / 2), me);
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
