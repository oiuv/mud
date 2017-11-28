// jie.c 华山剑法「截手式」
// MODIFY BY RCWIZ 2003

#include <ansi.h>

inherit F_SSERVER;

#define JIE "「" HIG "截手式" NOR "」"

int perform(object me, object target)
{
	object weapon;
        int level;
	string msg;

	if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/huashan-jian/jie"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(JIE "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");
		
	if ((level = me->query_skill("huashan-jian", 1)) < 30)
		return notify_fail("你的华山剑法不够娴熟，无法施展" JIE " 。\n");

        if (me->query_skill_mapped("sword") != "huashan-jian")
                return notify_fail("你没有激发华山剑法，无法施展" JIE "。\n");

        if (me->query("neili") < 60)
                return notify_fail("你现在真气不够，无法使用「截手式」。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "\n但见$N" HIW "长剑一勒，使出华山剑法绝技之"
              "「" HIG "截手式" HIW "」，转折之际天衣无缝，一"
              "剑既出，后着源源倾泻，如大浪跃滩，层层叠叠，迅"
              "然扑向$n" HIW "！\n" NOR;

        me->add("neili", -50);
	if (random(level) > (int)target->query_skill("parry", 1) / 2)
        {
		msg += HIR "结果$p" HIR "瘁不及防，连连倒退"
                       "几步，一时间无法回手！\n" NOR;
		target->start_busy(level / 22 + 2);
	} else
        {
                if (objectp(weapon = target->query_temp("weapon")))
        		msg += CYN "但是$p" CYN "识破了$P" CYN "的用意，"
                               "自顾将手中的" + weapon->name() +
                               CYN "舞成一团光花，$P"
                               CYN "一怔之下再也攻不进去。\n" NOR;
                else
                        msg += CYN "但是$p" CYN "双手戳点刺拍，将$P"
                               CYN "的来招一一架开。\n" NOR;

		me->start_busy(1);
	}
	message_sort(msg, me, target);

	return 1;
}
