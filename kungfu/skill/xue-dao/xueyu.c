// xueyu.c 血雨

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int count;
        int i;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
		return notify_fail("「血雨」只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对。\n");
		
	if ((int)me->query_skill("xue-dao", 1) < 70)
		return notify_fail("你的血刀刀法不够娴熟，不会使用「血雨」。\n");
	                        
	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功修为不够高。\n");
			
	if ((int)me->query("neili") < 100)
		return notify_fail("你现在真气不够，不能使用「血雨」。\n");

        if (me->query_skill_mapped("blade") != "xue-dao")
                return notify_fail("你没有激发血刀刀法，不能使用「血雨」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "嗔目大喝，手腕一抖，" + weapon->name() +
              HIR "如闪电一般砍向$n" HIR "！\n"NOR;

	message_combatd(msg, me, target);
	me->add("neili", -100);

	count = me->query_skill("blade") / 12;
	me->add_temp("apply/attack", count);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->add_temp("apply/attack", -count);
        me->start_busy(1 + random(5));
	return 1;
}
