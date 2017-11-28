#include <ansi.h>
#include <combat.h>

#define BAI "「" HIY "朝拜天罡" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int ap, dp, damage;
        string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/tiangang-chenfa/bai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BAI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" BAI "。\n");

        if ((int)me->query_skill("tiangang-chenfa", 1) < 120)
                return notify_fail("你天罡尘法不够娴熟，难以施展" BAI "。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力修为不足，难以施展" BAI "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在真气不够，难以施展" BAI "。\n");

        if (me->query_skill_mapped("whip") != "tiangang-chenfa")
                return notify_fail("你没有激发天罡尘法，难以施展" BAI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "但见$N" HIY "手中" + weapon->query("name") + HIY "窜动不"
              "已，接连变幻了数种招式，分袭$n" HIY "各处要害。\n";

        ap = me->query_skill("whip");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                me->start_busy(2);
                damage = ap * 4 / 3;
                damage = damage / 2 + random(damage * 2 / 3);

                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,
                                           HIR "$n" HIR "急忙躲闪，却发现$N" HIR
                                           "的" + weapon->name() + HIR "已然拂中"
                                           "胸前要穴，顿感气血上涌，难受之极。\n" NOR);
                me->add("neili", -180);
        } else
        {
                me->start_busy(3);
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "招中虚实，当即纵身而起，躲避开来。\n" NOR;
        }
        message_combatd(msg, me, target);
        return 1;
}
