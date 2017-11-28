#include <ansi.h>
#include "/kungfu/skill/eff_msg.h";

#define SHE "「" HIR "射日诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill, i;
        int n, p;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/fenglei-zifa/she"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHE "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing" ||
            weapon->query_amount() < 1)
                return notify_fail("你现在手中并没有拿着暗器，无法施展出" SHE "。\n");

        if ((skill = me->query_skill("fenglei-zifa", 1)) < 100)
                return notify_fail("你的风雷子法不够娴熟，无法施展" SHE "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你内力不足，无法施展" SHE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -80);
        weapon->add_amount(-1);

        msg = HIR "$N" HIR "身形微微一展，单手一晃，只听“飕”的一声，一" +
             weapon->query("base_unit") + weapon->name() + HIR "如闪电般" +
             "射向$n" HIR "而去。\n" NOR;

        me->start_busy(2);
        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");
        p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
        if (random(my_exp) > ob_exp * 2 / 3)
        {
                msg += HIR "$n" HIR "闪避不及，顿时被这招打了个血肉模糊"
                       "的窟窿，整个人疼得几乎都要散架。\n" NOR;
                target->receive_wound("qi", skill / 2 + random(skill / 2), me);
                COMBAT_D->clear_ahinfo();
                weapon->hit_ob(me, target, me->query("jiali") + 150);
                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);
        } else
        {
                msg += CYN "可是$p" CYN "轻轻一纵，躲闪开了$P" CYN "发出的" +
                       weapon->name() + CYN "。\n" NOR;
                message_combatd(msg, me, target);
        }

        me->reset_action();
        return 1;
}
