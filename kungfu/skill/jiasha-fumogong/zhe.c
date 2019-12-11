#include <ansi.h>
#include <combat.h>

#define JIU "「" HIR "避云遮日" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int count;
        int i;
 
        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/jiasha-fumogong/zhe"))
               return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(JIU "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JIU "只能空手施展。\n");
                
        if (me->query("max_neili") < 2000)
                return notify_fail("你的内力的修为不够，现在无法使用" JIU "。\n");

        if (me->query_skill("jiasha-fumogong", 1) < 140)
                return notify_fail("你的袈裟伏魔功还不够娴熟，难以施展" JIU "。\n");

        if (me->query_skill_mapped("unarmed") != "jiasha-fumogong")
                return notify_fail("你现在没有激发袈裟伏魔功为拳脚，难以施展" JIU "。\n");

        if (me->query_skill_prepared("unarmed") != "jiasha-fumogong")
                return notify_fail("你现在没有准备使用袈裟伏魔功，难以施展" JIU "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你的真气不够，无法运用" JIU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "大喝一声，施出绝招「" HIR "避云遮日" HIG "」，顿时真气迸发，衣衫鼓动，双手"
              "猛然如闪电般地拍向$n" HIG "。\n" NOR;

        ap = me->query_skill("unarmed") + me->query("con") * 20;
        dp = target->query_skill("parry") + target->query("con") * 20;

        if (ap / 2 + random(ap) > dp)
        {
                count = ap / 4;
                if ( me->query("max_neili") > target->query("max_neili") * 2
                     && me->query("neili") > 500 )
                {
                msg += HIR "$n" HIR "全身一颤，立足不稳，被$N"
                       HIR "这招击得飞起，重重的跌落在地上。\n" NOR;

                me->add("neili", -500);
                me->start_busy(3);

              //  message_combatd(msg, me, target);

                target->set("eff_qi", 0);
                target->set("eff_jing", 0);
                //target->unconcious(me);
                }
        } else
        {
                count = ap / 9;

        }

        message_sort(msg, me, target);
        me->add_temp("apply/attack", count);

        me->add("neili", -300);

        for (i = 0; i < 9; i++)
        {
                if (! me->is_fighting(target))
                        break;
              //  if (random(5) < 2 && ! target->is_busy())
               //         target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
        }

        me->start_busy(1 + random(5));

        me->add_temp("apply/attack", -count);

        return 1;
}

