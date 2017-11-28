#include <ansi.h>
#include <combat.h>

#define JUAN "「" HIW "寒芒暴卷" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/shangjia-dao/juan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUAN "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" JUAN "。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，难以施展" JUAN "。\n");

        if ((int)me->query_skill("shangjia-dao", 1) < 50)
                return notify_fail("你的商家刀法还不到家，难以施展" JUAN "。\n");

        if (me->query_skill_mapped("blade") != "shangjia-dao")
                return notify_fail("你没有激发商家刀法，难以施展" JUAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的真气不够，难以施展" JUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "手中" + weapon->name() +  HIW "吞吐不定，刀势连环起"
              "伏，顿时叠起重重刀芒裹向$n" HIW "全身！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 3 + random(ap / 2);
                me->add("neili", -80);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 35,
                                           HIR "$n" HIR "只觉得无数刀光携着寒芒向"
                                           "自己涌来，一时躲闪不及，连中数刀！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可$p" CYN "身子一偏，向后横移数尺，躲开了$P"
                       CYN "的攻势。\n" NOR;
                me->add("neili", -30);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
