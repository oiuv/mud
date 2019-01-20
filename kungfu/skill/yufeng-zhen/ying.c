#include <ansi.h>

inherit F_SSERVER;

#define YING "「" HIY "无影针" NOR "」"

#include "/kungfu/skill/eff_msg.h";

int perform(object me, object target)
{
        int skill;
        // int i, n;
        int my_exp, ob_exp, p;
        string pmsg;
        string msg;
        object weapon;

        if (! target) target = offensive_target(me);

        if (! me->query("can_perform/yufeng-zhen/ying"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(YING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("handing")) ||
            (string)weapon->query("skill_type") != "throwing")
                return notify_fail("你现在手中并没有拿着针，怎么施展" YING "？\n");

        if (weapon->query_amount() < 1)
                return notify_fail("你手中没有针，无法施展" YING "。\n");

        if ((skill = me->query_skill("yufeng-zhen", 1)) < 100)
                return notify_fail("你的玉蜂针手法不够娴熟，不会使用" YING "。\n");

        if (me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法施展" YING "。\n");

        if (me->query_skill_mapped("throwing") != "yufeng-zhen")
                return notify_fail("你没有激发玉蜂针，不能使用" YING "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你内力不够，无法施展" YING "\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        me->add("neili", -80);
        weapon->add_amount(-1);

        msg= HIY "$N" HIY "身不慌，足不移，手掌只是轻轻一抖，只见"
             "一点寒光闪过，闪电般的射向$n" HIY "！\n" NOR;

        me->start_busy(2 + random(2));

        my_exp = me->query_skill("throwing");
        ob_exp = target->query_skill("dodge");
        if (my_exp / 2 + random(my_exp) > ob_exp)
        {
                msg += HIR "结果$p" HIR "反应不及，中了$P" + HIR "一" +
                       weapon->query("base_unit") + weapon->name() +
                       HIR "！\n" NOR;
                target->receive_wound("qi", skill + random(skill / 3), me);

                COMBAT_D->clear_ahinfo();
                weapon->hit_ob(me, target, me->query("jiali") + 100);

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
