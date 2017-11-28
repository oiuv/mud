// lingkong

#include <ansi.h>

inherit F_SSERVER;

#define LING "「" HIW "凌空指穴" NOR "」" 

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        //if (userp(me) && ! me->query("can_perform/qufannao-zhi/lingkong"))   
        //        return notify_fail("你所使用的外功中没有这种功能。\n");   

        if( !target ) target = offensive_target(me);

        if( !target || !target->is_character() || !me->is_fighting(target) )
                return notify_fail(LING "只能对战斗中的对手使用。\n");

        if( objectp(me->query_temp("weapon")) )
                return notify_fail("你必须空手才能使用" LING "！\n");           

        if( (int)me->query_skill("qufannao-zhi", 1) < 100 )
                return notify_fail("你的去烦恼指不够娴熟，不会使用" LING "。\n");

        if( (int)me->query_skill("hunyuan-yiqi", 1) < 100 )
                return notify_fail("你的心意气混元功不够高，不能用内力催动指力伤敌。\n");

        if( (int)me->query("neili", 1) < 300 )
                return notify_fail("你现在内力太弱，不能使用" LING "。\n");

        msg = CYN "$N默念佛经，只见手指微动，几道指气急射向$n，意欲以指力击晕$n。\n"NOR;

        ap = me->query_skill("force", 1) + me->query_skill("finger", 1) + 
             me->query_skill("qufannao-zhi", 1) + me->query("neili", 1) / 50;
        dp = target->query_skill("force", 1) + target->query_skill("dodge", 1) +
             target->query_skill("parry", 1);
        if (random(ap) + random(ap / 3) > dp )
        {
                me->start_busy(3);
                target->start_busy(random(3));
                
                damage = (int)me->query_skill("qufannao-zhi", 1);
                
                damage = damage / 2 + random(damage);
                
                target->receive_damage("qi", damage);
                target->receive_wound("qi", damage / 6);
                me->add("neili", -damage / 6);
                
                if( damage < 100 )
                        msg += HIY "$n受到$N的指力透击，闷哼一声，看上去很是疲惫。\n" NOR;
                
                else if( damage < 300 )
                        msg += HIY "$n被$N的指力反击，只觉得胸中烦闷，只想好好休息休息。\n" NOR;
        
                else if( damage < 500 )
                        msg += RED "$n被$N以指力一震，脑中嗡嗡作响，意识开始模糊起来！\n" NOR;
                else
                        msg += HIR "$n被$N的指力一震，眼前一黑，向后便倒，眼看就要不醒人事了！\n" NOR;
                
        }
        else 
        {
                me->start_busy(4);
                msg += CYN "可是$p看破了$P的企图，并没有上当。\n" NOR;
        }
        message_vision(msg, me, target);

        return 1;
}

