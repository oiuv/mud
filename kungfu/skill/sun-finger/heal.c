// heal.c

#include <ansi.h>

int perform(object me, object target)
{
        string force;

        if (! target)
                return notify_fail("你要用真气为谁疗伤？\n");

        if (target == me)
                return notify_fail("你只能替别人疗伤。\n");

        if (me->is_fighting() || target->is_fighting())
                return notify_fail("战斗中无法运功疗伤！\n");

        if (target->query("not_living"))
                return notify_fail("你不能给" + target->name() + "疗伤。\n");

        if (! (force = me->query_skill_mapped("force")))
                return notify_fail("你必须激发一种内功才能运功疗伤。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力还浅，不是运功疗伤。\n");

        if ((int)me->query("neili") < 1000)
                return notify_fail("你的真气现在不够，不能贸然行功。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的气现在不够，不要贸然行功。\n");

        if ((int)me->query("jing") < 100)
                return notify_fail("你的精现在不够，不要贸然行功。\n");

        if (target->query("eff_qi") >= target->query("max_qi") &&
            target->query("eff_jing") >= target->query("max_jing"))
                return notify_fail("对方没有受伤，不需要接受治疗。\n");

        message_combatd(HIY "$N默运" + to_chinese(force) +
                        "，施展开一阳指法，瞬时点遍了$n身上"
                        "诸要穴....\n\n" HIC
                        "$N深吸一口气，头上隐隐冒出白雾，$n"
                        "“哇”的一下吐出瘀血，脸色登时红润"
                        "多了。\n" NOR, me, target);

        me->add("neili", -1000);
        me->receive_damage("qi", 150);
        me->receive_damage("jing", 80);

        target->receive_curing("qi", 100 + (int) me->query_skill("force") +
                                           (int) me->query_skill("sun_finger", 1) * 3);

        if (target->query("qi") <= 0) target->set("qi", 1);
        target->receive_curing("jing", 100 + (int) me->query_skill("force") / 3 +
                                           (int) me->query_skill("sun_finger", 1));

        if (target->query("jing") <= 0) target->set("jing", 1);
        target->stary_busy(2);

        message_vision("\n$N闭目冥坐，开始运功调息。\n", me);
        me->start_busy(10);

        return 1;
}
