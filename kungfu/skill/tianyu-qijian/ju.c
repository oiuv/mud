#include <ansi.h>
#include <combat.h>

#define JU "「" HIR "聚剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;

        if (userp(me) && ! me->query("can_perform/tianyu-qijian/ju"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(JU "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" JU "。\n");

	if ((int)me->query_skill("tianyu-qijian", 1) < 130)
                return notify_fail("你的天羽奇剑不够娴熟，难以施展" JU "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不足，难以施展" JU "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" JU "。\n");
                        
        if (me->query_skill_mapped("sword") != "tianyu-qijian")
                return notify_fail("你没有激发天羽奇剑，难以施展" JU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "手腕轻轻一抖，手中的" + weapon->name() +
	      HIR "化作一道彩虹，光华眩目，笼罩了$n" HIR "。\n" NOR;

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		damage = (int)me->query_skill("sword") / 2;
		damage = damage + random(damage);

		me->add("neili", -160);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "只见$N" HIR "剑花聚为一线，穿向$n"
                                           HIR "，$p" HIR "只觉一股热流穿心而过，"
                                           "喉头一甜，鲜血狂喷而出！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "猛地向前一跃,跳出了$P"
                       CYN "的攻击范围。\n"NOR;
		me->add("neili", -80);
		me->start_busy(4);
	}
	message_combatd(msg, me, target);

	return 1;
}
