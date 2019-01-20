//duan.c
// gladiator

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        int str, power;
        // string weapon; 

        if( !target ) target = offensive_target(me);

        if( !target
                ||      !target->is_character()
                ||      !me->is_fighting(target) )
                return notify_fail("[断云决]只能对战斗中的对手使用。\n");

        if( me->query_skill("force",1) < 100 )
                return notify_fail("你的基本内功火候未到，无法施展断云决！\n");

        if( me->query_skill("whip",1) < 100 )
                return notify_fail("断云决需要精湛的青云鞭法方能有效施展！\n");

                // for a 800K player, frce/2 = 150, shen/3K = 300, power = 300
                // for players > 1.2M, power will hit max

        str = me->query_str();

        power = random( me->query_skill("qingyun-bian",1) / 3) + me->query_skill("force",1) / 2;

        if(power<150)power=150;
        if(power>480)power=480;

        if( me->query("neili") <= 200 )
                return notify_fail("你的内力不够使用断云决！\n");
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        message_vision(HIW "$N运足内力，猛地一扬"NOR + "$n" +
                       HIW "卷起无边风云遮月掩日，一股"NOR +
                       HIM "罡风" NOR + HIW "随著漫天鞭影扑天盖地的向敌人袭来。\n"
                         NOR, me, me->query_temp("weapon"));

        me->add_temp("apply/attack", power / 5);
        me->add_temp("apply/damage", power / 5);
        target->add_temp("apply/armor",-power / 5);
        target->add_temp("apply/dodge",-power / 5);

        COMBAT_D->do_attack(me, target, me->query_temp("weapon"));
        COMBAT_D->do_attack(me, target, me->query_temp("weapon"));

        if (random(10)>0) COMBAT_D->do_attack(me, target, me->query_temp("weapon"));
        if (random(10)>2) COMBAT_D->do_attack(me, target, me->query_temp("weapon"));
        if (random(10)>4) COMBAT_D->do_attack(me, target, me->query_temp("weapon"));
        if (random(10)>6) COMBAT_D->do_attack(me, target, me->query_temp("weapon"));
        if (random(10)>8) COMBAT_D->do_attack(me, target, me->query_temp("weapon"));


        me->start_perform(1 + random(2),"[断云决]");

        me->add_temp("apply/attack", -power / 5);
        me->add_temp("apply/damage",-power / 5);
        target->add_temp("apply/armor",power / 5);
        target->add_temp("apply/dodge",power / 5);

        me->add("neili", -power);
        me->start_busy( 2 + random(2));

        return 1;
}
