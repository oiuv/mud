#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIW "乱环诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/xuanxu-dao/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" HUAN "。\n");

        if (me->query_skill("force") < 120)
                return notify_fail("你的内功的修为不够，难以施展" HUAN "。\n");

        if (me->query_skill("xuanxu-dao", 1) < 80)
                return notify_fail("你的玄虚刀法修为不够，难以施展" HUAN "。\n");

        if (me->query_skill_mapped("blade") != "xuanxu-dao")
                return notify_fail("你没有激发玄虚刀法，难以施展" HUAN "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你现在真气不够，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "使出玄虚刀法中的绝技乱环决，刀出成环，环环相连，只"
              "绞的$n" HIW "眼前一片影环。\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -180);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "就听见“喀喀喀”几声脆响，$p" HIR "一声"
                                           "惨叫，全身各处骨头被刀环一一绞断，像滩软泥般"
                                           "塌了下去！\n" NOR );
        } else
        {
                me->add("neili", -60);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "奋力格挡，$P" CYN 
                       "只觉得精力略有衰竭，手中刀光渐缓。 \n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
