// qianye.c 千叶佛手

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me)
{
	string msg;
	object target;
	int skill, ap, dp, damage;

  if (! target)
  {
    me->clean_up_enemy();
    target = me->select_opponent();
  }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「千叶佛手」只能在战斗中对对手使用。\n");

	skill = me->query_skill("qianye-shou", 1);

	if (skill < 120)
		return notify_fail("你的千叶手等级不够，不会使用「千叶佛手」！\n");

	if (me->query("neili") < 100)
		return notify_fail("你的真气不够，无法运用「千叶佛手」！\n");

	if (me->query_skill_mapped("hand") != "qianye-shou")
		return notify_fail("你没有激发千叶手，无法使用「千叶佛手」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "倏的靠近$n" HIC "，伸手一晃，"
	      "化出无数掌影，如同你有千百只手一齐攻向" HIC
              "$n！\n" NOR;

	ap = me->query_skill("force") + me->query_skill("hand");
	dp = target->query_skill("parry") + target->query_skill("dodge");
	if (ap / 2 + random(ap) > dp)
	{
		me->add("neili", -100);
		damage = 40 + ap / 10 + random(ap / 10);
		msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 35,
                                           HIR "$p" HIR "既不能招架，又无法躲避，结果被$P"
                                           HIR "连击带打，弄的晕头转向，身上也是伤痕累累。\n" NOR);
		me->start_busy(1);
                if (ap / 3 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 50 + 2);
	} else
	{
		msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，连消带打，全然化解了$P"
                       CYN "的攻势。\n" NOR;
		me->add("neili",-30);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
