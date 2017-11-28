         
#include <ansi.h> 
#include <combat.h> 
 
//inherit F_DBASE; 
inherit F_SSERVER; 
 
int perform(object me, object target) 
{ 
        object weapon; 
        int skill, lvl, ap, dp, i; 
        string msg; 
        int damage, hurt, tm; 
         
        //if ( !userp(me) && !me->query("can_perform/liuhe-bian/lianhuan")) 
        //        return notify_fail("你所用的外功中没有这个功能!\n"); 
                 
        if ( !target ) target = offensive_target(me); 
         
        if ( !target 
                ||   !target->is_character() 
                ||   !me->is_fighting(target) ) 
                return notify_fail("六合连环诀只能对战斗中的对手使用。\n"); 
         
        if ( me->query_temp("lianhuan") ) 
                return notify_fail("你刚刚使用过六合连环诀，内力还未平复！\n");        
 
        weapon = me->query_temp("weapon"); 
 
        if (! objectp(weapon = me->query_temp("weapon"))  
                || (string)weapon->query("skill_type") != "whip"  
                || me->query_skill_mapped("whip") != "liuhe-bian" )  
                return notify_fail("你手中无鞭，如何能够施展连环诀？\n");        
         
        if ( me->query_skill("force") < 270 ) 
                return notify_fail("你的内功火候未到，无法配合鞭法施展连环诀！\n"); 
 
        if ( me->query_skill("whip", 1) < 180 ) 
                return notify_fail("你鞭法修为不足，还不能使用连环诀！\n"); 
         
        if ( me->query_skill("liuhe-bian", 1) < 180 ) 
                return notify_fail("你六合鞭法修为不足，还不能使用连环诀！\n");        
 
        if ( me->query("neili") <= 300 ) 
              return notify_fail("你的内力不够，无法施展！\n");        
                 
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n"); 
        if ( me->query_skill("dodge", 1) < 180 ) 
                return notify_fail("你轻功修为不足，无法快速攻击！\n"); 
 
        skill = me->query_skill("force", 1) + me->query_skill("liuhe-bian", 1) + 
                me->query_skill("dodge", 1); 
        lvl = me->query_skill("liuhe-bian", 1); 
        lvl = lvl / 3; 
         
        ap = skill + random(skill); 
 
        dp = target->query_skill("parry", 1) + target->query_skill("dodge", 1);     
         
        msg = HIR "\n$N大喝一声，口中轻轻念诵佛经，手中" +  
                       weapon->name() + "霍霍，招招连环，" 
                       "快如电闪！\n\n" NOR; 
        if (random(ap) > dp) 
        {     
             i = 6; 
             me->set_temp("lianhuan", 1); 
             me->add_temp("apply/damage", lvl); 
                 
             tm = 5 + random(5); 
         
             me->start_call_out( (: call_other, __FILE__, "remove_effect", me :), tm); 
             me->add("neili", -300); 
             me->start_busy(2);        
             hurt = skill / 3; 
              
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIY "\n【天合】，$N舞动手中" + weapon->name() +  
                    HIY "瞬息击向$n的额头，啪的一声轻响，顿时一条血印。\n" NOR); 
              
             i = 5; 
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIW "\n【地合】，$N一个横扫打向$n的下盘，$n未能看破企图，一声惨嚎，"  
                    + weapon->name() + HIW "鞭端已没入小腿半寸"  
                            "，登时连退数步！\n" NOR); 
              
             i = 4; 
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIR "\n【人合】，$N与" + weapon->name() + HIR"合为一体急射向$n，"  
                    "$n措手不急被打的吐血不止！\n" NOR); 
             i = 3; 
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIG "\n【神合】，$N手中" + weapon->name() + HIG "似有灵性一般" 
                    "死追着$n而去。\n" NOR); 
             i = 2; 
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIC "\n【鬼合】，$N突然面如死灰，动作僵硬，然后杀气却更胜一筹，"  
                    + weapon->name() + HIC "发出灵异的光芒，$n几乎看到了死亡的颜色。\n"    NOR); 
         
                i = 1; 
             damage = hurt / i; 
             msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50,  
                    HIB "\n【六合】，$N口中高唱佛号，手中" + weapon->name() +  
                    HIB "连环击出，鞭影重重，$n再也支持不住，身上被拉出一条条豁口。\n" NOR); 
              
         } else 
         { 
             msg += CYN "$n" CYN "不慌不忙，以快打快，将$N" 
                    CYN "的招式完全化去。\n" NOR; 
             me->add("neili", -200); 
             me->start_busy(2 + random(3));  
         } 
        message_combatd(msg, me, target);  
        return 1; 
} 
 
void remove_effect(object me, int amount) 
{ 
        int lvl; 
        lvl = (int)me->query_skill("liuhe-bian", 1); 
        lvl = lvl / 3; 
        me->delete_temp("lianhuan"); 
 
        if ( me->is_fighting() ) { 
                message_vision(HIR "\n$N将内力收回丹田，手上招数也逐渐慢了下来。\n\n" NOR, me);    
        } 
        else { 
                tell_object(me, HIR "\n你的内功运行完毕，将内力缓缓收回丹田。\n\n" NOR); 
        } 
        me->add_temp("apply/damage", -lvl); 
 
} 

