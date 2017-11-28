#include <ansi.h>

#define CI "「" HIR "神门刺" NOR "」"

inherit F_SSERVER;

int perform(object me)
{
        string msg;
        object weapon, weapon2, target;
        int skill, ap, dp;

        if (userp(me) && ! me->query("can_perform/shenmen-jian/ci"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(CI "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CI "。\n");

        skill = me->query_skill("shenmen-jian", 1);

        if (skill < 120)
                return notify_fail("你的神门十三剑等级不够，难以施展" CI "。\n");

        if (!objectp(weapon2 = target->query_temp("weapon")))
                return notify_fail("对方没有使用兵器，难以施展" CI "。\n");

        if (me->query_skill_mapped("sword") != "shenmen-jian")
                return notify_fail("你现在没有激发神门十三剑，难以施展" CI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在真气不足，难以施展" CI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "突然$N" HIR "一声冷哼，手中" + weapon->name() + HIR
              "中攻直进，直刺$n" HIR "拿着的" + weapon2->name() + HIR
              "的手腕。\n" NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (dp < 1) dp = 1;

        if (ap / 3 + random(ap) > dp)
        {
                me->add("neili", -120);
                msg += HIR "$n" HIR "只觉手腕一阵刺痛，手中" + weapon2->name() +
                       HIR "再也拿捏不住，脱手而飞。\n" NOR;
                me->start_busy(2 + random(2));
                target->start_busy(2);
                weapon2->move(environment(target));
        } else
        {
                me->add("neili", -40);
                msg += CYN "可是$n" CYN "看破了$N" CYN "的企图，将手中兵刃挥"
                       "舞得密不透风，挡开了$N" CYN "的兵器。\n"NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);
        return 1;
}