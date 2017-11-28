#include <ansi.h>
#include <combat.h>

#define LENG "「" HIW "冷剑决" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (userp(me) && ! me->query("can_perform/hanmei-jian/leng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" LENG "。\n");

        if (me->query_skill("force") < 50)
                return notify_fail("你的内功的修为不够，难以施展" LENG "。\n");

        if (me->query_skill("hanmei-jian", 1) < 40)
                return notify_fail("你的寒梅剑法修为不够，难以施展" LENG "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你的真气不够，难以施展" LENG "。\n");

        if (me->query_skill_mapped("sword") != "hanmei-jian")
                return notify_fail("你没有激发寒梅剑法，难以施展" LENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "轻吁一声，飞身一跃而起，手中" + weapon->name() +
              HIW "携着阴寒之劲刺向$n" HIW "！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 3);
                me->add("neili", -30);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,
                                           HIR "结果$n" HIR "一个不慎，顿被$N" HIR
                                           "一剑划出道寸许长的伤口！\n" NOR);
        } else
        {
                me->add("neili", -10);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "并不慌乱，收敛心神，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
