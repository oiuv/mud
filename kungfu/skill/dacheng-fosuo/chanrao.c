#include <ansi.h>

inherit F_SSERVER;
int perform(object me, object target)
{
        string msg;
        object weapon = me->query_temp("weapon");

        //if (!wizardp(me) && ! me->query("can_perform/dacheng-fosuo/chanrao")) 
        //        return notify_fail("你所使用的外功中没有这个功能！\n");
        
        if( !target ) target = offensive_target(me);
        if( !target
        ||      !target->is_character()
        ||      !me->is_fighting(target) )
                return notify_fail("缠绕诀只能对战斗中的对手使用。\n");

        if(me->query_skill("dacheng-fosuo",1) < 80)
                return notify_fail("你的大乘佛索还不够娴熟，不会使用缠绕诀。\n");

        if( !weapon 
        ||      weapon->query("skill_type") != "whip"
        ||      me->query_skill_mapped("whip") != "dacheng-fosuo" ) 
                return notify_fail("你现在无法使用缠绕诀。\n");

        if( me->query("neili") < 500 )
                return notify_fail("你的内力不够。\n");

        if( target->is_busy() )
        return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

          me->start_perform( 5, "缠绕诀");
    msg = HIG "$N使出缠绕诀，鞭子一挥向$n的双腿卷去！\n";

        me->start_busy(random(2));
        if((random(me->query("combat_exp")) > target->query("combat_exp")/2) 
                ||      (random(me->query_dex()) > target->query_dex()/2))
        {
        msg += HIY "结果$p被$P一卷，两条腿被结结实实的捆起来，在地上无法爬起。\n" NOR;
                target->start_busy((int)me->query_skill("dacheng-fosuo",1)/20+2);

        } 
        else {
                msg += HIW "可是$p看破了$P的缠绕诀，身子一跃便躲开了。\n" NOR;
                me->start_busy(2);
        }
        message_vision(msg, me, target);
        
        me->add("neili", -200);
        return 1;
}

