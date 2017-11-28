#include <ansi.h>
#include <combat.h>

#define YING "「" HIC "刀影重重" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/hanwang-qingdao/ying"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(YING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" YING "。\n");

        if (me->query_skill("force") < 120)
                return notify_fail("你的内功的修为不够，难以施展" YING "。\n");

        if (me->query_skill("hanwang-qingdao", 1) < 80)
                return notify_fail("你的韩王青刀修为不够，难以施展" YING "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你目前的内力不足，难以施展" YING "。\n");

        if (me->query_skill_mapped("blade") != "hanwang-qingdao")
                return notify_fail("你没有激发韩王青刀，难以施展" YING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "霎时只见$N" HIC "手中" + weapon->name() +
              HIC "一振，顿时幻出重重刀影，将$n" HIC "团团裹住！\n" NOR;

        ap = me->query_skill("blade");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 3);
                me->start_busy(1);
                me->add("neili", -80);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "只听$p" HIR "一声惨嚎，一股血柱自" HIR
                                           "血色刀影中激射而出！\n" NOR);
        } else
        {
                me->add("neili", -40);
                me->start_busy(3);
                msg += CYN "可是$n" CYN "淡淡一笑，浑然不将$N"
                       CYN "重重刀影放在眼中，随意将之架开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}