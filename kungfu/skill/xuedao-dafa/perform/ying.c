#include <ansi.h>
#include <combat.h>

#define YING "「" HIR "无影神刀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;

        if (userp(me) && ! me->query("can_perform/xuedao-dafa/ying"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(YING "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" YING "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("force") < 160)
                return notify_fail("你的内功火候不够，难以施展" YING "。\n");

        if ((int)me->query_skill("xuedao-dafa", 1) < 120)
                return notify_fail("你的血刀大法还不到家，难以施展" YING "。\n");

        if (me->query_skill_mapped("force") != "xuedao-dafa")
                return notify_fail("你没有激发血刀大法为内功，难以施展" YING "。\n");

        if (me->query_skill_mapped("blade") != "xuedao-dafa")
                return notify_fail("你没有激发血刀大法为刀法，难以施展" YING "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的真气不够，难以施展" YING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "一声狞笑，将手中的" + weapon->name() +
              WHT "舞动如轮，刀锋激起层层" HIR "血浪" NOR +
              WHT "紧逼$n" WHT "而去。\n" NOR;

        me->add("neili", -80);
        if (random(me->query_skill("blade")) > target->query_skill("parry") / 2)
        {
                msg += HIR "结果$p" HIR "被$P" HIR "逼得手忙脚"
                       "乱，只能紧守门户，不敢擅动。\n" NOR;
                target->start_busy((int)me->query_skill("blade") / 27 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图"
                       "，并不慌张，应对自如。\n" NOR;
                me->start_busy(1);
        }
        message_combatd(msg, me, target);

        return 1;
}
