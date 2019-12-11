// 弹射毒药

#include <ansi.h>

inherit F_SSERVER;

int exert(object me, object target)
{
	object du;
	// int damage;
  int ap;
	string msg;

  if (environment(me)->query("no_fight"))
          return notify_fail("这里不能战斗，你不可以使用毒技伤人。\n");

  if (! target || me == target)
          return notify_fail("你想攻击谁？\n");

	if (target->query_competitor())
		return notify_fail("比武的时候最好是正大光明的较量。\n");

	if ((int)me->query_skill("poison", 1) < 80)
		return notify_fail("你的基本毒技火候不够。\n");

	if ((int)me->query_skill("hamagong", 1) < 100)
		return notify_fail("你的内功火候不够。\n");

	if ((int)me->query("neili") < 500)
		return notify_fail("你现在内力不足，不能弹射毒药。\n");

  if (! objectp(du = me->query_temp("handing")))
          return notify_fail("你得先准备(hand)好毒药再说。\n");

  if (! mapp(du->query("poison")))
          return notify_fail(du->name() + "又不是毒药，你乱弹什么？\n");

  if (! living(target))
        return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = CYN "$N" CYN "运转内力，轻轻悬起一些" + du->name() +
              CYN "对准$n" CYN "弹了过去。\n" NOR;
        me->start_busy(2 + random(2));
        me->add("neili", -200);

        if (me->query("neili") / 2 + random(me->query("neili")) <
            target->query("neili"))
        {
                msg += WHT "然而$n轻轻一抖，将$N射过来的" + du->name() +
                       WHT "悉数震开。\n" NOR;
        } else
        {
                ap = me->query_skill("poison", 1) / 2 +
                     me->query_skill("force");
                if (ap / 2 + random(ap) < target->query_skill("dodge") * 3 / 2)
                {
                        msg += WHT "$n见势不妙，急忙腾挪身形，避开了$N的攻击。\n" NOR;
                } else
                {
                        msg += GRN "$n连忙躲闪，结果仍然觉得微微一阵酸麻。\n" NOR;
                        target->affect_by(du->query("poison_type"), du->query("poison"));
                }
        }

        destruct(du);
	message_combatd(msg, me, target);
        me->want_kill(target);
        if (! target->is_killing(me)) target->kill_ob(me);

	return 1;
}
