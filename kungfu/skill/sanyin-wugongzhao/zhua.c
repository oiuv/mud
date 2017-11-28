// zhua.c 三阴毒爪

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define ZHUA "「" HIG "三阴毒爪" NOR "」"

string final(object me, object target);

int perform(object me, object target)
{
//	object weapon;
	string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/sanyin-wugongzhao/zhua"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(ZHUA "只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("sanyin-wugongzhao", 1) < 80)
		return notify_fail("你的三阴蜈蚣爪不够娴熟，无法使用" ZHUA "。\n");

        if (me->query_skill_mapped("claw") != "sanyin-wugongzhao")
                return notify_fail("你没有激发三阴蜈蚣爪，无法使用" ZHUA "。\n");

        if (me->query_skill_prepared("claw") != "sanyin-wugongzhao")
                return notify_fail("你没有准备使用三阴蜈蚣爪，无法使用" ZHUA "。\n");

        if (me->query("neili") < 150)
                return notify_fail("你真气不足，无法施展" ZHUA "。\n");
 
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "突然一声怪叫，蓦的面赤如血，随即手腕一抖，抓向$n"
              HIR "的要害。\n" NOR;

        ap = me->query_skill("claw");
        dp = target->query_skill("parry");
	if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                           (: final, me, target :));
                me->start_busy(2);
	} else
        {
		msg += HIR "不过$p" HIR "看破了$P" HIR "的招式，"
                       "凝神招架，挡住了$P" HIR "的毒招。\n" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}

string final(object me, object target)
{
        int lvl;

        lvl = me->query_skill("claw");
        target->affect_by("sanyin",
                       ([ "level" : me->query("jiali") + random(me->query("jiali")),
                          "id"    : me->query("id"),
                          "duration" : lvl / 40 + random(lvl / 40) ]));

        return HIR "$p" HIR "惊慌失措，连忙后退，然而没"
               "能避开，被$P" HIR "这一爪抓得鲜血淋漓！\n" NOR;
}