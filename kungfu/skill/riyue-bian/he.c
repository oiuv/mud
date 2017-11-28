// he.c 「合」字诀

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int count;
	int i, attack_time;

  if (userp(me) && ! me->query("can_perform/riyue-bian/he"))
                return notify_fail("你还没有受过高人指点，无法施展「合」字诀。\n");
                
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("日月鞭法「合」字诀只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
		return notify_fail("你使用的武器不对。\n");

	if ((int)me->query_skill("riyue-bian", 1) < 120)
		return notify_fail("你的日月鞭法不够娴熟，不会使用「合」字诀。\n");

	if (me->query("neili") < 350)
		return notify_fail("你的真气不够，无法使用「合」字诀。\n");

        if (me->query_skill_mapped("whip") != "riyue-bian")
                return notify_fail("你没有激发日月鞭法，无法使用「合」字诀。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "将手中的" + weapon->name() +
              HIY "一抖，使出日月鞭法「合」字诀，舞起漫天鞭影！\n" NOR;

	ap = me->query_skill("whip");
	dp = target->query_skill("parry");
        attack_time = 5;
	if (ap / 2 + random(ap * 2) > dp)
	{
		msg += HIC "结果$p" HIC "被$P" HIC
                       "攻了个措手不及，目接不暇，疲于奔命！\n" NOR;
                count = ap / 5;

                me->add_temp("apply/attack", count);
                attack_time += random(ap / 45);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "鞭势恢弘，心下凛然，凝神应付。\n" NOR;
                count = 0;
        }
                
	message_combatd(msg, me, target);

        if (attack_time > 10)
                attack_time = 10;

	me->add("neili", -attack_time * 20);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;
		COMBAT_D->do_attack(me, target, weapon, 0);
	}

        me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(attack_time));
	return 1;
}
