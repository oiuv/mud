// 伤字诀

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define PO "「" HIR "魂魄飞扬" NOR "」"

int perform(object me, object target)
{
	// object weapon;
	int damage;
	string msg;
  int ap, dp;

  if (! target)
  {
    me->clean_up_enemy();
    target = me->select_opponent();
  }

  if (userp(me) && ! me->query("can_perform/qishang-quan/fei"))
          return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(PO "只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("qishang-quan", 1) < 160)
		return notify_fail("你的七伤拳不够娴熟，无法施展" PO "。\n");

	if ((int)me->query_skill("force", 1) < 160)
		return notify_fail("你的内功修为还不够，无法施展" PO "\n");

        if (me->query("max_neili") < 2200)
                return notify_fail("你内力修为不足，无法施展" PO "\n");

	if ((int)me->query("neili") < 350)
		return notify_fail("你现在真气不够，无法施展" PO "。\n");

        if (me->query_skill_prepared("cuff") != "qishang-quan")
                return notify_fail("你没有准备使用七伤拳，无法施展" PO "。\n");

        if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "\n$N" HIY "深吸一口起，将真气运于双拳之上，施出绝招「" HIR "魂魄飞扬" HIY
              "」，右拳平平一拳直出，但见普通一拳之中蕴涵了无穷的力量，拳未到风先至，猛然"
              "间袭向$n" HIY "。\n" NOR;

        ap = me->query_skill("cuff") + me->query_skill("force");
        dp = target->query_skill("force") + target->query_skill("parry");
	if (ap / 2 + random(ap) > dp)
	{
		damage = ap + random(ap / 2);

                me->add("neili", -320);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80,
		                           HIR "只听“砰”地一声，$N" HIR "一拳正好打中$n" HIR "胸"
                                           "口，$n" HIR "怪叫一声，吐出一口淤血！\n" NOR);
		me->start_busy(2);
	} else
	{
		msg += HIC "可是$p" HIC "奋力招架，硬生生的挡开了$P"
                       HIC "这一招。\n"NOR;
		me->add("neili", -180);
		me->start_busy(3);
	}
	message_sort(msg, me, target);

	return 1;
}
