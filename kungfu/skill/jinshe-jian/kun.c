#include <ansi.h>
#include <combat.h>

#define HUI "「" HIG "蛇困愁城" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int level;

        if (userp(me) && ! me->query("can_perform/jinshe-jian/kun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUI "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" HUI "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        level = me->query_skill("jinshe-jian", 1);

        if (level < 140)
		return notify_fail("你金蛇剑法不够娴熟，难以施展" HUI "。\n");

        if (me->query_skill_mapped("sword") != "jinshe-jian")
                return notify_fail("你没有激发金蛇剑法，难以施展" HUI "。\n");

        if (me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" HUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "\n$N" HIG "轻叹一声，手中" + weapon->name() + HIG "犹如"
              "金蛇般的缠向$n" HIG "。\n" NOR;

        message_sort(msg, me, target);

        me->add("neili", -140);
        if (level / 2 + random(level) > target->query_skill("dodge", 1))
        {
		msg = HIY "一道金光闪过，$n已被$N" HIY "攻的目不暇接，手忙脚乱！\n" NOR;
                target->start_busy(1 + random(level / 13));
                me->start_busy(1);
	} else
        {
		msg = CYN "可是$n" CYN "看破了$N"
                      CYN "的企图，镇定解招，一丝不乱。\n" NOR;
                me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
