#include <ansi.h>
#include <combat.h>

#define CHAN "「" HIC "缠字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int level;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/quanzhen-jian/chan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" CHAN "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((level = me->query_skill("quanzhen-jian", 1)) < 80)
                return notify_fail("你全真剑法不够娴熟，难以施展" CHAN "。\n");

        if (me->query_skill_mapped("sword") != "quanzhen-jian")
                return notify_fail("你没有激发全真剑法，难以施展" CHAN "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你现在的真气不够，难以施展" CHAN "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "使出全真剑法「缠」字诀，" + weapon->name() +
              HIC "带出阵阵风声，从四面八方盘绕向$n" HIC "。\n" NOR;

        me->add("neili", -50);
        ap = me->query_skill("sword");
        dp = target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                msg += HIR "$p" HIR "只觉得$P" HIR
                       "剑上压力一层强过一层，只能使尽浑身解数运功抵挡。\n" NOR;
                target->start_busy(level / 28 + 2);
        } else
        {
                msg += CYN "$p" CYN "见$P" CYN "招法严谨，当下不敢小觑"
                       "，巧妙拆解$P" CYN "的来招，不露半点破绽。\n" NOR;
                me->start_busy(1);
        }
        message_combatd(msg, me, target);

        return 1;
}

