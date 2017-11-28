#include <ansi.h>
#include <combat.h>

#define YIN "「" HIR "神卦天印" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/bazhen-zhang/yin"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(YIN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(YIN "只能空手施展。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" YIN "。\n");

        if ((int)me->query_skill("bazhen-zhang", 1) < 130)
                return notify_fail("你的八阵八卦掌不够娴熟，难以施展" YIN "。\n");

        if (me->query_skill_mapped("strike") != "bazhen-zhang") 
                return notify_fail("你没有激发八阵八卦掌，难以施展" YIN "。\n");

        if (me->query_skill_prepared("strike") != "bazhen-zhang") 
                return notify_fail("你没有准备八阵八卦掌，难以施展" YIN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在真气不够，难以施展" YIN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "凝神沉履，积聚全身功力于一掌，携着雷霆之势奋力向$n"
              HIR "胸前拍落。\n" NOR;

        if (random(me->query_skill("strike")) > target->query_skill("parry") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("strike");
                damage = damage / 2 + random(damage);
                me->add("neili", -250);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                           HIR "结果$p" HIR "招架不及，被$P" HIR
                                           "一掌印在胸口，接连断了数根肋骨，喷出"
                                           "一大口鲜血！\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -100);
                msg += CYN "可是$p" CYN "奋力招架，不露半点破绽，将$P"
                       CYN "这一招驱之于无形。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
