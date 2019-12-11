#include <ansi.h>
#include <combat.h>

#define ZONG "「" HIY "万佛朝宗" NOR "」"

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

        if (userp(me) && ! me->query("can_perform/rulai-zhang/zong"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZONG "只能对战斗中的对手使用。\n");
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZONG "只能空手施展。\n");
                
        if (me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不够，难以施展" ZONG "。\n");

        if ((int)me->query_skill("force") < 280)
                return notify_fail("你的内功火候不足，难以施展" ZONG "。\n");

        if ((int)me->query_skill("rulai-zhang", 1) < 150)
                return notify_fail("你千手如来掌火候不够，难以施展" ZONG "。\n");

        if (me->query_skill_mapped("force") != "hunyuan-yiqi") 
                return notify_fail("你现在没有激发心意气内功为内功，难以施展" ZONG "。\n");
        if (me->query_skill_prepared("strike") != "rulai-zhang")
                return notify_fail("你没有准备千手如来掌，难以施展" ZONG "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" ZONG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "\n$N" HIY "当下更不耽搁，高呼佛号，轻飘飘拍出一掌，招式"
              "甚为寻常。但掌到中途，忽然微微摇晃，登时一掌变两掌，两掌变四"
              "掌，四掌变八掌！铺天盖地拍向$n" HIY "。" NOR;

        ap = me->query_skill("strike") + me->query("str") * 10;
        dp = target->query_skill("parry") + target->query("dex") * 10;

        if (ap / 2 + random(ap) > dp)
        {
                // 增加点感官刺激:)
                if (me->query("max_neili") > target->query("max_neili") * 2)
                {
                        me->start_busy(3);
                        me->add("neili", -500);
                        msg += HIY "随即又听$N" HIY "高声喝道：「" HIR "我佛如来" HIY
                               "」顷刻间，但见$N" HIY "八掌又变为十六掌，进而再幻化为"
                               "三十二掌，掌势层层叠叠，波澜壮阔，气势磅礴，荡气回肠"
                               "。如海潮般向$n" HIY "涌去。\n\n" HIR "$n" HIR "面对这"
                               "无穷无尽的掌势，竟然放弃了抵抗，面如死灰坐以待毙。\n" NOR;

                        message_sort(msg, me, target);
                        target->set("eff_qi", 0);
                        target->set("eff_jing", 0);
                     //   target->unconcious(me);
                        me->add_temp("apply/attack", ap);
                        me->add_temp("rulai-zhang/hit_msg", 1);
                        for (i = 0; i < 9; i++)
                        {
                                if (! me->is_fighting(target))
                                break;
                              //  if (random(5) < 2 && ! target->is_busy())
                             //   target->start_busy(1);

                                COMBAT_D->do_attack(me, target, 0, 0);
                        }
                        me->add_temp("apply/attack", -ap);
                        me->delete_temp("rulai-zhang/hit_msg");
                        return 1;
                } else
                {
                        count = ap / 9;

                        msg += HIR "\n$n" HIR "见掌势层层叠叠，有如海潮，一时"
                               "只觉头晕目眩，难作抵挡。\n" NOR;
                }
        } else
        {
                msg += HIC "\n$n" HIC "见掌势层层叠叠，有如海潮，连忙"
                       "振作精神，勉强抵挡。\n" NOR;
                count = 0;
        }

        message_sort(msg, me, target);
        me->add_temp("apply/attack", count);
        me->add_temp("rulai-zhang/hit_msg", 1);
        me->add("neili", -300);

        for (i = 0; i < 6; i++)

        {
                if (! me->is_fighting(target))
                        break;
              //  if (random(5) < 2 && ! target->is_busy())
              //          target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
        }

        me->start_busy(1 + random(6));

        me->add_temp("apply/attack", -count);
        me->delete_temp("rulai-zhang/hit_msg");
        return 1;
}

