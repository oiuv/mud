// zhan.c 迎风一刀斩

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
		return notify_fail("「迎风一刀斩」只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对。\n");
		
	if ((int)me->query_skill("dongyang-dao", 1) < 70)
		return notify_fail("你的东洋刀法不够娴熟，不会使用「迎风一刀斩」。\n");
	                        
	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功修为不够高，难以运用「迎风一刀斩」。\n");
			
	if ((int)me->query("neili") < 300)
		return notify_fail("你现在真气不够，不能使用「迎风一刀斩」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "\n$N" HIC "大喝一声，眼中凶光毕露，手中的" +
              weapon->name() + HIC "化作一道光弧直劈而下，正是扶桑密学「迎风一刀斩」。\n"NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("force");
	if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 2 + random(ap);
		me->add("neili", -100);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 55,
                                           HIR "$n" HIR "只觉得脑中轰的一下，浑"
                                           "身血脉登时不畅，不禁“哇”的吐了一口鲜血。\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += HIC "然而$p" HIC "运足中气，硬接下了这一刀，丝毫无伤。\n"NOR;
		me->add("neili", -50);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
