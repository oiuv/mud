#include <ansi.h>
#include <combat.h>

#define QIAN "「" HIW "千掌环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int attack_time, i;

        if (userp(me) && ! me->query("can_perform/yinyang-zhang/qian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QIAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(QIAN "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("yinyang-zhang", 1) < 100)
                return notify_fail("你阴阳掌不够娴熟，难以施展" QIAN "。\n");

        if (me->query_skill_prepared("strike") != "yinyang-zhang")
                return notify_fail("你没有准备阴阳掌，难以施展" QIAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" QIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("dodge");

        msg = HIC "\n$N" HIC "一声长啸，将内力运于双掌之上，施出绝招"
              "「" HIW "千掌环" HIC "」，刹时间尘土漫天飞扬，$N" HIC 
              "双掌不断地连续拍出，攻势凌厉，令人不敢大意。\n" NOR;
        message_sort(msg, me, target);
        
	if (random(ap) > dp / 2)
	{
		msg = HIR "结果$n" HIR "目不暇接，顿时被$N" HIR "掌"
                      "风所困，顿时阵脚大乱。\n" NOR;
                me->add_temp("apply/attack", 60);
        } else
        {
                msg = HIY "$n" HIY "看清$N" HIY "这几招的来路，但"
                      "内劲所至，掌风犀利，也只得小心抵挡。\n" NOR;          
        }
	message_vision(msg, me, target);

        attack_time += 3 + random(ap / 40);

        if (attack_time > 6)
                attack_time = 6;

	me->add("neili", -attack_time * 20);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;
                COMBAT_D->do_attack(me, target, 0, 0);
	}
        me->add_temp("apply/attack", -50);
	me->start_busy(1 + random(attack_time));

	return 1;
}
