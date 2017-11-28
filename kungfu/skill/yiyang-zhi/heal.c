#include <ansi.h>

#define HEAL "「" HIR "起死回生" NOR "」"

int perform(object me, object target)
{
        string force;

        if (userp(me) && ! me->query("can_perform/yiyang-zhi/heal"))
                return notify_fail("你所学的外功中没有这种功能。\n");

        if (! target)
                return notify_fail("你要用真气为谁疗伤？\n");

        if (target == me)
                return notify_fail(HEAL "只能对别人施展。\n");

        if (me->is_fighting() || target->is_fighting())
                return notify_fail("战斗中无法运功疗伤。\n");

        if (target->query("not_living"))
                return notify_fail("你无法给" + target->name() + "疗伤。\n");

        if ((int)me->query_skill("yiyang-zhi", 1) < 100)
                return notify_fail("你的一阳指诀不够娴熟，难以施展" HEAL "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 100)
                return notify_fail("你对经络学的了解不够，难以施展" HEAL "。\n");

        if (me->query_skill_mapped("finger") != "yiyang-zhi")
                return notify_fail("你没有激发一阳指，难以施展" HEAL "。\n");

        if (me->query_skill_prepared("finger") != "yiyang-zhi")
                return notify_fail("你没有准备一阳指，难以施展" HEAL "。\n");

        if (! (force = me->query_skill_mapped("force")))
                return notify_fail("你必须激发一种内功才能施展" HEAL "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为太浅，难以施展" HEAL "。\n");

        if ((int)me->query("neili") < 1000)
                return notify_fail("你现在的真气不足，难以施展" HEAL "。\n");

        if ((int)me->query("jing") < 100)
                return notify_fail("你现在的状态不佳，难以施展" HEAL "。\n");

        if (target->query("eff_qi") >= target->query("max_qi") &&
            target->query("eff_jing") >= target->query("max_jing"))
                return notify_fail("对方没有受伤，不需要接受治疗。\n");

        message_sort(HIY "\n只见$N" HIY "默默运转" + to_chinese(force) +
                     HIY "，深深吸进一口气，头上隐隐冒出白雾，陡然施展开"
                     "一阳指诀，以纯阳指力瞬时点遍了$n" HIY "全身七十二"
                     "处大穴。过得一会，便见得$n" HIY "“哇”的一下吐出"
                     "几口瘀血，脸色登时看起来红润多了。\n" NOR, me, target);

        me->add("neili", -800);
        me->receive_damage("qi", 100);
        me->receive_damage("jing", 50);

        target->receive_curing("qi", 100 + (int)me->query_skill("force") +
                                     (int)me->query_skill("yiyang-zhi", 1) * 3);

        if (target->query("qi") <= 0)
                target->set("qi", 1);

        target->receive_curing("jing", 100 + (int)me->query_skill("force") / 3 +
                                       (int)me->query_skill("yiyang-zhi", 1));

        if (target->query("jing") <= 0)
                target->set("jing", 1);

        if ((int)target->query_condition("tiezhang_yin")
           || (int)target->query_condition("tiezhang_yang"))
        {
                target->clear_condition("tiezhang_yin");
                target->clear_condition("tiezhang_yang");
                tell_object(target, HIC "\n你只觉体内残存的铁掌掌劲慢慢"
                                    "消退，感觉好多了。\n" NOR);
        }

        if ((int)target->query_condition("freezing"))
        {
                target->clear_condition("freezing");                
                tell_object(target, HIC "\n你只觉浑身渐渐转暖，寒冰真气之毒已消失得无影无踪。\n" NOR);
        }

        if (! living(target))
                target->revive();

        if (! target->is_busy())
                target->stary_busy(2);

        message_vision("\n$N闭目冥坐，开始运功调息。\n", me);
        me->start_busy(10);
        return 1;
}
