#include <ansi.h>
#include <combat.h>

#define FENG "「" HIW "飞剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg, wn;
        object weapon;
        int level;

        if (userp(me) && ! me->query("can_perform/xiaoyao-jian/fei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对，难以施展" FENG "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("xiaoyao-jian", 1) < 60)
                return notify_fail("你逍遥剑法不够娴熟，难以施展" FENG "。\n");

        if (me->query_skill_mapped("sword") != "xiaoyao-jian")
                return notify_fail("你没有激发逍遥剑法，难以施展" FENG "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" FENG "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" FENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIC "\n$N" HIC "陡然身法奇快，剑法灵动无比，手中" + wn + HIC "犹"
              "如脱手飞旋一般，将$n" HIC "周身笼罩。\n" NOR;

        message_sort(msg, me, target);

        level = me->query_skill("sword");

        me->add("neili", -120);

        if (level * 2 / 3 + random(level) > target->query_skill("dodge"))
        {
		msg = HIY "$N" HIY "看不出$n" HIY "招式中的虚实，连忙"
                      "护住自己全身，一时竟无以应对！\n" NOR; 
                target->start_busy(4 + random(level / 25));
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