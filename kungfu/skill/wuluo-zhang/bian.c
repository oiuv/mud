#include <ansi.h>
#include <combat.h>

#define BIAN "「" HIC "风云变幻" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;

        if (userp(me) && ! me->query("can_perform/wuluo-zhang/bian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BIAN "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(BIAN "只能空手施展。\n");

        if ((lvl = (int)me->query_skill("wuluo-zhang", 1)) < 100)
                return notify_fail("你五罗轻烟掌不够娴熟，难以施展" BIAN "。\n");

        if (me->query_skill_mapped("strike") != "wuluo-zhang")
                return notify_fail("你没有激发五罗轻烟掌，难以施展" BIAN "。\n");

        if (me->query_skill_prepared("strike") != "wuluo-zhang")
                return notify_fail("你没有准备五罗轻烟掌，难以施展" BIAN "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" BIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "施出五罗轻烟掌绝技，单掌轻轻一抖，登时化出五道掌"
              "影，轻飘飘向$n" HIC "拍去。\n" NOR;
        me->add("neili", -50);

        if (random(me->query_skill("force") + me->query_skill("strike")) >
            target->query_skill("force"))
        {
                msg += HIR "$n" HIR "顿时觉得眼花缭乱，全然分辨"
                       "不清真伪，只得拼命运动抵挡。\n" NOR;
                count = lvl / 10;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "可是$n" HIC "凝神顿气，奋力抵挡，丝"
                       "毫不受掌影的干扰，。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(1 + random(5));
        me->add_temp("apply/attack", -count);
        return 1;
}
