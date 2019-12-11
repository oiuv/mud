// 天地混元

#include <ansi.h>
#include <combat.h>

#define WU "「" HIW "天地混元" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
	// object weapon;
	int skill, ap, dp, damage;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/pili-shou/hun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! me->is_fighting(target))
		return notify_fail(WU "只能对战斗中的对手使用。\n");

	skill = me->query_skill("pili-shou", 1);

	if (skill < 140)
		return notify_fail("你的混元霹雳手等级不够, 不能施展" WU "！\n");

	if (me->query_skill("force", 1) < 160)
		return notify_fail("你内功修为不够，无法施展" WU "！\n");

	if (me->query("max_neili") < 2400)
		return notify_fail("你内力修为不足，无法施展" WU "！\n");

	if (me->query("neili") < 340)
		return notify_fail("你的内力不够，无法施展" WU "！\n");

        if (me->query_skill_prepared("hand") != "pili-shou")
                return notify_fail("你没有准备使用混元霹雳手，无法施展" WU "！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "怒喝一声，施出绝招「" HIW "天地混元" HIC "」，双掌交错"
              "袭向$n" HIC "，掌风凌厉，隐隐带有风雷之势。\n" NOR;

	ap = me->query_skill("hand") + me->query_skill("force");
	dp = target->query_skill("force") + target->query_skill("parry");
	if (ap / 2 + random(ap) > dp)
	{
		me->add("neili", -300);
		damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70,
                                           HIR "$n" HIR "只觉得胸前一阵剧痛，“哇”的一"
                                           "声喷出一口鲜血！\n" NOR);
		me->start_busy(1 + random(2));
	} else
	{
		me->add("neili", -200);
		msg += CYN "只见$n" CYN "不慌不忙，轻轻一闪，躲过"
                       "了$N" CYN "的必杀一击！\n" NOR;
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
