#include <ansi.h>
#include <combat.h>

#define LUO "「" HIR "一剑落九雁" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int i, count;

        if (userp(me) && ! me->query("can_perform/luoyan-jian/luo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
                return notify_fail(LUO "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你所使用的武器不对，难以施展" LUO "。\n");

	if ((int)me->query_skill("luoyan-jian", 1) < 150)
		return notify_fail("你的回风落雁剑不够娴熟，难以施展" LUO "。\n");

        if (me->query_skill_mapped("sword") != "luoyan-jian")
                return notify_fail("你没有激发回风落雁剑法，难以施展" LUO "。\n");

	if (me->query("neili") < 400)
		return notify_fail("你目前的真气不够，难以施展" LUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "\n$N" HIW "蓦的一声清啸，施出衡山派绝学「" HIR "一剑落九雁"
              HIW "」，手中" + weapon->name() + HIW "青光荡漾。霎时间回风"
              "落雁剑剑招连绵涌出，有如神助，剑气笼罩$n" HIW "四方。" NOR;

        message_sort(msg, me, target);

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");

	if (ap / 2 + random(ap) > dp)
	{
		msg = HIY "$n" HIY "见$P" HIY "剑势汹涌，寒意顿生，竟"
                      "被逼得连连后退，狼狈不已。\n" NOR;
                count = me->query_skill("luoyan-jian") / 40;
        } else
        {
                msg = HIC "$n" HIC "见$N" HIC "这几剑来势迅猛无比，毫"
                      "无破绽，只得小心应付。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        me->add("neili", -200);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 9; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
        me->start_busy(1 + random(9));
        return 1;
}
