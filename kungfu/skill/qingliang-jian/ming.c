#include <ansi.h>  
#include <combat.h>  
 
#define SHENG "「" HIW "禅心自明" NOR "」"  
 
inherit F_SSERVER;  
 
int perform(object me, object target)  
{  
        object weapon;  
        string msg;  
        int ap, dp;  
        int damage;  
  
        if (! target) target = offensive_target(me);  
 
        if (! target || ! me->is_fighting(target))  
                return notify_fail(SHENG "只能在战斗中对对手使用。\n");  
 
 
        if (! objectp(weapon = me->query_temp("weapon")) ||  
            (string)weapon->query("skill_type") != "sword")  
                return notify_fail("你使用的武器不对，难以施展" SHENG "。\n");  
 
        if (me->query_skill("force") < 100)  
                return notify_fail("你的内功的修为不够，难以施展" SHENG "。\n");  
 
        if (me->query_skill("qingliang-jian", 1) < 80)  
                return notify_fail("你的清凉剑法修为不够，难以施展" SHENG "。\n");  
 
        if (me->query_skill_mapped("sword") != "qingliang-jian")  
                return notify_fail("你没有激发清凉剑法，难以施展" SHENG "。\n");  
 
        if (me->query("neili") < 80)  
                return notify_fail("你现在真气不够，难以施展" SHENG "。\n");  
 
        if (! living(target))  
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");  
 
        msg = HIW "$N" HIW "一抖手中" + weapon->name() + HIW "闪出无数个剑花，同时向$n"      HIW "刺去。\n" NOR;  
        ap = me->query_skill("sword");  
        dp = target->query_skill("parry");  
 
        if (ap * 2 / 3 + random(ap) > dp)  
        { 
                damage = ap / 3 + random(ap / 2);  
                me->add("neili", -40);  
                me->start_busy(2);  
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 20,  
                                           HIR "$n" HIR "看的头昏眼花，不知虚实，登时$n"  
                                           HIR "身上几处受伤！\n" NOR);  
        } else  
        { 
                me->add("neili", -20);  
                me->start_busy(3);  
                msg += CYN "可是$p" CYN "看破其中虚实，轻轻架开了$P"  
                       CYN "的剑招。\n"NOR;  
        } 
 
        message_combatd(msg, me, target);  
         
        return 1;  
} 

