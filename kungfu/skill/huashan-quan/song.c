// modify by rcwiz 2003

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define SONG "「" HIG "苍松式" NOR "」"

int perform(object me, object target)
{
//	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/huashan-quan/song"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(SONG "只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("huashan-quan", 1) < 40)
		return notify_fail("你的华山拳法不够娴熟，无法施展" SONG "。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你现在真气不够，无法施展" SONG "。\n");

        if (me->query_skill_prepared("cuff") != "huashan-quan")
                return notify_fail("你没有准备使用劈石破玉拳，无法施展" SONG "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "怒喝一声，右拳直出，刚猛有力，正是华山绝技「" HIG "苍松式" HIY
               "」，拳风呼响，袭向$n" HIY "。\n"NOR;

        ap = me->query_skill("cuff") + me->query_str() * 10;
        dp = target->query_skill("force") + target->query_str() * 10;
	if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 3 + random(ap / 3);

                me->add("neili", -60);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
		                           HIR "只见$P" HIR "一拳直出，$p" HIR
                                           "正欲挡格，却已不及，一拳重重地打在身上！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += HIC "可是$p" HIC "奋力招架，硬生生的挡开了$P"
                       HIC "这一招。\n"NOR;
		me->add("neili", -50);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}