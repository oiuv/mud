#include <ansi.h> 
#include <combat.h> 

#define HONG "「" HIR "红霞贯日" NOR "」" 

inherit F_SSERVER; 

int perform(object me, object target) 
{
        int skill, ap, dp, damage; 
        string msg; 

        //if (userp(me) && ! me->query("can_perform/yecha-gun/hongxia")) 
        //        return notify_fail("你所使用的外功中没有这种功能。\n"); 

        if (! target) 
        { 
                me->clean_up_enemy(); 
                target = me->select_opponent(); 
        }

        if (! target || ! me->is_fighting(target)) 
                return notify_fail(HONG "只能对战斗中的对手使用。\n"); 

        skill = me->query_skill("yecha-gun", 1);
 
        if (skill < 120) 
                return notify_fail("你的夜叉棍法等级不够，难以施展" HONG "。\n"); 

        if (me->query("neili") < 200) 
                return notify_fail("你的真气不够，难以施展" HONG "。\n"); 

        if (me->query_skill_mapped("club") != "yecha-gun") 
                return notify_fail("你没有激发夜叉棍法，难以施展" HONG "。\n"); 

        if (target->is_busy()) 
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n"); 

        if (! living(target)) 
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n"); 

        msg = HIR "$N" HIR "身形曼妙，手中铁棍" HIR "虚虚实实，舞出无数的棍影" 
              "宛若满天的红霞，将$n重重包围。\n" NOR; 
        
        me->add("neili", -50); 

        ap = me->query_skill("club"); 
        dp = target->query_skill("parry"); 

        if (ap / 2 + random(ap * 4 / 3) > dp) 
        {
                me->add("neili", -150); 
                damage = ap / 6 + random(ap / 6); 
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30, 
                                           HIR "$n" HIR "只觉$N" HIR "棍影重重，" 
                                           "无所不在，自己无处躲闪，顿时身上" 
                                           "连中数棍，被攻了个措手不及。\n" NOR); 

                me->start_busy(1); 
                if (ap / 2 + random(ap) > dp && ! target->is_busy()) 
                        target->start_busy(ap / 30 + 2); 
        } else 
        {
                msg += CYN "$n" CYN "只见$N" CYN "看破了棍法中的虚实，凝神" 
                       "化解开来。\n" NOR; 
                me->add("neili", -80); 
                me->start_busy(3); 
        } 
        message_combatd(msg, me, target);  

        return 1; 
}

