#include <ansi.h>
#include <combat.h>

#define FEI "「" HIC "影落飞花" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        mapping p;
        int i, af, lvl, count;

        if (userp(me) && ! me->query("can_perform/lanhua-shou/fei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FEI "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(FEI "只能空手施展。\n");

        if ((lvl = (int)me->query_skill("lanhua-shou", 1)) < 140)
                return notify_fail("你兰花拂穴手不够娴熟，难以施展" FEI "。\n");

        if (me->query_skill_mapped("hand") != "lanhua-shou")
                return notify_fail("你没有激发兰花拂穴手，难以施展" FEI "。\n");

        if (! mapp(p = me->query_skill_prepare())
           || p["hand"] != "lanhua-shou")
                return notify_fail("你没有准备兰花拂穴手，难以施展" FEI "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在真气不足，难以施展" FEI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIC "$N" HIC "微一凝神，双手作兰花状疾拂而出，一环环的劲气登时直逼$n"
              HIC "全身各大要穴。\n" NOR;
        me->add("neili", -150);

        if (random(me->query_skill("parry") + me->query_skill("hand")) >
            target->query_skill("parry"))
        {
                msg += HIR "$n" HIR "顿时觉得眼花缭乱，全然分辨"
                       "不清真伪，只得拼命运动抵挡。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIY "可是$n" HIY "凝神顿气，奋力抵挡，丝"
                       "毫不受手影的干扰，。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        af = member_array("hand", keys(p));

        for (i = 0; i < 6; i++)
        {
                if (! me->is_fighting(target))
                        break;

                me->set_temp("action_flag", af);
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(random(3));
        me->add_temp("apply/attack", -count);
        return 1;
}
