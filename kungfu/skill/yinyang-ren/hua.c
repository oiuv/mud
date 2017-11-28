#include <ansi.h>
#include <combat.h>

#define HUA "「" HIY "日月无华" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        object weapon;
        int level;

        if (userp(me) && ! me->query("can_perform/yinyang-ren/hua"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUA "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" HUA "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        level = me->query_skill("yinyang-ren", 1);

        if (level < 180)
		return notify_fail("你阴阳刃法不够娴熟，难以施展" HUA "。\n");

        if (me->query_skill_mapped("sword") != "yinyang-ren"
            && me->query_skill_mapped("blade") != "yinyang-ren")
                return notify_fail("你没有激发阴阳刃法，难以施展" HUA "。\n");

	if ((int)me->query_skill("force") < 200)
		return notify_fail("你的内功火候不足，难以施展" HUA "。\n");

        if (me->query("neili") < 150)
                return notify_fail("你现在的真气不够，难以施展" HUA "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");


	msg = HIG "\n$N" HIG "使出阴阳刃法「" HIY "日月无华" HIG "」，手"
              "中" + weapon->name() + HIG "光芒瀑涨，刺眼眩目，日月为"
              "之失辉，刹那间光芒已盖向$n" HIG "。" NOR;
        message_sort(msg, me, target);

        me->add("neili", -120);
        if (level / 2 + random(level) > target->query_skill("dodge", 1))
        {
		msg = HIR "$n" HIR "被耀眼的光芒所惑，心中惊"
                      "疑不定，一时间不知如何应对！\n" NOR; 
                target->start_busy(level / 24 + 2);
                me->start_busy(1);
	} else
        {
		msg = CYN "可是$n" CYN "看破了$N"
                      CYN "的企图，一丝不乱，应对自若。\n" NOR;
                me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}