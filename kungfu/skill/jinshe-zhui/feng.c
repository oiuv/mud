#include <ansi.h>
#include <combat.h>

#define FENG "「" HIR "截脉封穴" NOR "」"

inherit F_SSERVER;
 
int perform(object me)
{
        string msg;
        object target, anqi;
        int skill, count, ap, dp;
		
		//anqi = me->query_temp("handing");
		skill = me->query_skill("jinshe-zhui", 1);
		
		if (! objectp(anqi = me->query_temp("handing"))
           || (string)anqi->query("skill_type") != "throwing")
		{
			count = 0;
		}	else
		{
			count = anqi->query("weapon_prop/damage");
		}
				
		if (me->query_temp("jinshe/feng"))
		return notify_fail("你才用过截脉封穴，没法接着就出招。\n");

		if (! target) target = offensive_target(me);
		if (! target ||	! me->is_fighting(target))
		return notify_fail("截脉封穴只能在战斗中使用。\n");

		if (me->query_skill("force") < 150)
                return notify_fail("你的内功的修为不够，难以施展" FENG "。\n");

        if (skill < 100)
                return notify_fail("你的金蛇锥法修为有限，难以施展" FENG "。\n");

        if (me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" FENG "。\n");

        if (me->query_skill_mapped("throwing") != "jinshe-zhui")
                return notify_fail("你没有激发金蛇锥法，难以施展" FENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIR "$N" HIR "飞身一跃而起，贴至$n" HIR "跟前，点向$n" HIR "要穴！\n" NOR;

        ap = me->query_skill("throwing");
        dp = target->query_skill("force");
		
        if (ap / 2 + random(ap) > dp)
        {
			
			msg += HIR "$p" HIR "微微一楞，已被$N" HIR 
				"点中要穴，顿时瘫软无力，缓缓瘫倒。\n" NOR;
				me->add("neili", -200);
                me->start_busy(1);
				me->set_temp("jinshe/feng", 1);
				me->start_call_out((: call_other, __FILE__, "feng_end", me :), 5);
			
				switch (random(6))
				{
					case 0:
							target->add_temp("apply/damage", -skill / 6);
							break;
					
					case 1:
							target->add_temp("apply/dodge", -skill / 4);
							break;
					
					case 2:
							target->add_temp("apply/parry", -skill / 4);
							break;
					
					case 3:
							target->add_temp("apply/force", -skill / 4);
							break;
					
					case 4:
							target->add_temp("apply/armor", -skill / 4);
							break;
					
					default:
							target->add_temp("apply/defense", -skill / 4);
							break;	
				}
				
        } else
        {
                msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，巧妙的一一拆解，没露半点破绽！\n" NOR;
                me->add("neili", -50);
                me->start_busy(3);
        }
        message_combatd(msg, me, target);
		
        return 1;
}

void feng_end(object me)
{
        me->delete_temp("jinshe/feng");
}
