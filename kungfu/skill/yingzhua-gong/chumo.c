// chumo.c 荡妖除魔
 
#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;
 
int perform(object me)
{
	string msg;
	object target;
	int skill, ap, dp, damage;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「荡妖除魔」只能在战斗中对对手使用。\n");

	skill = me->query_skill("yingzhua-gong", 1);

	if (skill < 135)
		return notify_fail("你的鹰爪功等级不够，不会使用「荡妖除魔」！\n");

	if (me->query("neili") < 250)
		return notify_fail("你的真气不够，无法运用「荡妖除魔」！\n");
 
	if (me->query_skill_mapped("claw") != "yingzhua-gong") 
		return notify_fail("你没有激发鹰爪功，无法使用「荡妖除魔」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "微微一笑，双掌缓缓的向$n" HIY "抓出，此招"
	      "看上去也平平无奇，并无多少精妙变化！\n" NOR;
 
	ap = me->query_skill("force") + me->query_skill("claw");
	dp = target->query_skill("parry") + target->query_skill("dodge");
	if (ap / 2 + random(ap) > dp)
	{
		me->add("neili", -200);
		damage = ap / 2 + random(ap / 4);
		msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                           HIR "不知怎么的，$p" HIR "却偏偏躲不开$P"
                                           HIR "这一抓，结果被抓了个正中，不由得闷"
                                           "哼一声，退了几步。\n" NOR);
		me->start_busy(2);
	} else
	{
		msg += CYN "可是$p" CYN "没有轻视$P" CYN
                       "这一抓，连忙招架，顺势跃开，没有被$P"
                       CYN "得手。\n" NOR;
		me->add("neili",-40);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
