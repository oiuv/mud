#include <ansi.h>
#include <combat.h>

#define ZHEN "「" HIW "蟾震九天" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int skill, ap, dp, damage, poison, hamagong_effect;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("蛤蟆功" ZHEN "只能对战斗中的对手使用。\n");

        skill = me->query_skill("hamagong", 1);
		poison = me->query_skill("poison", 1);

        if (skill < 240)
                return notify_fail("你的蛤蟆功修为不够精深，不能使用" ZHEN "！\n");

        if (me->query("max_neili") < 4000)
                return notify_fail("你的内力修为不够深厚，无法施展" ZHEN "！\n");

        if (me->query("neili") < 800)
                return notify_fail("你的真气不够，无法运用" ZHEN "！\n");

        if (me->query_skill("strike") < 200)
                return notify_fail("你的掌法不够娴熟，无法施展" ZHEN "！\n");

        if( me->query_temp("weapon") )
                return notify_fail("你必须空手才能使用" ZHEN "！\n");

        if (me->query_skill_prepared("strike") != "hamagong" ||
            me->query_skill_mapped("strike") != "hamagong")
                return notify_fail("你必须先将蛤蟆功运用于掌法之中，才能运用" ZHEN "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIB "$N身子蹲下，左掌平推而出，使的正是$N生平最得意的「蟾震九天」绝招，掌风直逼$n而去！\n" NOR;
        message_combatd(msg, me, target);

        ap = me->query_skill("force");
        dp = (target->query_skill("force") + target->query_skill("parry") + target->query_skill("dodge") + target->query_skill("yiyang-zhi") ) / 3;

		damage = ap;
		
		if(skill > 500)
			damage += poison;
		else
			damage += poison * skill / 500;

		if(me->query_temp("reverse"))
		        hamagong_effect = (int)(skill / 20);
		else
			    hamagong_effect = (int)(skill / 30);

        if (ap * 2 / 3 + random(ap) > dp)
        {
			    damage += random(damage / 2);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50 + random(hamagong_effect),
                                           HIR "$n" HIR "不料$N会使出如此诡异招式，慌忙伸掌抵挡，"
                                               "结果$N蛤蟆功内劲不断袭入，$n全身顿时感到一阵撕裂般的痛苦。\n" NOR);
        }else
        {
                msg = HIY "可是$n发觉一股微风扑面而来，却已被逼得呼吸不畅，情知不妙，连忙跃开数尺。\n" NOR;
        }
        message_combatd(msg, me, target);

        msg = HIB "$N左掌劲力未消，右掌也跟着推出，功力相叠，" ZHEN "掌风排山倒海般涌向$n！\n"NOR;
        message_combatd(msg, me, target);
	   
        if (ap * 3 / 5 + random(ap) > dp)
        {
			    damage += random(damage / 2);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60 + random(hamagong_effect),
                                           HIR "$n" HIR "只觉此招，阴柔无比，诡异莫测，"
                                               "心中一惊，却猛然间觉得一股阴风透骨而过。\n" NOR);
        }else
        {
                msg = HIY "$n喘息未定，又觉一股劲风扑面而来，连忙跃开数尺，狼狈地避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        msg = HIB "$N双腿一蹬，双掌相并向前猛力推出，$n连同身前方圆三丈全在" ZHEN "劲力笼罩之下！\n"NOR;
        message_combatd(msg, me, target);

         if (ap * 11 / 20 + random(ap) > dp)
        {
			    damage += random(damage);
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 70 + random(hamagong_effect),
                                           HIR "$n" HIR "全然无力阻挡，竟被$N" HIY "双掌击得飞起，重重的跌落在地上。\n" NOR);
        }else
        {
                msg = HIY "$n用尽全身力量向右一纵一滚，摇摇欲倒地站了起来，但总算躲开了这致命的一击！\n" NOR;
        }
        message_combatd(msg, me, target);

        me->start_busy(3 + random(4));
        me->add("neili", -400 - random(400));

        return 1;
}

