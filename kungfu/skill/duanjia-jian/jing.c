#include <ansi.h>
#include <combat.h>

#define JING "「" HIR "惊天一剑" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;

        if (userp(me) && ! me->query("can_perform/duanjia-jian/jing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(JING "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" JING "。\n");

	if ((int)me->query_skill("duanjia-jian", 1) < 80)
		return notify_fail("你的段家剑法不够娴熟，难以施展" JING "。\n");

        if (me->query_skill_mapped("sword") != "duanjia-jian")
                return notify_fail("你现在没有激发段家剑，难以施展" JING "。\n");

	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功修为不够，难以施展" JING "。\n");

	if ((int)me->query("neili") < 300)
		return notify_fail("你现在的真气不够，难以施展" JING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "一跃而起，手腕一抖，挽出一个美丽的剑花，飞向$n"
              HIR "而去。\n"NOR;

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		damage = (int)me->query_skill("force") + (int)me->query_skill("sword");
                damage = damage / 5;
                damage += random(damage);
		me->add("neili", -damage);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "只见$N" HIR "人剑合一，穿向$n"
                                           HIR "，$n" HIR "只觉一股热流穿心而"
                                           "过，喉头一甜，鲜血狂喷而出！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "猛地向边上一跃，跳出了$P"
                       CYN "的攻击范围。\n"NOR;
		me->add("neili", -100);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
