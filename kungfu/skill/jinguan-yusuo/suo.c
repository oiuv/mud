#include <ansi.h>
#include <combat.h>

#define SUO "「" HIY "玄门金锁" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
	int level;

        if (userp(me) && ! me->query("can_perform/jinguan-yusuo/suo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(SUO "只有在战斗中才能使用。\n");

        if ((level = me->query_skill("jinguan-yusuo", 1)) < 150)
                return notify_fail("你的金关玉锁不够熟练，难以施展" SUO "。\n" NOR);

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不足，难以施展" SUO "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" SUO "。\n" NOR);

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "突然间$N" HIY "双手蓦的回圈，使出「" HIR "玄门金锁"
              HIY "」绝技，企图锁死$n" HIY "的招数。\n" NOR;

        if (random(level) > (int)target->query_skill("parry", 1) / 2)
        {
                msg += HIR "霎时$n" HIR "只觉招数一紧，双臂瘫软，全身"
                       "力道竟似被$N" HIR "牢牢锁住！\n" NOR;
                target->start_busy(level / 16);
                me->add("neili", -100);
                me->start_busy(1);
        } else
        {
                msg += HIC "可是$n" HIC "防守严密，丝毫不为$N"
                       HIC "的招数所乱。\n" NOR;
                me->add("neili", -50);
                me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}
