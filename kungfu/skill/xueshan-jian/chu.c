#include <ansi.h>
#include <combat.h>

#define CHU "「" HIW "雪花六出" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
        int count;
        int i, attack_time;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/xueshan-jian/chu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHU "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CHU "。\n");

        if (me->query_skill("force") < 200)
                return notify_fail("你的内功的修为不够，难以施展" CHU "。\n");

        if (me->query_skill("xueshan-jian", 1) < 140)
                return notify_fail("你的雪山剑法修为不够，难以施展" CHU "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" CHU "。\n");

        if (me->query_skill_mapped("sword") != "xueshan-jian")
                return notify_fail("你没有激发雪山剑法，难以施展" CHU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "手中" + weapon->name() + HIW
              "抖动，正是一招「雪花六出」。虚中有实，实中有"
              "虚，四面八方向$n" HIW "攻去！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");
        attack_time = 6;

        if (ap / 2 + random(ap * 2) > dp)
        {
                msg += HIR "$n" HIR "只觉剑影重重，登时眼花缭"
                       "乱，被攻了个措手不及，疲于奔命。\n" NOR;
                count = ap / 10;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "剑招汹涌，寒"
                       "风袭体，急忙凝神聚气，小心应付。\n"
                       NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

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
