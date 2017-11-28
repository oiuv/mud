#include <ansi.h>
#include <combat.h>

#define ZHE "「" HIR "达摩折元剑" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/damo-jian/zhe"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHE "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" ZHE "。\n");

	if ((int)me->query_skill("damo-jian", 1) < 200)
                return notify_fail("你达摩剑法不够娴熟，难以施展" ZHE "。\n");

        if (me->query_skill_mapped("sword") != "damo-jian")
                return notify_fail("你没有激发达摩剑法，难以施展" ZHE "。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为不够，难以施展" ZHE "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" ZHE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "蓦地将" + weapon->name() +
              HIR "往前一送，顿时一道光华自剑上亮起，直逼$n"
              HIR "丹田而去。\n" NOR;

        ap = me->query_skill("sword") + me->query_skill("force");
        dp = target->query_skill("force") * 2;

	if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           (: final, me, target, damage :));
                me->start_busy(2);
                me->add("neili", -200);
	} else
        {
		msg += CYN "可是$n" CYN "内力深厚，使得$P"
                       CYN "这一招没有起到任何作用。\n" NOR;
		me->start_busy(4);
                me->add("neili", -100);
	}
	message_combatd(msg, me, target);

	return 1;
}

string final(object me, object target, int damage)
{
        int lvl = me->query_skill("damo-jian", 1);

        target->affect_by("damo_zheyuan",
                ([ "level"    : lvl + random(lvl),
                   "id"       : me->query("id"),
                   "duration" : lvl / 50 + random(lvl / 20) ]));

        target->receive_damage("jing", damage / 3, me);
        target->receive_wound("jing", damage / 6, me);

        return HIR "突然$n" HIR "只觉丹田忽然一热，随即变得冷"
               "冰冰，不禁大惊失色。\n" NOR;
}
