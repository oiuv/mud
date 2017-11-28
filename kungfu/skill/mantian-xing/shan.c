#include <ansi.h>
#include <combat.h>

#define SHAN "「" HIY "星光闪烁" NOR "」"

#include "/kungfu/skill/eff_msg.h";

inherit F_SSERVER;

int perform(object me, object target)
{
        int skill/*, i*/, p/*, n*/;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/mantian-xing/shan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中没有拿着暗器，难以施展" SHAN "。\n");

        if (weapon->query_amount() < 3)
                return notify_fail("至少要有三枚暗器才能施展" SHAN "。\n");

        if ((skill = me->query_skill("mantian-xing", 1)) < 100)
                return notify_fail("你的满天星不够娴熟，难以施展" SHAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" SHAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -80);
        weapon->add_amount(-3);

        msg= HIY "$N" HIY "突然纵身向后一个翻滚，就在快落地的一瞬"
             "间，$n" HIY "陡然发现几点寒光闪烁不定地袭向自己！\n" NOR;

        me->start_busy(2);
        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");
        if (random(my_exp) > ob_exp)
        {
                msg += HIR "结果$p" HIR "反应不及，中了$P" + HIR "一" +
                       weapon->query("base_unit") + weapon->name() +
                       HIR "！\n" NOR;
                target->receive_wound("qi", skill / 3 + random(skill / 3), me);
                COMBAT_D->clear_ahinfo();
                weapon->hit_ob(me, target, me->query("jiali") + 120);

                p = (int)target->query("qi") * 100 / (int)target->query("max_qi");

                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";
                message_combatd(msg, me, target);
        } else
        {
                msg += HIG "可是$p" HIG "从容不迫，轻巧的闪过了$P" HIG "发出的" +
                       weapon->name() + HIG "。\n" NOR;
                message_combatd(msg, me, target);
        }

        me->reset_action();
        return 1;
}