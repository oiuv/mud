#include <ansi.h>
#include <combat.h>

#define JING "「" HIY "皓月惊空 " NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int ap, dp, wn;

        if (userp(me) && ! me->query("can_perform/guyue-chan/jing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JING "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你所使用的武器不对，难以施展" JING "。\n");

        if ((int)me->query_skill("guyue-chan", 1) < 80)
                return notify_fail("你孤月铲法不够娴熟，难以施展" JING "。\n");

        if (me->query_skill_mapped("staff") != "guyue-chan")
                return notify_fail("你没有激发孤月铲法，难以施展" JING "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，难以施展" JING "。\n");

        if ((int)me->query("max_neili") < 600)
                return notify_fail("你的内力修为不够，难以施展" JING "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不足，难以施展" JING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

        msg = HIW "$N" HIW "怒喝一声，将手中的" + wn + HIW "挥舞得呼呼做响，"
              "猛然间向$n" HIW "砸去。\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                damage += random(damage / 3);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
                                           HIR "$n" HIR "只觉眼花缭乱，想闪避已不及，"
                                           "被" + wn + HIR "打中胸口，顿时喷出一口鲜"
                                           "血。\n" NOR);
                me->start_busy(3);
                me->add("neili", -80);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这招刚猛无比，不敢硬接，只得\n" 
                       "侧身一跳才躲过这招。\n"NOR;
                me->start_busy(4);
                me->add("neili", -200);
        }

        message_combatd(msg, me, target);
        return 1;
}
