// huanyin.c 幻阴神指

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
        int lvl;
        int damage;

	if (! target) target = offensive_target(me);

	if (environment(me)->query("no_fight"))
		return notify_fail("这里不能攻击别人! \n");

	if (! target || ! target->is_character())
		return notify_fail("幻阴神指只能对对手使用。\n");

	if (target->query("not_living"))
		return notify_fail("看清楚，那不是活人。\n");

	if ((int)me->query_skill("force") < 300)
		return notify_fail("你的内功火候不足以施展幻阴神指。\n");

	if ((int)me->query_skill("huanyin-zhi", 1) < 150)
		return notify_fail("你的幻阴指法修为不够，现在还无法施展幻阴神指。\n");

        if (me->query_skill_mapped("finger") != "huanyin-zhi")
                return notify_fail("你没有激发幻阴指法，无法施展幻阴神指。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，现在无法施展幻阴神指。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "$N" HIG "深深的吸了一口气，缓缓的刺"
              "出一指，挟带一股寒气逼向$n" HIG "。\n" NOR;

        lvl = (int)me->query_skill("finger", 1) / 2 +
              (int)me->query_skill("huanyin-zhi", 1);
	if (lvl / 2 + random(lvl) > target->query_skill("force"))
        {
                damage = lvl + random(lvl / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 40,
                                           HIG "$p" HIG "急忙后退，然而这指何等玄妙，正"
                                           "好点中$p" HIG "胸前，$p" HIG "不禁打了一个冷"
                                           "战。\n" NOR);
                target->affect_by("huanyin_poison",
                                  ([ "level" : lvl / 2 + random(lvl / 2),
                                     "id"    : me->query("id"),
                                     "duration" : lvl / 40 + random(lvl / 18) ]));
                me->add("neili", -320);
	        me->start_busy(2);
	} else
        {
		msg += CYN "可是$p" CYN "运足内力，以深厚的内功"
                       "化解了这一指的阴寒内力。\n" NOR;
		me->start_busy(4);
                me->add("neili", -80);
	}
	message_combatd(msg, me, target);
        me->want_kill(target);
        if (! target->is_killing(me)) target->kill_ob(me);
	return 1;
}
