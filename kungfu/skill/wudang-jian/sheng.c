#include <ansi.h>
#include <combat.h>

#define SHENG "「" HIW "太极初升" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/wudang-jian/sheng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(SHENG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" SHENG "。\n");

        if (me->query_skill("force") < 80)
                return notify_fail("你的内功的修为不够，难以施展" SHENG "。\n");

        if (me->query_skill("wudang-jian", 1) < 60)
                return notify_fail("你的武当剑法修为不够，难以施展" SHENG "。\n");

        if (me->query_skill_mapped("sword") != "wudang-jian")
                return notify_fail("你没有激发武当剑法，难以施展" SHENG "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你现在真气不够，难以施展" SHENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "凝神聚气，手中" + weapon->name() +
              HIW "回转，划出一个闪亮的剑圈，套向$n" HIW "而去。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 3 + random(ap / 2);
                me->add("neili", -30);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 10,
                                           HIR "$n" HIR "不明剑理，一个不慎，登时被$N"
                                           HIR "划中，鲜血直流！\n" NOR);
        } else
        {
                me->add("neili", -20);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "微微一笑，轻轻格挡开了$P"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
