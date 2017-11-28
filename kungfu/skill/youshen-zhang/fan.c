#include <ansi.h>
#include <combat.h>

#define FAN "「" HIW "翻卦连环掌" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;

        if (userp(me) && ! me->query("can_perform/youshen-zhang/fan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(FAN "只能空手施展。\n");

        if ((int)me->query_skill("force") < 160)
                return notify_fail("你的内功修为不够，难以施展" FAN "。\n");

        if ((lvl = (int)me->query_skill("youshen-zhang", 1)) < 120)
                return notify_fail("你的游身八卦掌不够娴熟，难以施展" FAN "。\n");

        if (me->query_skill_mapped("unarmed") != "youshen-zhang")
                return notify_fail("你没有激发游身八卦掌，难以施展" FAN "。\n");

        if (me->query_skill_prepared("unarmed") != "youshen-zhang")
                return notify_fail("你没有准备游身八卦掌，难以施展" FAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在真气不够，难以施展" FAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "只见$N" HIW "脚踏八卦四方之位，身形在全场游走不定，双掌随后紧"
              "拍而出，紧紧缠绕着$n" HIW "。\n" NOR;
        me->add("neili", -150);

        if (random(me->query_skill("force") + me->query_skill("youshen-zhang")) >
            target->query_skill("force"))
        {
                msg += HIR "$n" HIR "顿时觉得呼吸不畅，全然被$N"
                       HIR "这股奇怪的力道所制，只得拼命运动抵挡"
                       "。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "$n" HIC "深吸一口气，凝神抵挡，但见"
                       "周围$N" HIC "掌影重重，$p" HIC "却是临危"
                       "不乱，镇定拆招。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(1 + random(6));
        me->add_temp("apply/attack", -count);
        return 1;
}
