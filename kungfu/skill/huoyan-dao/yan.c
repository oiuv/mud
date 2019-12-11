#include <ansi.h>
#include <combat.h>

#define YAN "「" HIR "天寰神炎" NOR "」"

inherit F_SSERVER; 
 
int perform(object me, object target)
{
	object weapon;
	string msg;
 
        if (userp(me) && ! me->query("can_perform/huoyan-dao/yan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me); 
        
        if (! target || ! me->is_fighting(target)) 
                return notify_fail(YAN "只能在战斗中对对手使用。\n");
         
        if (me->query_temp("weapon") || 
            me->query_temp("secondary_weapon")) 
                return notify_fail("你必须空手才能施展" YAN "。\n");
         
        if (me->query_skill("force") < 200) 
                return notify_fail("你的内功的修为不够，无法施展" YAN "。\n");
        
        if (me->query_skill("huoyan-dao", 1) < 150) 
                return notify_fail("你的火焰刀修为不够，无法施展" YAN "。\n");
         
        if (me->query("neili") < 600 || me->query("max_neili") < 2000) 
                return notify_fail("你的真气不够，无法施展" YAN "。\n");

        if (me->query_skill_mapped("strike") != "huoyan-dao") 
                return notify_fail("你没有激发火焰刀，无法施展" YAN "。\n");

        if (me->query_skill_prepared("strike") != "huoyan-dao")
                return notify_fail("你没有准备火焰刀，无法施展" YAN "。\n");

        if (me->query_skill_prepared("hand") == "dashou-yin")
                return notify_fail("施展" YAN "时火焰刀不宜和密宗大手印互背！\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "一声怒嚎，狂催真气注入单掌，掌缘顿时腾起一道烈炎，接二连三朝$n"
              HIR "劈去。\n" NOR;
        message_combatd(msg, me, target);

	me->add("neili", -500);

        me->add_temp("apply/attack", 10);
      	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 10);
	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 10);
	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 10);
	COMBAT_D->do_attack(me, target, weapon, 0);

        me->add_temp("apply/attack", 10);
	COMBAT_D->do_attack(me, target, weapon, 0);

        // 消除攻击修正
        me->add_temp("apply/attack", -50);

	me->start_busy(3 + random(2));

	return 1;
}
