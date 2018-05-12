#include <ansi.h>
#include <combat.h>

#define DUAN "「" HIW "断字诀" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon, ob;
	string msg/*, string1*/;
	int lev;
 
        if (userp(me) && ! me->query("can_perform/wuhu-duanmendao/duan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
		return notify_fail(DUAN "只能在战斗中对对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对，难以施展" DUAN "。\n");

	if ((int)me->query("neili") < 200)
		return notify_fail("你现在的真气不足，难以施展" DUAN "。\n");

	if ((int)me->query_skill("wuhu-duanmendao", 1) < 50)
		return notify_fail("你的五虎断门刀还不到家，难以施展" DUAN "。\n");

        if (me->query_skill_mapped("blade") != "wuhu-duanmendao")
		return notify_fail("你没有激发五虎断门刀，难以施展" DUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "猛然伏地，使出五虎断门刀「断」字决，顿时一片白光"
              "向前直滚而去！\n" NOR;
	message_combatd(msg, me);

	me->clean_up_enemy();
	ob = me->select_opponent();
	lev = me->query_skill("wuhu-duanmendao", 1);

	COMBAT_D->do_attack(me, ob, me->query_temp("weapon"));
	COMBAT_D->do_attack(me, ob, me->query_temp("weapon"));
	COMBAT_D->do_attack(me, ob, me->query_temp("weapon"));
	if (random(2) == 1)
		{
			me->add_temp("apply/attack", lev/2); 
			me->add_temp("apply/damage", lev/2);
			message_combatd(HIW  "$N从左面劈出第四刀！\n" NOR, me, target); 
			COMBAT_D->do_attack(me, ob, me->query_temp("weapon"));
			me->add_temp("apply/attack", -lev/2); 
			me->add_temp("apply/damage", -lev/2);
			
			if (random(2) == 1)
			{
				me->add_temp("apply/attack", lev); 
				me->add_temp("apply/damage", lev);
				message_combatd(RED  "$N从右面劈出第五刀！\n" NOR, me, target); 
				COMBAT_D->do_attack(me, ob, me->query_temp("weapon"));
				me->add_temp("apply/attack", -lev); 
				me->add_temp("apply/damage", -lev);
			}
			
		}
	

	me->add("neili", -100);
	me->start_busy(1 + random(3));
	return 1;
}