// luan.c 乱刀诀

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
		return notify_fail("「乱刀诀」只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("必须拿刀才能施展「乱刀诀」！\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的真气不够，无法施展「乱刀诀」！\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够，难以施展「乱刀诀」！\n");

	if ((int)me->query_skill("dongyang-dao", 1) < 80)
		return notify_fail("你的东洋刀法还不到家，无法使用乱刀诀！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "\n$N" HIY "嘿嘿一声冷笑，手中的" + weapon->name() +
              HIY "左突右伸，刀刀都从意想不到的地方砍向$n"
              HIY "！\n" NOR;
	message_combatd(msg, me, target);
	me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(2) && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));
	return 1;
}
