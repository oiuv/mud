#include <ansi.h>

#define CANG "「" HIW "八方藏刀势" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int count;
        int i;

        if (userp(me) && ! me->query("can_perform/hujia-daofa/cang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(CANG "只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" CANG "。\n");

	if ((int)me->query_skill("force") < 250)
		return notify_fail("你的内功火候不够，难以施展" CANG "。\n");

	if ((int)me->query_skill("hujia-daofa", 1) < 180)
		return notify_fail("你的胡家刀法还不到家，难以施展" CANG "。\n");

        if (me->query_skill_mapped("blade") != "hujia-daofa")
                return notify_fail("你没有激发胡家刀法，难以施展" CANG "。\n");

	if ((int)me->query("neili") < 200)
		return notify_fail("你的真气不够，难以施展" CANG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "轻舒猿臂，施出「战八方藏刀式」，手中的" + weapon->name() +
              HIW "吞吞吐吐，变化莫测，笼罩了$n" HIW "周身要害！\n" NOR;

        if (random(me->query_skill("blade")) > target->query_skill("parry") / 2)
        {
                msg += HIY "$n" HIY "见来招实在是变幻莫测，不由得心"
                       "生惧意，招式登时出了破绽！\n" NOR;
                count = me->query_skill("hujia-daofa", 1) / 4;
        } else
        {
                msg += HIC "$n" HIC "心底微微一惊，打起精神小心接招。\n" NOR;
                count = 0;
        }

	message_combatd(msg, me, target);
	me->add("neili", -220);
        me->add_temp("apply/attack", count);

        for (i = 0; i < 8; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (random(3) == 1 && ! target->is_busy())
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

        me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(8));
	return 1;
}
