#include <ansi.h>
#include <combat.h>

#define BING "「" HIW "寒冰环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg, wn;
        object weapon;
        int level;

        if (userp(me) && ! me->query("can_perform/poguang-dao/bing"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BING "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对，难以施展" BING "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("poguang-dao", 1) < 100)
                return notify_fail("你破光刀法不够娴熟，难以施展" BING "。\n");

        if (me->query_skill_mapped("blade") != "poguang-dao")
                return notify_fail("你没有激发破光刀法，难以施展" BING "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" BING "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" BING "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIC "\n$N" HIC "将" + wn + HIC "反手一转，内力运于其上，施出"
              "绝招「" HIW "寒冰环" HIC "」，猛然间身法忽地加快，" + wn + HIC
              "透出阵阵寒气，连连挥出，将$n" HIC "笼罩在寒气之中。" NOR;
        message_sort(msg, me, target);

        level = me->query_skill("sword");

        me->add("neili", -120);

        if (level * 2 / 3 + random(level) > target->query_skill("dodge"))
        {
		msg = HIY "$N" HIY "看不出$n" HIY "招式中的虚实，连忙"
                      "护住自己全身，一时竟无以应对！\n" NOR; 
                target->start_busy(2 + random(level / 24));
                me->start_busy(random(2));
	} else
        {
		msg = CYN "可是$N" CYN "镇定自若，小心拆招，没有被"
                      "$n" NOR + CYN "招式所困。\n" NOR;
                      
                me->start_busy(2);
	}
	message_combatd(msg, target, me);

	return 1;
}