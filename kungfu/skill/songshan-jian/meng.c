#include <ansi.h>
#include <combat.h>

#define MENG "「" HIW "如梦如幻" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg, wn;
        object weapon;
        int level;

        if (userp(me) && ! me->query("can_perform/songshan-jian/meng"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(MENG "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对，难以施展" MENG "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("songshan-jian", 1) < 40)
                return notify_fail("你嵩山剑法不够娴熟，难以施展" MENG "。\n");

        if (me->query_skill_mapped("sword") != "songshan-jian")
                return notify_fail("你没有激发嵩山剑法，难以施展" MENG "。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你现在的真气不够，难以施展" MENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIC "\n$N" HIC "怒啸一声，施展出绝招「" HIW "如梦如幻" HIC "」"
              "手中" + wn + HIC "似攻非攻，欲进忽退，令人匪夷所思。\n"NOR;

        message_sort(msg, me, target);

        level = me->query_skill("songshan-jian", 1);

        me->add("neili", -80);

        if (level + random(level) > target->query_skill("dodge"))
        {
		msg = HIY "$N" HIY "看不出$n" HIY "招式中的虚实，连忙"
                      "护住自己全身，一时竟无以应对！\n" NOR; 
                target->start_busy(2 + random(level / 26));
                me->start_busy(random(2));
	} else
        {
		msg = CYN "可是$N" CYN "镇定自若，小心拆招，没有被"
                      "$n" NOR + CYN "招式所困。\n" NOR;
                      
                me->start_busy(2);
	}
	message_vision(msg, target, me);

	return 1;
}