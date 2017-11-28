// qiong 无穷无尽

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define QIONG "「" HIR "无穷无尽" NOR "」"
 
int perform(object me, object target)
{
	string msg;
        int ap, dp, ap1, dp1, damage;
        object weapon;

        if (userp(me) && ! me->query("can_perform/kuihua-mogong/qiong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
	        return notify_fail(QIONG "只能在战斗中对对手使用。\n");

	if (me->query_skill("kuihua-mogong", 1) < 250)
		return notify_fail("你的葵花魔功还不够娴熟，不能使用" QIONG "！\n");

        if ((int)me->query("max_neili") < 3800)
                return notify_fail("你的内力修为不足，难以施展" QIONG "。\n");

	if (me->query("neili") < 200)
		return notify_fail("你的真气不够，无法施展" QIONG "\n");

        if (weapon = me->query_temp("weapon"))
        {
                if (weapon->query("skill_type") != "sword" &&
                    weapon->query("skill_type") != "pin")
                        return notify_fail("你手里拿的不是剑，怎么施"
                                           "展" QIONG "？\n");
        } else
        {
                if (me->query_skill_prepared("unarmed") != "kuihua-mogong")
                        return notify_fail("你并没有准备使用葵"
                                           "花魔功，如何施展" QIONG "？\n");
        }
        if (weapon && me->query_skill_mapped("sword") != "kuihua-mogong")
                return notify_fail("你没有准备使用葵花魔功，难以施展" QIONG "。\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "kuihua-mogong")
                return notify_fail("你没有准备使用葵花魔功，难以施展" QIONG "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "\n$N" HIR "尖啸一声，猛然进步欺前，一招竟直袭$n" HIR "要害，速度之快，令"
              "人见所未见，闻所未闻。\n" NOR;

	me->want_kill(target);
        ap = me->query_skill("kuihua-mogong", 1);
        dp = target->query("combat_exp") / 10000;
	me->add("neili", -60);
	me->start_busy(1 + random(2));

        if (dp >= 100) // 对百万经验以上无效，但是仍然受到伤害
        {
                ap1 = me->query_skill("kuihua-mogong", 1) + me->query_skill("dodge", 1);
                dp1 = target->query_skill("dodge", 1) + target->query_skill("martial-cognize", 1);
                if (ap1 * 2 / 3 + random(ap1) > dp1)
                {
                     damage = ap / 2 + random(ap);
                     msg += COMBAT_D->do_damage(me, target, REMOTE_ATTACK, damage, 95 + random(5),
                                                HIR "这一招速度之快完全超出了$n" HIR "的想象，$n" HIR
                                                "慌忙回缩招架，但是此招之快，已无从躲闪，$n" HIR "尖叫"
                                                "一声，已然中招。\n" NOR);
                     me->add("neili", -80);
                }
                else
                {
                     msg += HIC "$n" HIC "知道来招不善，急忙闪避，没出一点差错。\n" NOR;
                }
                message_sort(msg, me, target);
                return 1;
        } else
        if (random(ap) > dp)
        {
                msg += HIR "这一招速度之快完全超出了$n" HIR "的想象，被$N"
                       HIR "这一招正好击中了丹田要害，浑身真气登时涣散！\n" NOR;
                message_combatd(msg, me, target);
                me->add("neili", -120);
                target->die(me);
                return 1;
        } else
        {
                msg += HIM "$n" HIM "大吃一惊，连忙退后，居然"
                      "侥幸躲开着这一招！\n" NOR;
        }

        message_combatd(msg, me, target);

	return 1;
}
