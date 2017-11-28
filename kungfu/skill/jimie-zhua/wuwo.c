#include <ansi.h> 
#include <combat.h> 

inherit F_SSERVER; 

int perform(object me) 
{ 
        string msg; 
        object target; 
        int skill, ap, dp, damage; 

        if (! target) 
        {
                me->clean_up_enemy(); 
                target = me->select_opponent(); 
        }

        if (! target || ! me->is_fighting(target)) 
                return notify_fail("「众生无我」只能在战斗中对对手使用。\n"); 

         skill = me->query_skill("jimie-zhua", 1); 
  
         if (skill < 80) 
                return notify_fail("你的寂灭爪等级不够，不会使用「众生无我」！\n"); 

         if (me->query("neili") < 250) 
                return notify_fail("你的真气不够！\n"); 

         if (me->query_skill_mapped("claw") != "jimie-zhua")  
                return notify_fail("你没有激发寂灭爪，无法使用「众生无我」！\n"); 

         if (! living(target)) 
                 return notify_fail("对方都已经这样了，用不着这么费力吧？\n"); 
         msg = HIY "$N" HIY "猛地扑上前来，双爪分两路向$n" HIY "抓出，平淡" 
               "的一击，却显示出扎实的基本功！\n" NOR; 

         ap = me->query_skill("force") + me->query_skill("claw"); 
         dp = target->query_skill("parry") + target->query_skill("dodge"); 
         if (ap / 2 + random(ap) > dp) 
         { 
                 me->add("neili", -200); 
                 damage = ap / 3 + random(ap / 4); 
                 msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 55, 
                                            HIR "慌乱中，$p" HIR "不及招架$P这看似" 
                                            HIR "简单这一抓，结果被抓了个正中，" 
                                            "喀的一声，$p身上多了一条伤痕。\n" NOR); 
                 me->start_busy(2); 
         } else 
         { 
                 msg += CYN "可是$p" CYN "$P见来势凶猛" CYN 
                        "连忙招架，顺势跃开，没有被$P" 
                        CYN "得手。\n" NOR; 
                  me->add("neili",-20); 
                  me->start_busy(3); 
          } 
          message_combatd(msg, me, target); 

           return 1; 
}

