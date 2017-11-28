#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int i; 

        i = me->query_skill("ruying-suixingtui", 1) / 4;

        if ( userp(me) && !me->query("can_perform/ruying-suixingtui/ruying"))
                return notify_fail("你所使用的外功中没有这样的功能。\n");
        
        if( !target ) target = offensive_target(me);

        if( !target || !me->is_fighting(target) )
                return notify_fail("「如影随形」只能在战斗中对对手使用。\n");

        if( objectp(me->query_temp("weapon")) )
                return notify_fail("使用「如影随形」时双手必须空着！\n");

        if( (int)me->query_skill("ruying-suixingtui", 1) < 160 )
                return notify_fail("你的如影随形腿不够娴熟，不会使用「如影随形」。\n");

        if( (int)me->query_skill("force", 1) < 160 )
                return notify_fail("你的内功等级不够，不能使用「如影随形」。\n");

        if( (int)me->query_dex() < 30 )
                return notify_fail("你的身法不够强，不能使用「如影随形」。\n");

        if (me->query_skill_prepared("unarmed") != "ruying-suixingtui"
        || me->query_skill_mapped("unarmed") != "ruying-suixingtui")
                return notify_fail("你现在无法使用「如影随形」进行攻击。\n");
 
        if( (int)me->query("max_neili") < 2000 ) 
                return notify_fail("你的内力修为太弱，不能使用「如影随形」！\n");

        if( (int)me->query("neili") < 700 )
                return notify_fail("你现在内力太少，不能使用「如影随形」。\n"); 

        me->add("neili", -500);
      
        msg = YEL "\n你猛吸一口真气，体内劲力瞬时爆发！\n" NOR;
        message_vision(msg, me, target); 
       
        me->add_temp("apply/strength", i);
        me->add_temp("apply/dexerity", i);
        me->add_temp("apply/attack", i);
        me->add_temp("apply/damage", i);

        if (random((int)me->query("combat_exp")) > (int)target->query("combat_exp") / 2 
        &&  random((int)me->query_skill("force")) > (int)target->query_skill("force") / 2)
       { 
             msg = HIY "$N忽然跃起，左脚一勾一弹，霎时之间踢出一招「如」字诀的穿心腿，直袭$n前胸！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), TYPE_QUICK,msg);
        
             msg = HIY "紧接着$N左腿勾回，将腰身一扭，那右腿的一招「影」字诀便紧随而至，飞向$n！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 1,msg);
 
             msg = HIY"只见$N右脚劲力未消，便凌空一转，左腿顺势扫出一招「随」字诀，如影而至！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), TYPE_QUICK,msg);

             msg = HIY"半空中$N脚未后撤，已经运起「形」字诀，内劲直透脚尖，在$n胸腹处连点了数十下！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), TYPE_QUICK,msg);

             msg = HIR"这时$N双臂展动，带起一股强烈的旋风，双腿霎时齐并，「如影随形」一击重炮轰在$n胸膛之上！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), TYPE_QUICK,msg);
        } else 
       {
             msg = HIY"$N忽然跃起，左脚一勾一弹，霎时之间踢出一招「如」字诀的穿心腿，直袭$n前胸！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), TYPE_QUICK,msg);
        
             msg = HIY"紧接着$N左腿勾回，将腰身一扭，那右腿的一招「影」字诀便紧随而至，飞向$n！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 1,msg);
 
             msg = HIY"只见$N右脚劲力未消，便凌空一转，左腿顺势扫出一招「随」字诀，如影而至！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"),TYPE_QUICK,msg);

             msg = HIY"半空中$N脚未后撤，已经运起「形」字诀，内劲直透脚尖，在$n胸腹处连点了数十下！"NOR;
             COMBAT_D->do_attack(me, target, me->query_temp("weapon"), 1,msg);
        }
 
             msg = YEL "\n你连环飞腿使完，全身一转，稳稳落在地上。\n" NOR;
               
             //me->add("neili", -400);
             me->add_temp("apply/dexerity", -i);
             me->add_temp("apply/damage", -i); 
             me->add_temp("apply/strength", -i);
             me->add_temp("apply/attack", -i);   
             me->start_busy(2+random(2));

        return 1;
}


