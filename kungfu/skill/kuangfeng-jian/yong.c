#include <ansi.h>
#include <combat.h>

#define YONG "「" HIW "风起云涌" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;
 
        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/kuangfeng-jian/yong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(YONG "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" YONG "。\n");

        if (me->query_skill("dodge", 1) < 140)
                return notify_fail("你的基本轻功的修为不够，难以施展" YONG "。\n");

        if (me->query_skill("kuangfeng-jian", 1) < 140)
                return notify_fail("你的狂风快剑修为不够，难以施展" YONG "。\n");

        if (me->query_skill_mapped("sword") != "kuangfeng-jian")
                return notify_fail("你没有激发狂风快剑，难以施展" YONG "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你现在真气不够，难以施展" YONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "凝神聚气，运转手中" + weapon->name() + HIW "，刹那间犹如"
              "狂风骤起，风声萧萧，" + weapon->name() + HIW "猛地卷向$n" HIW "。\n" NOR;

        ap = me->query_skill("sword") + me->query_skill("dodge");
        dp = target->query_skill("parry") + target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                me->add("neili", - 230);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 65 + random(6),
                                           HIR "$n" HIR "看得目瞪口呆，只觉一阵狂风吹过，" + weapon->name() + HIR 
                                           "却已透胸而过。\n" NOR);
        } else
        {
                me->add("neili", -120);
                me->start_busy(2);
                msg += CYN "可是$n" CYN "微微一笑，轻轻格躲开了$N"
                       CYN "的剑招。\n"NOR;
        }

        message_combatd(msg, me, target);

        return 1;
}
