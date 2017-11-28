#include <ansi.h>

#define FU "「" HIW "缚字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;

        if (userp(me) && ! me->query("can_perform/jiandun-zhusuo/fu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FU "只能对战斗中的对手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            weapon->query("skill_type") != "whip")
                return notify_fail("你的武器不对，难以施展" FU "。\n");

        if (me->query_skill("jiandun-zhusuo", 1) < 50)
                return notify_fail("你的剑盾珠索级别不够，难以施展" FU "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你现在真气不够，难以施展" FU "。\n");

        if (me->query_skill_mapped("whip") != "jiandun-zhusuo")
                return notify_fail("你没有激发剑盾珠索，难以施展" FU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "右手一扬，手中" + weapon->name() +
              HIW "顿时回旋飞舞而至，迂回盘绕向$n" HIW "！\n";

        me->start_busy(1);

        if (random((int)me->query_skill("jiandun-zhusuo", 1)) > (int)target->query_skill("parry", 1) / 2)
        {
                msg += HIR "$n" HIR "只觉全身一紧，已被" + weapon->name() +
                       HIR "牢牢缚住，动弹不得！\n" NOR;
                target->start_busy((int)me->query_skill("jiandun-zhusuo") / 20 + 1);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，斜跳躲闪开来。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
