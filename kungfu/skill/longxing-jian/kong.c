#include <ansi.h>
#include <combat.h>

#define ZHUAN "「" HIY "金龙疾空" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int count;
        int i, attack_time;

        if (userp(me) && ! me->query("can_perform/longxing-jian/kong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" ZHUAN "。\n");

        if ((int)me->query_skill("longxing-jian", 1) < 160)
                return notify_fail("你的龙形剑法不够娴熟，难以施展" ZHUAN "。\n");

        if (me->query("neili") < 250)
                return notify_fail("你的真气不够，难以施展" ZHUAN "。\n");

        if (me->query_skill_mapped("sword") != "longxing-jian")
                return notify_fail("你没有激发龙形剑法，难以施展" ZHUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N" HIY "一声清啸，手中" + weapon->name() +
              HIY "龙吟不定，划向虚空，刹那间，一道金光疾射，"
              HIY "犹如一条金龙腾越在半空，猛地射向$n" HIY "。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");
        attack_time = 7;
        if (ap / 2 + random(ap * 2) > dp)
        {
                msg += HIR "结果$p" HIR "被$P" HIR
                       "攻了个措手不及，连连后退不暇！\n" NOR;
                count = ap / 6;
                me->add_temp("apply/attack", count);
                attack_time += random(ap / 45);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "这几剑并无破绽"
                       "，不敢大意，小心应付。\n" NOR;
                count = 0;
        }
                
        message_combatd(msg, me, target);

        if (attack_time > 10)
                attack_time = 10;

        me->add("neili", -attack_time * 20);

        for (i = 0; i < attack_time; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->start_busy(1 + random(attack_time));

        return 1;
}

