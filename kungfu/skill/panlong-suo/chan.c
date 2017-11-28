#include <ansi.h>

#define CHAN "「" HIM "跗骨缠魂" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
        object weapon;
        string msg;

        if (userp(me) && ! me->query("can_perform/panlong-suo/chan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(CHAN "只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" CHAN "。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

	if ((int)me->query_skill("force") < 180)
		return notify_fail("你的内功火候不够，难以施展" CHAN "。\n");

	if ((int)me->query_skill("panlong-suo", 1) < 120)
		return notify_fail("你的霹雳盘龙索还不到家，难以施展" CHAN "。\n");

        if (me->query_skill_mapped("whip") != "panlong-suo")
                return notify_fail("你没有激发霹雳盘龙索，难以施展" CHAN "。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的真气不够，难以施展" CHAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "$N" HIM "一声长啸，手中" + weapon->name() + HIM "一抖，登时"
              "幻化作万道紫芒向$n" HIM "身上猛套过去。\n" NOR;

        if (random(me->query_skill("whip")) > target->query_skill("parry") / 2)
        {
        	msg += HIR "霎时$n" HIR "只觉" + weapon->name() + HIR
                       "压力不断增加，便如跗骨之蛆，挥之不去。\n" NOR;
                target->start_busy((int)me->query_skill("panlong-suo") / 20 + 1);
	        me->add("neili", -80);
	        me->start_busy(1);
        } else
	{
                msg += CYN "可是$n" CYN "小心应对，丝毫不受迷惑，纵身"
                       "跃出了$N" CYN "的笼罩。\n" NOR;
	        me->add("neili", -30);
	        me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}
