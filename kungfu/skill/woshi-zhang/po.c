#include <ansi.h> 
#include <combat.h>  

inherit F_SSERVER;  

int perform(object me, object target)  
{
        string msg;  
        int damage;  

        if (! target) target = offensive_target(me);  

        if (! target || ! me->is_fighting(target))  
                return notify_fail("「碎石破玉」只能在战斗中对对手使用。\n");  

        //if (userp(me) && ! me->query("can_perform/woshi-zhang/po"))  
        //        return notify_fail("你所使用的外功中没有这种功能。\n");  

        if (me->query_temp("weapon") ||  
            me->query_temp("secondary_weapon"))  
                return notify_fail("你必须空手才能使用「碎石破玉」！\n");  

        if (me->query_skill("force") < 140)  
                return notify_fail("你的内功的修为不够，不能使用这一绝技！\n");  

        if (me->query_skill("woshi-zhang", 1) < 120)  
                return notify_fail("你的握石掌修为不够，目前不能使用「碎石破玉」！\n");  

        if (me->query_skill_mapped("strike") != "woshi-zhang") 
                return notify_fail("你没有激发握石掌，难以施展「碎石破玉」。\n"); 

        if (me->query("neili") < 400) 
                return notify_fail("你现在真气不够，难以施展「碎石破玉」。\n"); 

        if (! living(target)) 
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n"); 

        msg = HIW "只见$N" HIW "聚力于掌，猛然间怒喝一声，一掌破空而至，正是" 
              "握石掌的一招「开碑碎石」，破空劈向$n" HIW "而去！\n" NOR; 

        if (random(me->query_skill("strike")) > target->query_skill("parry") / 2) 
        { 
                me->start_busy(2); 

                damage = me->query_skill("woshi-zhang", 1); 
                //damage = damage * 2 + random(damage * 5); 
                damage = damage * 2 + random(damage * 2);
                //msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 35, 
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                           HIR "结果只听$n" HIR "一声惨嚎，胸口" 
                                           HIR "已被$N掌劲结结实实的轰中，“哇”的喷出一大" 
                                           "口鲜血。\n" NOR); 
                me->add("neili", -250); 
        } else 
        {
                me->start_busy(2); 
                me->add("neili", -120); 
                msg += CYN "可是$p" CYN "看破了$N" CYN 
                       "的企图，躲开了这招杀着。\n" NOR; 
        }
        message_combatd(msg, me, target); 

        return 1; 
}


