#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;
#include "/kungfu/skill/eff_msg.h";

int perform(object me, object target)
{
        string msg; 
        int extra, skill, at, df, i, lmt, damage, p;
        object weapon;
        extra = me->query_skill("leiming-bian",1);

        //if (userp(me) && !me->query("can_perform/leiming-bian/cibei"))
       //       return notify_fail("你使用的外功中没有这个功能。\n");
        if( !target ) target = offensive_target(me);

        if( !target
                 || !target->is_character()
                 || !me->is_fighting(target) )
              return notify_fail("［慈悲字诀］只能对战斗中的对手使用。\n");

        if( extra < 160)
              return notify_fail("你的雷鸣鞭法修为太差,还不能使用慈悲字诀！\n");

        skill = me->query_skill("buddhism", 1);

        if( skill < 150)
              return notify_fail("你的禅宗心法等级不够，怎能支持慈悲字诀？ \n");

        if( me->query("shen") < 200000)
              return notify_fail("慈悲字诀需以无边正气为辅,大师还是多行善事吧! \n");

        if( me->query("neili") < 1500 )
              return notify_fail("你的内力修为不够辅助慈悲字诀。\n");

        weapon = me->query_temp("weapon");

        if( !weapon
         || weapon->query("skill_type") != "whip")
              return notify_fail("你手中没有兵器如何使用慈悲字诀。\n");
        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = RED "只见$N喃喃自语道：慈悲为怀，手中的" + weapon->name() + RED "仿佛如来出世般倒卷向$n。\n" NOR;

        at = me->query("combat_exp") * me->query_skill("leiming-bian", 1) / 1000;
        df = target->query("combat_exp") * target->query_skill("dodge", 1) / 1000;

        if( (random(at) + at / 2)  > df )
        {
            damage = me->query("shen", 1) / 2000;

            //if(damage > 1500) damage = 1500 + (damage-1500)/100;
            if(damage > 1500) damage = 1500; //设定上限 2017-02-03

            msg += CYN "$n不禁被$N的无边佛法打动，猛的后退，脸上没有一丝血色...\n" NOR;
            target->receive_damage("qi", damage, me);
            target->receive_wound("qi", damage / 3, me);

            p = (int)target->query("qi") * 100 / (int)target->query("max_qi");
            msg += "( $n" + eff_status_msg(p) + " )\n";
            message_vision(msg, me, target);
            target->start_busy(3);

            weapon = me->query_temp("weapon");
            msg = HIG "\n紧接着$N手中的" + weapon->name() + HIG "连续晃动，竟然不知道有多少击。\n" NOR;
            message_vision(msg,me,target);

            lmt = random(me->query_skill("leiming-bian", 1) / 50) + 1;
            if ( lmt < 3 ) lmt = 3;
            if ( lmt > 6 ) lmt = 6;

            for(i=1;i <= lmt;i++)
            {
                 extra = me->query_skill("leiming-bian", 1);
                 me->add_temp("apply/attack", extra / 5);
                 me->add_temp("apply/damage", extra / 5);
                 COMBAT_D->do_attack(me,target, me->query_temp("weapon"), 1);
                 me->add_temp("apply/attack",-extra / 5);
                 me->add_temp("apply/damage",-extra / 5);
            }
            me->add("neili",-300);
            me->start_busy(random(2) + 2);
        } else
       {
              msg = HIG "\n$n左躲右闪，强$N的攻击完全化于无形！\n" NOR;
              message_vision(msg,me,target);
              me->add("neili",-200);
              me->start_busy(random(2));
       }
        return 1;
}
