#include <ansi.h>
#include <combat.h>

#define FEI "「" HIY "龙飞势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        object weapon;
        int ap, dp, wn;

        if (userp(me) && ! me->query("can_perform/feilong-zhang/fei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FEI "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你所使用的武器不对，难以施展" FEI "。\n");

        if ((int)me->query_skill("feilong-zhang", 1) < 160)
                return notify_fail("你飞龙杖法不够娴熟，难以施展" FEI "。\n");

        if (me->query_skill_mapped("staff") != "feilong-zhang")
                return notify_fail("你没有激发飞龙杖法，难以施展" FEI "。\n");

        if ((int)me->query_skill("force") < 240)
                return notify_fail("你的内功火候不够，难以施展" FEI "。\n");

        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力修为不够，难以施展" FEI "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" FEI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();

        msg = HIW "$N" HIW "嗔目大喝，将全身劲力运于右臂，掌中" + wn +
              HIW "顿时离手射出，朝$n" HIW "飞去！\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                damage += random(damage);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 55,
                                           HIR "$n" HIR "只觉一股劲风袭到，闪避"
                                           "不及，那根" + wn + HIR "正好击中胸口"
                                           "，撞断数根肋骨。\n" NOR);
                me->start_busy(3);
                me->add("neili", -300);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "气势如虹，不敢硬"
                       "接，当即向后横移数尺，躲闪开来。\n" NOR;
                me->start_busy(4);
                me->add("neili", -200);
        }

        msg += HIY "只见那根" + wn + HIY "余势不尽，又向前飞出数"
               "丈，方才没入土中。\n" NOR;
        weapon->move(environment(me));

        message_combatd(msg, me, target);
        return 1;
}
