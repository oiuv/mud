#include <ansi.h>
#include <combat.h>

#define JIAN "「" HIW "先天功" HIR "乾阳" HIY "剑气" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int ap, dp, i, damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/xiantian-gong/jian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JIAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JIAN "只能空手施展。\n");

        if ((int)me->query_skill("xiantian-gong", 1) < 280)
                return notify_fail("你的先天功修为不够，难以施展" JIAN "。\n");

        if ((int)me->query_skill("yiyang-zhi", 1) < 280)
                return notify_fail("你一阳指诀不够娴熟，难以施展" JIAN "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 200)
                return notify_fail("你对经络学了解不够，难以施展" JIAN "。\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力修为不足，难以施展" JIAN "。\n");

        if (me->query_skill_mapped("unarmed") != "xiantian-gong")
                return notify_fail("你没有激发先天功为拳脚，难以施展" JIAN "。\n");

        if (me->query_skill_mapped("force") != "xiantian-gong")
                return notify_fail("你没有激发先天功为内功，难以施展" JIAN "。\n");

        if (me->query_skill_mapped("finger") != "yiyang-zhi")
                return notify_fail("你没有激发一阳指为指法，难以施展" JIAN "。\n");

        if (me->query_skill_prepared("unarmed") != "xiantian-gong"
           && me->query_skill_prepared("finger") != "yiyang-zhi")
                return notify_fail("你没有准备先天功或一阳指，难以施展" JIAN "。\n");

        if (me->query("neili") < 1000)
                return notify_fail("你现在的真气不足，难以施展" JIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "霎时只见$N" HIY "逆运" HIW "先天真气" HIY "，化为" HIR
              "纯阳内劲" HIY "聚于指尖，以一阳指诀手法疾点$n" HIY "全身诸"
              "多要穴。\n" NOR;  

        ap = me->query_skill("force") +
           me->query_skill("finger") +
           me->query_skill("unarmed");

        dp = target->query_skill("force") +
           target->query_skill("parry") +
           target->query_skill("dodge");

        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 100,
                                           HIR "$n" HIR "只觉全身一热，$P" HIR "「"
                                           HIW "先天功" HIR "乾阳" HIY "剑气" HIR
                                           "」顿时破体而入，便似身置洪炉，喷出一口"
                                           "鲜血。\n" NOR);
                message_combatd(msg, me, target);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这指来势汹涌，不敢"
                       "轻易招架，当即飞身纵跃闪开。\n" NOR;
                message_combatd(msg, me, target);
        }

        msg = HIR "紧接着$N" HIR "十指纷飞，接连弹出数道无形剑气，$n"
              HIR "四面八方皆被剑气所笼罩。\n"NOR;
        message_combatd(msg, me, target);

        me->add_temp("apply/attack", 100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
        }

        me->add_temp("apply/attack", -100);
        me->add("neili", -600);
        me->start_busy(3 + random(3));
        return 1;
}
