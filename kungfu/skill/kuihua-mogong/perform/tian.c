// wu.c 无法无天
// 武器或者空手，手里拿剑或者针都可以

#include <ansi.h>

inherit F_SSERVER;

#define WU "「" HIC "无法无天" NOR "」"
 
int perform(object me, object target)
{
        object weapon;
        string msg;
        int count;
        int lvl;
        int i;
 
        if (userp(me) && ! me->query("can_perform/kuihua-mogong/tian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(WU "只能对战斗中的对手使用。\n");
 
	if (me->query("neili") < 340)
		return notify_fail("你的真气不够，无法施展" WU "！\n");

	if ((lvl = me->query_skill("kuihua-mogong", 1)) < 220)
		return notify_fail("你的葵花魔功火候不够，无法施展" WU "！\n");

        if (me->query_skill_mapped("force") != "kuihua-mogong")
                return notify_fail("你还没有激发葵花魔功为内功，无法施展" WU "。\n");  

        if ((int)me->query("max_neili") < 3400)
                return notify_fail("你的内力修为不足，难以施展" WU "。\n");

        if (weapon = me->query_temp("weapon"))
        {
                if (weapon->query("skill_type") != "sword" &&
                    weapon->query("skill_type") != "pin")
                        return notify_fail("你手里拿的不是剑，怎么施"
                                           "展" WU "？\n");
        } else
        {
                if (me->query_skill_prepared("unarmed") != "kuihua-mogong")
                        return notify_fail("你并没有准备使用葵"
                                           "花魔功，如何施展" WU "？\n");
        }

        if (weapon && me->query_skill_mapped("sword") != "kuihua-mogong")
                return notify_fail("你没有准备使用葵花魔功，难以施展" WU "。\n");

        if (! weapon && me->query_skill_prepared("unarmed") != "kuihua-mogong")
                return notify_fail("你没有准备使用葵花魔功，难以施展" WU "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "默运葵花魔功，身形变得奇快无比，接连从不同的方位向$n"
              HIR "攻出数招！\n" NOR;
        i = 6  + random(5);	// 取消连招数判定条件，固定连击6~10次 BY MK
        if (lvl * 11 / 20 + random(lvl) > (int)target->query_skill("dodge", 1))
        {
                msg += HIR "$n" HIR "只觉得眼前一花，发现四周都是$N"
                       HIR "的身影，不由暗生惧意，接连后退。\n" NOR;
                count = me->query_skill("kuihua-mogong", 1) / 4;
                me->add_temp("apply/attack", count);
                //增强伤害
                me->add_temp("apply/damage", count);
                me->add_temp("apply/unarmed_damage", count);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "身法好快，哪里"
                       "敢怠慢，连忙打起精神小心应对。\n" NOR;
                count = 0;
        }

	message_combatd(msg, me, target);
	me->add("neili", -i * 30);

        while (i--)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(2) && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->add_temp("apply/damage", -count);
        me->add_temp("apply/unarmed_damage", -count);
	me->start_busy(1 + random(4));
	return 1;
}
