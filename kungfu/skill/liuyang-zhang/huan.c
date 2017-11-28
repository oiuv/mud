#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIR "寰阳式" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/liuyang-zhang/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HUAN "只能空手施展。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，难以施展" HUAN "。\n");

        if ((int)me->query_skill("liuyang-zhang", 1) < 130)
                return notify_fail("你的天山六阳掌不够娴熟，难以施展" HUAN "。\n");

        if (me->query_skill_mapped("strike") != "liuyang-zhang")
                return notify_fail("你没有激发天山六阳掌，难以施展" HUAN "。\n");

        if (me->query_skill_prepared("strike") != "liuyang-zhang")
                return notify_fail("你没有准备使用天山六阳掌，难以施展" HUAN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "双掌一振，施出天山六阳掌「寰阳式」，幻出"
              "满天掌影，团团罩住$n" HIR "。\n" NOR;

	me->add("neili", -50);
        ap = me->query_skill("force");
        dp = target->query_skill("force");
        if (ap / 2 + random(ap) > dp)
	{
		damage = me->query_skill("strike") + ap - dp;
                damage += random(damage * 2 / 5);
		me->add("neili", -100);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 40,
                                           HIR "$n" HIR "见躲闪不得，只能硬挡下一"
                                           "招，顿时被$P" HIR "震得连退数步，吐血"
                                           "不止！\n" NOR);
		me->start_busy(3);
	} else
	{
		msg += HIC "可是$p" HIC "强运内力，硬生生的挡住$P"
                       HIC "这一掌，没有受到任何伤害。\n"NOR;
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}