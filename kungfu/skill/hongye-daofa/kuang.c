          
#include <ansi.h>  
#include <combat.h>  
  
#define KUANG "「" HIR "狂风落叶" NOR "」"   
  
inherit F_SSERVER;  
  
int perform(object me, object target)  
{  
        int extra;  
        object weapon;  
        string msg;  
  
        extra=me->query_skill("hongye-daofa",1);  
   
  
        if( !target ) target = offensive_target(me);  
  
        if( !target||!target->is_character()||!me->is_fighting(target) )  
                return notify_fail("你只能对战斗中的对手使用" KUANG "。\n");  
          
        if( (int)me->query_skill("hongye-daofa",1) < 150)  
                return notify_fail("你目前功力还使不出" KUANG "。\n");  
  
        if (!objectp(weapon = me->query_temp("weapon"))  
                || (string)weapon->query("skill_type") != "blade")  
                        return notify_fail("你使用的武器不对。\n");  
          
        if( (int)me->query("neili") < 800 )  
                        return notify_fail("你的内力不够。\n");  
          
        me->add("neili", -300);  
        msg = HIC "$N淡然一笑，本就快捷绝伦的刀法骤然变得更加凌厉！\n"  
              HIC "就在这一瞬之间，$N已快速劈出六刀！刀夹杂着风，风里含着刀影！\n"  
              HIC "$n只觉得心跳都停止了！" NOR;  
  
        message_vision(msg, me, target);                  
                  
        message_combatd(HIY  "$N从左面劈出两刀！\n" NOR, me, target);   
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
  
        message_combatd(HIY  "$N紧跟$n从右面劈出两刀！\n" NOR, me, target);   
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
  
        message_combatd(HIY  "$N竟然又从上面劈出两刀！\n" NOR, me, target);  
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
        COMBAT_D->do_attack(me,target, me->query_temp("weapon"), TYPE_REGULAR, msg);  
  
        me->start_busy(2 + random(2));  
        return 1;  
}  

