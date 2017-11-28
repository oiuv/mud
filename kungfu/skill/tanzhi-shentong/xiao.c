#include <ansi.h>
#include <combat.h>

#define XIAO "「" HIG "啸沧海" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int ap, dp, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/tanzhi-shentong/xiao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(XIAO "只能空手施展。\n");

        if ((int)me->query_skill("tanzhi-shentong", 1) < 200)
                return notify_fail("你的弹指神通不够娴熟，难以施展" XIAO "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 200)
                return notify_fail("你对经络学的了解不够，难以施展" XIAO "。\n");
 
        if (me->query_skill_mapped("finger") != "tanzhi-shentong")
                return notify_fail("你没有激发弹指神通，难以施展" XIAO "。\n");

        if (me->query_skill_prepared("finger") != "tanzhi-shentong")
                return notify_fail("你没有准备弹指神通，难以施展" XIAO "。\n");

        if (me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，难以施展" XIAO "。\n");

        if (me->query("neili") < 800)
                return notify_fail("你现在的真气不够，难以施展" XIAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "突然间$N" HIG "指锋一转，力聚指尖“嗤”的弹出一道紫芒，直袭$n"
              HIG "气海大穴。\n" NOR;

        ap = me->query_skill("finger");
        dp = target->query_skill("force");

        damage = ap;
        damage += random(damage);

        if (ap / 2 + random(ap) > dp)
        {
                target->receive_damage("jing", damage * 4 / 3, me);
                target->receive_wound("jing", damage / 3, me);
		target->add("neili", -damage * 3);

	        if (target->query("neili") < 0)
                        target->set("neili", 0);

                msg += HIR "$n" HIR "只觉$N" HIR "指风袭体，随即上体一"
                       "阵冰凉，顿感真气涣散几欲晕厥。\n" NOR;
                me->start_busy(3);
        } else
        {
                msg += CYN "可是$p" CYN "防守严密，紧守门户，顿时令$P"
                       CYN "的攻势化为乌有。\n" NOR;
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        return 1;
}