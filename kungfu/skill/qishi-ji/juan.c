#include <ansi.h>
#include <combat.h>

#define JUAN "「" HIY "旋转卷刺" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/qishi-ji/juan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "club")
                return notify_fail("你所使用的武器不对，难以施展" JUAN "。\n");

        if (me->query_skill("qishi-ji", 1) < 100)
                return notify_fail("你圣骑士戟修为不够，难以施展" JUAN "。\n");

        if (me->query_skill_mapped("club") != "qishi-ji")
                return notify_fail("你没有激发圣骑士戟，难以施展" JUAN "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" JUAN "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" JUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "连退数步，手中" + weapon->name() + HIY "急速旋"
              "转，戟尖顿时激起一股气流，直刺$n" HIY "而去！\n" NOR;

        ap = me->query_skill("club");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap);
                me->add("neili", -50);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 90,
                                           HIR "结果$n" HIR "躲闪不慎，被$N" HIR
                                           "的" + weapon->name() + HIR "戟尖刺中"
                                           "要害，登时鲜血飞溅！\n" NOR);
        } else
        {
                me->add("neili", -30);
                me->start_busy(3);
                msg += CYN "可是$p" CYN "并不慌乱，收敛心神，闪避开了$P"
                       CYN "的疾刺攻击。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

