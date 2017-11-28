// sanshen.c 华岳三神峰

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define SAN "「" HIG "华岳三神峰" NOR "」"
 
int perform(object me, object target)
{
	object weapon;
	string msg;
	int i, damage;
        int ap, dp;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/fanliangyi-dao/san"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
		return notify_fail(SAN "只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对。\n");

	if ((int)me->query("max_neili") < 1800)
		return notify_fail("你的内力修为不够，无法施展" SAN "！\n");

	if ((int)me->query("neili") < 320)
		return notify_fail("你的真气不够！\n");

	if ((int)me->query_skill("fanliangyi-dao", 1) < 100)
		return notify_fail("你反两仪刀法火候不足，无法施展" SAN "\n");

	if ((int)me->query_skill("force", 1) < 140)
		return notify_fail("你的内功修为不足，无法施展" SAN "\n");

	if (me->query_skill_mapped("blade") != "fanliangyi-dao")
		return notify_fail("你还没有激发反两仪刀法，无法施展" SAN "！\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "\n$N" HIY "使出华山派绝技「" HIG "华岳三神峰" HIY "」，身"
              "法突然变得异常灵动飘忽！手中" + weapon->name() + HIY "连连卷"
              "向$n" HIY "。" NOR; 
	message_sort(msg, me, target);

        msg = HIW "$N" HIW "反转" + weapon->name() + HIW "，忽然一刀劈出，威力无穷。\n" NOR;
        
        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) < dp)
                msg += CYN "$n" CYN "向外一跳闪过了这招。\n" NOR;
        else
        {
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "躲避不及，被$N"
                                           HIR "这刀砍中肩膀，鲜血直流。\n" NOR);
        }

        msg += HIW "\n$N" HIW "回转" + weapon->name() + HIW "，猛地大步向前，直袭$n" HIW "下盘。\n" NOR;
        if (ap / 2 + random(ap) < dp)
                msg += CYN "$n" CYN "纵身而起，躲过这一招。\n" NOR;
        else
        {
                damage = ap / 2+ random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "$n"HIR "闪避不及，大腿已被$N" HIR "砍得血肉模糊！\n" NOR);
        }

        msg += HIW "\n$N" HIW "飞身跃起，手中" + weapon->name() + HIW "自天而下，劈向$n" HIW "。\n" NOR;
        if (ap / 2 + random(ap) < dp)
                msg += CYN "$n" CYN "一快打快，向后飞身一跳，竟躲过这招。\n" NOR;
        else
        {
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "$n" HIR "正犹豫剑，刀光划过，鲜血已染满刀身。！\n" NOR);
        }

        me->start_busy(3);
        message_combatd(msg, me, target);
        return 1;
}
