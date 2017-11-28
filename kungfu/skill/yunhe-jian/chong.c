#include <ansi.h>
#include <combat.h>

#define CHONG "「" HIM "鹤冲九霄" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (userp(me) && ! me->query("can_perform/yunhe-jian/chong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHONG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CHONG "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" CHONG "。\n");

        if (me->query_skill("yunhe-jian", 1) < 100)
                return notify_fail("你的云鹤七剑修为不够，难以施展" CHONG "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你的真气不够，难以施展" CHONG "。\n");

        if (me->query_skill_mapped("sword") != "yunhe-jian")
                return notify_fail("你没有激发云鹤七剑，难以施展" CHONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIM "$N" HIM "陡然一声长啸，手中" + weapon->name() +
              HIM "疾射而出，勾勒出一道绚丽的剑芒，直划$n" HIM "前胸！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = 50 + ap / 2 + random(ap / 2);
                me->add("neili", -80);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 25,
                                           HIR "$n" HIR "奋力格挡，终究不敌，被$N"
                                           HIR "一剑刺中胸口，鲜血飞溅而出！\n" NOR);
        } else
        {
                me->add("neili", -60);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "并不慌乱，收敛心神，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
