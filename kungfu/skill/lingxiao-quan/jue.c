#include <ansi.h>
#include <combat.h>

#define JUE "「" HIW "凌宵总诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/lingxiao-quan/jue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUE "只能对战斗中的对手使用。\n");

        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail("只有空手才能施展" JUE "。\n");

        if ((int)me->query_skill("lingxiao-quan", 1) < 60)
                return notify_fail("你的凌霄拳法不够娴熟，难以施展" JUE "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功修为不够，难以施展" JUE "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不够，难以施展" JUE "。\n");

        if (me->query_skill_mapped("cuff") != "lingxiao-quan") 
                return notify_fail("你没有激发凌霄拳法，难以施展" JUE "。\n");

        if (me->query_skill_prepared("cuff") != "lingxiao-quan")
                return notify_fail("你现在没有准备使用凌霄拳法，难以施展" JUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "只听$N" HIW "一声断喝，双拳聚力齐发，一式「凌霄总决」携"
              "着风雷之势轰向$n" HIW "！\n" NOR;

        if (random(me->query_skill("cuff")) > target->query_skill("dodge") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("cuff");
                damage = damage / 2 + random(damage / 2);
                me->add("neili", -50);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "结果$p" HIR "闪避不及，被$P" HIR
                                           "一拳正中面门，顿时口喷鲜血，几乎昏厥"
                                           "！\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -30);
                msg += CYN "可是$p" CYN "识破了$P"
                       CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
