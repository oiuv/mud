#include <ansi.h>

inherit F_DBASE;
inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage, club;
        
        if (userp(me) && !me->query("can_perform/weituo-chu/jishi"))
                return notify_fail("你还不会使用「即世即空」!\n");

        if( !target && me->is_fighting() ) target = offensive_target(me);

        if( !target
        ||  !target->is_character()
        ||  !me->is_fighting(target) )
                return notify_fail("「即世即空」只能对战斗中的对手使用。\n");

        if( !objectp(weapon = me->query_temp("weapon")) 
           || weapon->query("skill_type") != "staff" )
                return notify_fail("你手中无杵，怎能运用「即世即空」？！\n");

        if( me->query_temp("sl_leidong") )
                return notify_fail("你刚使完「即世即空」，目前气血翻涌，无法再次运用！\n");
        
        if( (int)me->query_skill("weituo-chu", 1) < 120)
                return notify_fail("你韦陀杵修为还不够，还未能使用「即世即空」！\n");

        if( me->query_skill("force", 1) < 120 )
                return notify_fail("你的内功修为火候未到，施展只会伤及自身！\n");                             
      
        if( me->query("max_neili") <= 1500 )
                return notify_fail("你的内力修为不足，劲力不足以施展「即世即空」！\n");

        if( me->query("neili") <= 600 )
                return notify_fail("你的内力不够，劲力不足以施展「即世即空」！\n");

        message_vision(BLU "\n突然$N大喝一声：「即世即空」，面色唰的变得通红，须发皆飞，真气溶入" + 
                           weapon->name() + BLU "当中，“嗡”的一声，发出" HIW " 闪闪光亮 " BLU "！\n " NOR, me);
        
        damage = me->query_skill("weituo-chu", 1) + me->query_skill("buddhism",1);
        damage /= 6;
        club = me->query_skill("staff") / 3;
        
        if ( userp(me) ) 
        {
                me->add("neili", -300);
                me->start_busy(1);
                if ( damage > weapon->query("weapon_prop/damage") * 2)
                     damage = weapon->query("weapon_prop/damage") * 2;
                else weapon->add("rigidity", 1);
        }

        me->set_temp("sl_leidong", 1); 
        me->add_temp("apply/damage", damage);
        me->add_temp("apply/attack", damage);
        
        call_out("remove_effect1", club/2, me, weapon, damage);
        call_out("remove_effect2", club * 2/3, me);
        me->start_perform(club * 2 / 6, "「即世即空」");

        return 1;
}

void remove_effect1(object me, object weapon, int damage) 
{
        if (!me) return;
        me->add_temp("apply/attack", -damage);  

        if (!weapon) {
                me->set_temp("apply/damage", 0);
                return;
        }
        me->add_temp("apply/damage", -damage);
        message_vision(HIY "\n$N一套「即世即空」使完，手中"NOR + weapon->name() + HIY"上的光芒渐渐也消失了。\n"NOR, me);                
}

void remove_effect2(object me)
{
        if (!me) return;
        me->delete_temp("sl_leidong");
        tell_object(me, HIG "\n 你经过一段时间调气养息，又可以使用「即世即空」了。\n"NOR); 
}

