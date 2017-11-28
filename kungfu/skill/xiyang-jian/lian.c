// lian.c 西洋连环剑

#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;
 
        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「连环剑」只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("必须拿剑才能施展「连环剑」！\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的真气不够，无法施展「连环剑」！\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够，难以施展「连环剑」！\n");

	if ((int)me->query_skill("xiyang-jian", 1) < 80)
		return notify_fail("你的西洋剑术还不到家，无法使用连环剑！\n");

        if (me->query_skill_mapped("sword") != "xiyang-jian")
                return notify_fail("你没有激发西洋剑术，无法使用连环剑！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "\n$N" HIC "狂喝一声，只见上一剑、下一剑、左一剑、右一剑、当中一剑，一起刺向$n"
              HIC "！\n" NOR;
	message_combatd(msg, me, target);
	me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (random(3) == 0 && ! target->is_busy())
                        target->start_busy(1);

        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));
	return 1;
}
