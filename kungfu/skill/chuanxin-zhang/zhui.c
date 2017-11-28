#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

#define ZHUI "「" HIW "穿心锥" NOR "」"

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/chuanxin-zhang/zhui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUI "只能对战斗中的对手使用。\n");

        if ((int)me->query_skill("chuanxin-zhang", 1) < 100)
                return notify_fail("你的穿心掌不够娴熟，不会使用" ZHUI "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功修为不够，难以施展" ZHUI "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在真气不够，无法使用" ZHUI "。\n");

        if (me->query_skill_mapped("strike") != "chuanxin-zhang") 
                return notify_fail("你没有激发穿心掌，无法使用" ZHUI "！\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "\n$N" HIY "一声冷笑，双掌一错，陡然施出一招"
              "「" HIW "穿心锥" HIY "」，幻出千百之手掌一齐"
              "插向$n" HIY "！" NOR;

        if (random(me->query_skill("strike")) > target->query_skill("dodge") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("strike");
                damage = damage / 2 + random(damage / 2);
                me->add("neili", -150);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                          HIR "结果$p" HIR "没能避开$P" HIR
                                          "变幻莫测的掌法，掌劲顿时透胸而过，"
                                          "口喷鲜血，几乎摔倒！\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -50);
                msg = CYN "可是$p" CYN "识破了$P"
                      CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}

