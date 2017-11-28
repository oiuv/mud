#include <ansi.h>
#include <combat.h>

#define SHI "「" HIR "弑元诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/yuezhao-gong/shi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHI "只能对战斗中的对手使用。\n");
 
        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail(SHI "只能空手施展。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" SHI "。\n");

        if ((int)me->query_skill("yuezhao-gong", 1) < 130)
                return notify_fail("你越爪功等级不够，难以施展" SHI "。\n");
 
        if (me->query_skill_mapped("claw") != "yuezhao-gong")
                return notify_fail("你没有激发越爪功，难以施展" SHI "。\n");

        if (me->query_skill_prepared("claw") != "yuezhao-gong")
                return notify_fail("你没有准备越爪功，难以施展" SHI "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" SHI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = WHT "$N" WHT "施出越爪功「" HIR "弑元诀" NOR + WHT "」绝技，右"
              "手一横，直直抓向$n" WHT "破绽所在。\n" NOR;

	me->add("neili", -100);
        ap = me->query_skill("claw");
        dp = target->query_skill("dodge");
        if (ap / 2 + random(ap) > dp)
	{
		damage = me->query_skill("yuezhao-gong", 1);
                damage += random(damage);
		me->add("neili", -50);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 55,
		                           HIR "只听$n" HIR "一声惨嚎，竟被$N" HIR
                                           "的五指抓破气门，鲜血登时四处飞溅！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += HIC "可是$p" HIC "身手敏捷，身形急转，巧妙的躲过了$P"
                       HIC "的攻击。\n"NOR;
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
