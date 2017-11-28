#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIR "一指乾坤" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/yiyang-zhi/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(QIAN "只能空手施展。\n");

        if ((int)me->query_skill("yiyang-zhi", 1) < 160)
                return notify_fail("你一阳指诀不够娴熟，难以施展" QIAN "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 160)
                return notify_fail("你对经络学了解不够，难以施展" QIAN "。\n");

        if (me->query_skill_mapped("finger") != "yiyang-zhi")
                return notify_fail("你没有激发一阳指诀，难以施展" QIAN "。\n");

        if (me->query_skill_prepared("finger") != "yiyang-zhi")
                return notify_fail("你没有准备一阳指诀，难以施展" QIAN "。\n");

        if ((int)me->query_skill("force") < 220)
                return notify_fail("你的内功火候不够，难以施展" QIAN "。\n");

        if (me->query("max_neili") < 2400)
                return notify_fail("你的内力修为不足，难以施展" QIAN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "陡然使出「" HIR "一指乾坤" HIY "」绝技，单指劲"
              "点$n" HIY "檀中要穴，招式变化精奇之极！\n" NOR;

        ap = me->query_skill("finger") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                //damage = ap / 2 + random(ap / 3);
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 75,
                                           HIR "$n" HIR "只觉胸口一麻，已被$N" HIR
                                           "一指点中，顿时气血上涌，喷出数口鲜血"
                                           "。\n" NOR);
                me->add("neili", -200);
                me->start_busy(2);
        } else
        {
                msg += CYN "可是$n" CYN "看破了$N" CYN "的招"
                       "数，连消带打挡开了这一指。\n" NOR;
                me->start_busy(4);
                me->add("neili", -150);
        }
        message_combatd(msg, me, target);

        return 1;
}

