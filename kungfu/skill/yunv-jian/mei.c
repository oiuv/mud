#include <ansi.h>
#include <combat.h>

#define MEI "「" HIM "千姿百媚" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg, wn;
        object weapon;
        int level;
  
        me = this_player();

        if (userp(me) && ! me->query("can_perform/yunv-jian/mei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(MEI "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" MEI "。\n");

        if ((int)me->query_skill("yunv-jian", 1) < 40)
                return notify_fail("你玉女剑法不够娴熟，难以施展" MEI "。\n");

        if (me->query_skill_mapped("sword") != "yunv-jian")
                return notify_fail("你没有激发玉女剑法，难以施展" MEI "。\n");

        if ((int)me->query_skill("dodge") < 60)
                return notify_fail("你的轻功修为不够，难以施展" MEI "。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你现在的真气不够，难以施展" MEI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        wn = weapon->name();
                           
        msg = HIC "\n$N" HIC "陡然间姿态万千，身法飘逸，犹如一个婀娜"
              "多姿的女子在随歌漫舞一样。但是$N手中" + wn + HIC "却"
              "跟随着身体轻盈地晃动，看似毫无章法，却又像是隐藏着厉"
              "害的招式。" NOR;

        message_sort(msg, me, target);

        level = me->query_skill("yunv-jian", 1);
        me->add("neili", -50);
        if (level / 2 + random(level) > target->query_skill("dodge", 1))
        {
		msg = HIY "$N" HIY "看不出$n" HIY "招式中的虚实，连忙"
                      "护住自己全身，一时竟无以应对！\n" NOR; 
                target->start_busy(2 + random(level / 24));
                me->start_busy(random(2));
	} else
        {
		msg = CYN "可是$N" CYN "看出了$n" CYN "这招乃虚招，顿"
                      "时一丝不乱，镇定自若。\n" NOR;
                      
                me->start_busy(2);
	}
	message_combatd(msg, target, me);

	return 1;
}


