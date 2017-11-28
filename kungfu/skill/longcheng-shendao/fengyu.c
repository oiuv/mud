// fengyu.c 风雨交加

#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int count;
        int lvl;
        int i;
 
        if (userp(me) && ! me->query("can_perform/longcheng-shendao/fengyu"))
                return notify_fail("你不会使用「风雨交加」。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「风雨交加」只能对战斗中的对手使用。\n");
 
	if (!objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
		return notify_fail("施展「风雨交加」手中必须拿着一把刀！\n");

	if ((int)me->query("neili") < 270)
		return notify_fail("你的真气不够，无法施展「风雨交加」！\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功火候不够，无法施展「风雨交加」！\n");

	if ((lvl = (int)me->query_skill("longcheng-shendao", 1)) < 120)
		return notify_fail("你的龙城神刀还不到家，无法使用绝技「风雨交加」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "大喝一声，手中的" + weapon->name() + HIC
              "如雨点一般向$n" HIC "打去，$n" HIC "如同小舟一般在刀雨中漂泊不定。\n" NOR;

        if (lvl / 2 + random(lvl) > target->query_skill("parry") * 2 / 3)
        {
                msg += HIY "这阵刀势变化莫测，$n" HIY "顿时觉得眼花缭乱，无法抵挡。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "$n" HIC "不禁心中凛然，不敢有半点小觑，使出浑身解数抵挡。\n" NOR;
                count = 0;
        }

	message_combatd(msg, me, target);
	me->add("neili", -120);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));
        me->add_temp("apply/attack", -count);

	return 1;
}
