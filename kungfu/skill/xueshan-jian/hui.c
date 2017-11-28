#include <ansi.h>
#include <combat.h>

#define HUI "「" HIW "风回雪舞" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;
//      int count;
//      int i, attack_time;

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/xueshan-jian/hui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUI "只能对战斗中的对手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
              (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" HUI "。\n");

        if (me->query_skill("force") < 50)
                return notify_fail("你的内功的修为不够，难以施展" HUI "。\n");

        if (me->query_skill("xueshan-jian", 1) < 30)
                return notify_fail("你的雪山剑法修为不够，难以施展" HUI "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你的真气不够，难以施展" HUI "。\n");

        if (me->query_skill_mapped("sword") != "xueshan-jian")
                return notify_fail("你没有激发雪山剑法，难以施展" HUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("xueshan-jian", 1);
        dp = target->query_skill("parry", 1);

        msg = HIW "$N" HIW "回剑旋舞，一式「风回雪舞」施出，剑势连绵不绝，呼"
              "啸而至，欲图将$n" HIW "缠裹其中。\n" NOR;

        me->add("neili", -30);
        if (random(ap) > dp / 2)
        {
                msg += HIR "$n" HIR "只觉重重剑影铺天盖地向自己撒"
                       "来，顿被攻了个手忙脚乱，不知如何应对。\n"
                       NOR;
                target->start_busy(ap / 16 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，镇"
                       "定逾恒，全神应对自如。\n" NOR;
                me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}