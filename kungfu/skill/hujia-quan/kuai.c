#include <ansi.h>
#include <combat.h>

#define KUAI "「" WHT "奔拳快打" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//	object weapon;
	string msg;

        if (userp(me) && ! me->query("can_perform/hujia-quan/kuai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(KUAI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(KUAI "只能空手施展。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不足，难以施展" KUAI "。\n");

	if ((int)me->query_skill("hujia-quan", 1) < 80)
		return notify_fail("你的胡家拳法不够娴熟，难以施展" KUAI "。\n");

        if (me->query_skill_mapped("cuff") != "hujia-quan")
                return notify_fail("你没有激发胡家拳法，难以施展" KUAI "。\n");

        if (me->query_skill_prepared("cuff") != "hujia-quan")
                return notify_fail("你没有准备胡家拳法，难以施展" KUAI "。\n");

        if (me->query("neili") < 80)
                return notify_fail("你现在真气不够，难以施展" KUAI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = WHT "$N" WHT "纵步上前，拳招迭出，疾如奔雷，霎时已向$n" WHT "攻出数拳。\n" NOR;

        me->add("neili", -40);
	if (random(me->query("combat_exp")) > (int)target->query("combat_exp") / 3)
        {
		msg += HIR "结果$n" HIR "无法分清$N" HIR "招式中的虚实，"
                       "不由手忙脚乱。\n" NOR;
		target->start_busy((int)me->query_skill("cuff") / 25 + 2);
	} else
        {
		msg += CYN "可是$p" CYN "看破了$P" CYN "的虚招，轻轻一闪，"
                       "避开了这骤雨般的拳影。\n" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}