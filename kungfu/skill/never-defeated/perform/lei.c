// lei.c 天打雷劈

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
	string msg;
        int ap, dp;
 
	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
	        return notify_fail("天打雷劈只能在战斗中对对手使用。\n");

	if (me->query_skill("never-defeated", 1) < 150)
		return notify_fail("你的不败神功还不够娴熟，不能使用天打雷劈！\n");

        if (! objectp(weapon = me->query_temp("weapon")))
                return notify_fail("你必须手持兵刃才能施展天打雷劈！\n");

	if (me->query("neili") < 300)
		return notify_fail("你的真气不够！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "大喝一声，手中的" + weapon->name() +
              HIC "长劈而下，看似简单，竟然封住了$n"
              HIC "所有的退路！\n" NOR;

        ap = me->query_skill("never-defeated", 1);
        dp = target->query("combat_exp") / 10000;
	me->add("neili", -60);
	me->start_busy(1 + random(2));

	me->want_kill(target);
        if (dp >= 100)
        {
                msg += HIY "$n" HIY "使出平生所学，奋力化解，没出一点差错。\n" NOR;
        } else
        if (random(ap) > dp)
        {
                msg += HIR "$n" HIR "平生何曾见过这样的招数，全然无法化解，"
                       HIR "顿时被击中数处要害，颓然倒地！\n" NOR;
                message_combatd(msg, me, target);
                target->die(me);
                return 1;
        } else
        {
                msg += HIM "$n" HIM "大吃一惊，连忙胡乱抵挡，居"
                      "然没有一点伤害，侥幸得脱！\n" NOR;
        }

        message_combatd(msg, me, target);

	return 1;
}
