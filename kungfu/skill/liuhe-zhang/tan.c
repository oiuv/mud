#include <ansi.h>
#include <combat.h>

#define TAN "「" HIC "乌龙探海" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/liuhe-zhang/tan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(TAN "只能空手施展。\n");

        if ((int)me->query_skill("liuhe-zhang", 1) < 60)
                return notify_fail("你的六合掌法不够娴熟，难以施展" TAN "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功修为不够，难以施展" TAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不够，难以施展" TAN "。\n");

        if (me->query_skill_mapped("strike") != "liuhe-zhang") 
                return notify_fail("你没有激发六合掌法，难以施展" TAN "。\n");

        if (me->query_skill_prepared("strike") != "liuhe-zhang")
                return notify_fail("你没有准备六合掌法，难以施展" TAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "履步沉身，双肩蓄力，陡然间单掌飕的探出，一招「乌龙"
              "探海势」向$n" HIC "胸前拍落！\n" NOR;

        if (random(me->query_skill("strike")) > target->query_skill("dodge") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("strike");
                damage = damage / 2 + random(damage / 3);
                me->add("neili", -50);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "结果$p" HIR "闪避不及，被$P" HIR
                                           "一掌拍在胸口，顿时口喷鲜血，几乎昏厥"
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