#include <ansi.h> 
#include <combat.h> 
 
#define LEITING "「" HIR "雷霆霹雳" NOR "」"  
 
inherit F_SSERVER; 
 
int perform(object me, object target) 
{ 
        string msg; 
        int extra; 
        object weapon; 
        int damage; 
 

        if(me->is_busy()) 
                return notify_fail("你现在没空！！\n"); 
        if( (int)me->query_skill("hongye-daofa",1) < 80) 
                return notify_fail("你目前功力还使不出" LEITING "。\n"); 
         
        if (!objectp(weapon = me->query_temp("weapon")) 
                || (string)weapon->query("skill_type") != "blade") 
                        return notify_fail("你使用的武器不对。\n"); 
        if( (int)me->query("neili") < 500 ) 
                 return notify_fail("你的内力不够。\n"); 
 
        if( !target ) target = offensive_target(me); 
 
        if( !target 
                ||      !target->is_character() 
                ||      !me->is_fighting(target) ) 
                return notify_fail(LEITING "只能对战斗中的对手使用。\n"); 
         
        weapon = me->query_temp("weapon"); 
        damage = me->query_skill("hongye-daofa", 1) + random((int)me->query_skill("dodge")) / 2; 
        extra = me->query_skill("hongye-daofa",1) / 10; 
 
        me->add_temp("apply/attack", extra);     
        me->add_temp("apply/damage", extra); 
 
        msg = HIR  "\n$N手中的"+ weapon->name() +HIR"幻出漫天刀云，" +  
                   weapon->name() +  
              HIR  "划破刀云，雷霆霹雳般的击向$n！\n" NOR; 
        message_vision(msg, me, target); 
 
        if (random(10) > 4) 
        { 
                me->add("neili", -50); 
                msg = COMBAT_D->do_damage(me,target, WEAPON_ATTACK, damage, 30,     
                       HIC  "\n$N刀气好似暴雨前雷霆一般，夹杂着刺耳的尖鸣，直贯$n而去。\n" NOR); 
                message_combatd(msg, me, target); 
        } else 
        { 
                message_combatd(HIC  "\n$n不退反进，在$N挥刀之前逼到近身，使得$N不得不收回了七成的力道。\n" NOR, me, target); 
                COMBAT_D->do_attack(me,target, weapon, TYPE_REGULAR, msg); 
        } 
 
        me->add_temp("apply/attack", -extra); 
        me->add_temp("apply/damage", -extra); 
 
        me->start_busy(1); 
                return 1; 
} 

