// jue.c 五绝剑

#include <ansi.h>
#include <skill.h>
#include <weapon.h>
#include <combat.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;

        if (userp(me) && ! me->query("can_perform/duanjia-sword/jue"))
                return notify_fail("你现在还不会使用五绝剑！\n");
 
        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("段家五绝剑只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword" &&
            (string)weapon->query("skill_type") != "staff")
		return notify_fail("你必须持剑或杖才能施展段家五绝剑！\n");

	if ((int)me->query("neili") < 150)
		return notify_fail("你的真气不够！\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够！\n");

	if ((int)me->query_skill("duanjia-sword", 1) < 100)
		return notify_fail("你的段家剑法还不到家，无法使用五绝剑！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "深吸一口气，脚下步步进击，稳重之极，手中的" +
              weapon->name() + HIY "使得犹如飞龙一般，缠绕向$n" HIY "！\n" NOR;
	message_combatd(msg, me, target);
	me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(5) == 0 && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));
	return 1;
}
