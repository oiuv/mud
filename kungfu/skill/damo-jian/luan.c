#include <ansi.h>
#include <combat.h>

#define LUAN "「" HIM "达摩乱气剑" NOR "」"

inherit F_SSERVER;

string final(object me, object target, int damage);

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/damo-jian/luan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LUAN "。\n");

	if ((int)me->query_skill("damo-jian", 1) < 200)
                return notify_fail("你达摩剑法不够娴熟，难以施展" LUAN "。\n");

        if (me->query_skill_mapped("sword") != "damo-jian")
                return notify_fail("你没有激发达摩剑法，难以施展" LUAN "。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为不够，难以施展" LUAN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" LUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "$N" HIM "回转剑锋，手中" + weapon->name() +
              HIM "紫光荡漾，如作龙吟，无形剑气笼罩$n"
              HIM "全身。\n" NOR;

        ap = me->query_skill("sword") + me->query_skill("force");
        dp = target->query_skill("force") * 2;

	if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
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

        target->affect_by("damo_luanqi",
                ([ "level"    : lvl + random(lvl),
                   "id"       : me->query("id"),
                   "duration" : lvl / 50 + random(lvl / 20) ]));

        return  HIR "霎时$n" HIR "心头一阵迷惑，体内的真气登时"
                "不听使唤，四处游走。\n" NOR;
}
