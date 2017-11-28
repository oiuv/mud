#include <ansi.h>
#include <combat.h>

#define HUI "「" HIG "回峰蜿蜒势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int level;

        if (userp(me) && ! me->query("can_perform/wushen-jian/hui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUI "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" HUI "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        level = me->query_skill("wushen-jian", 1);

        if (level < 180)
		return notify_fail("你衡山五神剑不够娴熟，难以施展" HUI "。\n");

        if (me->query_skill_mapped("sword") != "wushen-jian")
                return notify_fail("你没有激发衡山五神剑，难以施展" HUI "。\n");

	if ((int)me->query_skill("force") < 250)
		return notify_fail("你的内功火候不足，难以施展" HUI "。\n");

        if (me->query("neili") < 160)
                return notify_fail("你现在的真气不够，难以施展" HUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "\n$N" HIG "使出衡山五神剑「" HIC "回峰蜿蜒势" HIG "」，"
              "手中" + weapon->name() + HIG "猛然反转，剑势迂回诡异，连"
              "连袭向$n" HIG "。" NOR;

        message_sort(msg, me, target);

        me->add("neili", -100);
        if (level / 2 + random(level) > target->query_skill("dodge", 1))
        {
		msg = HIR "剑势迂回间$N" HIR "招式陡然变快，$n已被$N"
                      HIR "攻的目不暇接，手忙脚乱！\n" NOR;
                target->start_busy(level / 18 + 2);
                me->start_busy(1);
	} else
        {
		msg = CYN "可是$n" CYN "看破了$N"
                      CYN "的企图，镇定解招，一丝不乱。\n" NOR;
                me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
