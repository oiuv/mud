// jing.c 惊天一击

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
		return notify_fail("「惊天一击」只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");
		
	if ((int)me->query_skill("duanjia-sword", 1) < 70)
		return notify_fail("你的段家剑法不够娴熟，不会使用「惊天一击」。\n");
	                        
	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功修为不够高。\n");
			
	if ((int)me->query("neili") < 300)
		return notify_fail("你现在真气不够，不能使用「惊天一击」。\n");

        if (me->query_skill_mapped("sword") != "duanjia-sword")
                return notify_fail("你现在没有激发段家剑，不能使用「惊天一击」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "一跃而起，手腕一抖，挽出一个美丽的剑花，飞向$n" HIC "。\n"NOR;

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		damage = (int)me->query_skill("force") + (int)me->query_skill("sword");
                damage = damage / 5;
                damage += random(damage);
		me->add("neili", -damage);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "只见$N" HIR "人剑合一，穿向$n"
                                           HIR "，$n" HIR "只觉一股热"
                                           "流穿心而过，喉头一甜，鲜血狂喷而出！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += HIC "可是$p" HIC "猛地向边上一跃，跳出了$P" HIC "的攻击范围。\n"NOR;
		me->add("neili", -100);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
