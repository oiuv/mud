// kuangfeng.c  狂风绝技

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
 
	if (! target)
	{
		me->clean_up_enemy();
	        target = me->select_opponent();
	}

	if (! target || !me->is_fighting(target))
		return notify_fail("「狂风绝技」只能在战斗中对对手使用。\n");
 
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("「狂风绝技」开始时不能拿着兵器！\n");

	if ((int)me->query("neili") < 150)
		return notify_fail("你的真气不够！\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功水平不够！\n");

	if ((int)me->query_skill("luoying-shenzhang", 1) < 100 ||
	    me->query_skill("xuanfeng-leg",1) < 100)
		return notify_fail("你的腿掌功夫还不到家，无法使用狂风绝技！\n");

	if (me->query_skill_prepared("unarmed") != "xuanfeng-leg")
		return notify_fail("你没有准备旋风腿法，无法施展狂风绝技。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "使出桃花岛绝技「狂风绝技」，身法飘忽"
              "不定，有若天仙！\n" NOR;
	message_combatd(msg, me);
	me->add("neili", -100);

	for (i = 0; i < 6; i++)
	{
		if (! me->is_fighting(target))
			break;
                if (random(3) == 0 && ! target->is_busy())
                        target->start_busy(1);
		COMBAT_D->do_attack(me, target, 0, 0);
	}

	me->start_busy(1 + random(6));
	return 1;
}
