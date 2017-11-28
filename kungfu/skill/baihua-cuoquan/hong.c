#include <ansi.h>
#include <combat.h>

#define HONG "「" HIY "战神轰天诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int ap, dp, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/baihua-cuoquan/hong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HONG "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HONG "只能空手施展。\n");

        if ((int)me->query_skill("baihua-cuoquan", 1) < 250)
                return notify_fail("你的百花错拳不够娴熟，难以施展" HONG "。\n");

        if ((int)me->query_skill("zhanshen-xinjing", 1) < 250)
                return notify_fail("你的战神心经修为不够，难以施展" HONG "。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，难以施展" HONG "。\n");

        if (me->query_skill_mapped("unarmed") != "baihua-cuoquan")
                return notify_fail("你没有激发百花错拳，难以施展" HONG "。\n");

        if (me->query_skill_mapped("force") != "zhanshen-xinjing")
                return notify_fail("你没有激发战神心经，难以施展" HONG "。\n");

        if (me->query_skill_prepared("unarmed") != "baihua-cuoquan")
                return notify_fail("你没有准备百花错拳，难以施展" HONG "。\n");

        if (me->query("neili") < 800)
                return notify_fail("你的真气不够，难以施展" HONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "一声怒嚎，将战神心经提运极至，双拳顿时携着"
              "雷霆万钧之势猛贯向$n" HIW "。\n" NOR;

        ap = me->query_skill("unarmed") +
             me->query_skill("force");

        dp = target->query_skill("parry") +
             target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = 0;
                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                	me->start_busy(2);
                        me->add("neili", -100);
                        msg += HIR "只见$N" HIR "一拳轰至，便将$n" HIR "震得"
                               "心脉俱碎，仰天喷出一口鲜血，软软瘫倒。\n" NOR
                               "( $n" RED "受伤过重，已经有如风中残烛，随时都"
                               "可能断气。" NOR ")\n";
                        damage = -1;
                } else
		{
                	me->start_busy(4);
                	me->add("neili", -600);
                	damage = ap * 2 / 3 + random(ap);
                	msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 150,
                        	                   HIR "结果$p" HIR "闪避不及，$P" HIR "的"
                                                   "拳力掌劲顿时透体而入，口中鲜血狂喷，连"
                                                   "退数步。\n" NOR);
		}
        } else
        {
                me->start_busy(5);
                me->add("neili", -300);
                msg += CYN "可是$p" CYN "识破了$P"
                       CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        if (damage < 0)
                target->die(me);

        return 1;
}