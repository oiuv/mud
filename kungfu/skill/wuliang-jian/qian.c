// qian.c

#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIR "乾坤无量" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/wuliang-jian/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" QIAN "。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" QIAN "。\n");

        if (me->query_skill("wuliang-jian", 1) < 100)
                return notify_fail("你的无量剑法修为不够，难以施展" QIAN "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" QIAN "。\n");

        if (me->query_skill_mapped("sword") != "wuliang-jian")
                return notify_fail("你没有激发无量剑法，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "只见$N" HIR "手中" + weapon->name() + HIR "“唰"
              "唰唰唰”连攻四剑，剑招去势极快，全然笼罩$n" HIR "！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap / 2 + random(ap / 2);
                me->add("neili", -150);
                me->start_busy(2);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 60,
                                           HIR "结果$n" HIR "阻挡不及，顿时被$N"
                                           HIR "斩中数剑，伤口见骨，苦不堪言。\n"
                                           NOR);
        } else
        {
                me->add("neili", -50);
                me->start_busy(3);
                msg += CYN "可却见" CYN "$n" CYN "猛的拔地而起，避开了"
                       CYN "$N" CYN "的剑招。\n"NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
