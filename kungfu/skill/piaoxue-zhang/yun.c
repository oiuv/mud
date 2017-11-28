#include <ansi.h>
#include <combat.h>

#define YUN "「" HIW "云海明灯" NOR "」"

inherit F_SSERVER; 
 
int perform(object me, object target)
{
	object weapon;
	string msg;
 
        if (userp(me) && ! me->query("can_perform/piaoxue-zhang/yun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me); 
        
        if (! target || ! me->is_fighting(target)) 
                return notify_fail(YUN "只能在战斗中对对手使用。\n");
         
        if (me->query_temp("weapon") || 
            me->query_temp("secondary_weapon")) 
                return notify_fail("你必须空手才能施展" YUN "。\n");
         
        if (me->query_skill("force") < 200) 
                return notify_fail("你的内功的修为不够，无法施展" YUN "。\n");
        
        if (me->query_skill("piaoxue-zhang", 1) < 150) 
                return notify_fail("你的飘雪穿云掌修为不够，无法施展" YUN "。\n");
         
        if (me->query("neili") < 200 || me->query("max_neili") < 2000) 
                return notify_fail("你的真气不够，无法施展" YUN "。\n");

        if (me->query_skill_mapped("strike") != "piaoxue-zhang") 
                return notify_fail("你没有激发飘雪穿云掌，无法施展" YUN "。\n");

        if (me->query_skill_prepared("strike") != "piaoxue-zhang")
                return notify_fail("你没有准备使用飘雪穿云掌，无法施展" YUN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "一声暴喝，陡然施出飘雪穿云掌绝技「云海明灯」，瞬"
              "间连续攻出数招。\n" NOR;
	message_combatd(msg, me);

	me->add("neili", -100);

        // 第一招
        me->add_temp("apply/attack", 30);
      	COMBAT_D->do_attack(me, target, weapon, 0);

        // 第二招
        me->add_temp("apply/attack", 60);
	COMBAT_D->do_attack(me, target, weapon, 0);

        // 第三招
        me->add_temp("apply/attack", 90);
	COMBAT_D->do_attack(me, target, weapon, 0);

        // 消除攻击修正
        me->add_temp("apply/attack", -180);

	me->start_busy(2 + random(3));

	return 1;
}
