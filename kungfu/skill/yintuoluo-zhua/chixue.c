#include <ansi.h>
#include <combat.h>

#define JU "「" HIR "赤血连环爪" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage, lvl, i;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/yintuoluo-zhua/chixue"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JU "只能对战斗中的对手使用。\n");

        if ((me->query_skill_mapped("force") != "hunyuan-yiqi") && (me->query_skill_mapped("force") != "yijinjing") && (me->query_skill_mapped("force") != "luohan-fumogong")) 
                return notify_fail("你现在没有激发少林内功为内功，难以施展" JU "。\n"); 
                
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JU "只能空手施展。\n");

        if ((int)me->query_skill("yintuoluo-zhua", 1) < 200)
                return notify_fail("你因陀罗爪不够娴熟，难以施展" JU "。\n");

        if (me->query_skill_mapped("claw") != "yintuoluo-zhua")
                return notify_fail("你没有激发因陀罗爪，难以施展" JU "。\n");

        if (me->query_skill_prepared("claw") != "yintuoluo-zhua")
                return notify_fail("你没有准备因陀罗爪，难以施展" JU "。\n");

        if (me->query_skill("force") < 300)
                return notify_fail("你的内功修为不够，难以施展" JU "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" JU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("claw") + me->query_skill("force") + me->query_str() + me->query_dex();
        dp = target->query_skill("parry") + target->query_skill("force")+ target->query_str() + target->query_dex();
        lvl = (int)me->query_skill("yintuoluo-zhua", 1);
        msg = HIW "\n$N" HIW "运转少林真气，双手忽成爪行，施出绝招「" HIR "赤"
              "血连环爪" HIW "」，迅猛无比地抓向$n" HIW "。\n" NOR;

        if (ap * 3 / 4 + random(ap) > dp)
        {

                if ( me->query("max_neili") > target->query("max_neili") * 2 && me->query("neili") > 500 )
                {
                msg += HIR "$n" HIR "全身一颤，立足不稳，被$N"
                       HIR "这一爪抓得跌落在地上。\n" NOR;

                me->add("neili", -500);
                me->start_busy(3);

              //  message_combatd(msg, me, target);

                target->set("eff_qi", 0);
                target->set("eff_jing", 0);
               // target->unconcious(me);               
                } else
                {
                damage = ap + random(ap);               
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 120,
                                           HIR "但见$N" HIR "双爪划过，$n" HIR "已闪避不及，胸口被$N" HIR
                                           "抓出十条血痕。\n" NOR);

                me->start_busy(3);
                //target->start_busy(lvl/30);
                me->add("neili", -400);
              }
        } else
        {
                msg += CYN "$n" CYN "奋力招架，竟将$N" CYN "这招化解。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_sort(msg, me, target);
        me->add_temp("apply/attack", lvl/2); 
        me->add_temp("apply/damage", lvl/2);
        for (i = 0; i < 4; i++) 
        { 
                if (! me->is_fighting(target)) 
                break; 
                if (random(8) < 2 && ! target->is_busy()) 
                target->start_busy(1); 
        
                COMBAT_D->do_attack(me, target, 0, 0); 
        } 
        me->add_temp("apply/attack", -lvl/2); 
        me->add_temp("apply/damage", -lvl/2);
        return 1;
}

