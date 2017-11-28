#include <ansi.h>
#include <combat.h>

#define RIYUE "「" HIY "日月乾坤" NOR "」"

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

        if (userp(me) && ! me->query("can_perform/qiankun-jian/riyue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(RIYUE "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" RIYUE "。\n");

        if (me->query_skill("force") < 220)
                return notify_fail("你的内功的修为不够，难以施展" RIYUE "。\n");

        if (me->query_skill("qiankun-jian", 1) < 150)
                return notify_fail("你的乾坤神剑修为不够，难以施展" RIYUE "。\n");

        if (me->query("neili") < 400)
                return notify_fail("你的真气不够，难以施展" RIYUE "。\n");

        if (me->query_skill_mapped("sword") != "qiankun-jian")
                return notify_fail("你没有激发乾坤神剑，难以施展" RIYUE "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "只见$N" HIY "手中" + weapon->name() + HIY
              "一颤，将乾坤剑法连环施出，顿时幻出无数剑影，"
              "铺天盖地向$n" HIY "席卷而去！\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");
        attack_time = 4;

        if (ap / 2 + random(ap * 2) > dp)
        {
                msg += HIR "$n" HIR "只觉剑影重重，登时眼花缭"
                       "乱，被攻了个措手不及，疲于奔命。\n" NOR;
                count = ap / 10;
                me->add_temp("apply/attack", count);
                attack_time += random(ap / 45);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "剑招汹涌，气"
                       "势恢弘，急忙凝神聚气，小心应付。\n"
                       NOR;
                count = 0;
        }
                
        message_combatd(msg, me, target);

        if (attack_time > 6)
                attack_time = 6;

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
