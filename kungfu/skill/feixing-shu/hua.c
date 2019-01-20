// huayu.c

#include <ansi.h>
#include <combat.h>

#include "/kungfu/skill/eff_msg.h";

inherit F_SSERVER;

#define YU "「" HIG "满天花雨" NOR "」"

int perform(object me, object target)
{
        int skill;
        int n, p;
        int my_exp, ob_exp;
        string pmsg;
        string msg;
        object weapon;

       if (userp(me) && ! me->query("can_perform/feixing-shu/hua"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(YU "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着暗器。\n");

        if (weapon->query_amount() < 10)
                return notify_fail("至少要有十枚暗器你才能施展" YU "。\n");

        if ((skill = me->query_skill("feixing-shu", 1)) < 100)
                return notify_fail("你的飞星术不够娴熟，不会使用" YU "。\n");

        if ((int)me->query_skill("force", 1) < 120)
                return notify_fail("你的内功火候不够，不能使用" YU "。\n");

        if (me->query_skill_mapped("throwing") != "feixing-shu")
                return notify_fail("你没有激发飞星术为基本暗器，无法施展" YU "。\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你内力不够了。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -100);
        weapon->add_amount(-10);

        msg= HIG "只听一股劲风从$N" HIG "的右侧发出，$N" HIG
             "手中的" + weapon->name() + HIG "如烟雨般向$n"
             HIG "笼罩过去！\n" NOR;

        me->start_busy(2);
        my_exp = me->query("combat_exp") + skill * skill / 10 * skill;
        ob_exp = target->query("combat_exp");
        if (random(my_exp) > ob_exp)
        {
                me->add("neili", -100);
                n = 1 + random(2);

                if (random(my_exp) > ob_exp) n += 1 + random(2);
                if (random(my_exp / 2) > ob_exp) n += 1 + random(2);
                if (random(my_exp / 4) > ob_exp) n += 1 + random(2);
                msg += HIR "结果$n" HIR "反应不及，中了$N" HIR +
                       chinese_number(n) + weapon->query("base_unit") +
                       weapon->name() + HIR "！\n" NOR;

                target->receive_wound("qi", skill / 3 + random(skill / 3), me);
                p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
                while (n--)
                {
                        COMBAT_D->clear_ahinfo();
                        weapon->hit_ob(me, target, me->query("jiali") + 100 + n * 10);
                }
                if (stringp(pmsg = COMBAT_D->query_ahinfo()))
                        msg += pmsg;
                        msg += "( $n" + eff_status_msg(p) + " )\n";

                message_combatd(msg, me, target);
        } else
        {
                msg += NOR + CYN "可是$n" CYN  "身法灵动，躲过了$N" CYN  "发出的所有" +
                       weapon->name() + CYN  "。\n" NOR;
                message_combatd(msg, me, target);
        }

        me->reset_action();
        return 1;
}
