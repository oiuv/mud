// zhang.c 九阴神掌

#include <ansi.h>

inherit F_SSERVER;

#define ZHANG "「" HIM "九阴神掌" NOR "」"

int perform(object me, object target)
{
	string msg;
  int ap, dp;
  int i, count;

  if (userp(me) && ! me->query("can_perform/jiuyin-shengong/zhang"))
          return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(ZHANG "只能对战斗中的对手使用。\n");

  if (me->query_temp("weapon"))
          return notify_fail("此招只能空手施展！\n");

	if ((int)me->query_skill("jiuyin-shengong", 1) < 260)
		return notify_fail("你的九阴神功不够深厚，不会使用" ZHANG "。\n");

	if ((int)me->query_skill("strike", 1) < 220)
		return notify_fail("你的基本掌法修为不够，不会使用" ZHANG "。\n");

  if (me->query_skill_prepared("unarmed") != "jiuyin-shengong"
     && me->query_skill_prepared("strike") != "jiuyin-shengong")
          return notify_fail("你没有准备使用九阴神功，无法施展" ZHANG "。\n");

  if (! living(target))
        return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "双掌一错，幻化出无数掌影，层层叠荡向$n"
        HIY "逼去！\n" NOR;
	message_combatd(msg, me, target);	//修正pfm描述信息显示时间错误 by MK

  ap = me->query_skill("jiujin-shengong", 1);
  dp = target->query_skill("parry", 1);

  if (ap / 2 + random(ap) > dp)
         // count = ap / 7;
          count = ap / 5;

  else count = 9;

  me->add_temp("apply/attack", count);
  for (i = 0; i < 9; i++)
  {
          if (! me->is_fighting(target))
                  break;

          if (random(2) == 1 && ! target->is_busy())
                  target->start_busy(1);

          COMBAT_D->do_attack(me, target, 0, );
  }
  me->start_busy(2 + random(4));
  me->add("neili", -320);

  me->add_temp("apply/attack", -count);

	return 1;
}
