#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIG "阴阳环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int ap, dp;
        int count;
	int i, attack_time;

        if (userp(me) && ! me->query("can_perform/yinyang-ren/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade"))
                return notify_fail("你使用的武器不对，难以施展" HUAN "。\n");

        if (me->query_skill("yinyang-ren", 1) < 180)
                return notify_fail("你的阴阳刃法修为不够，难以施展" HUAN "。\n");

        if (me->query_skill("dodge") < 220)
                return notify_fail("你的阴阳刃法修为不够，难以施展" HUAN "。\n");

        if (me->query("neili") < 270)
                return notify_fail("你的真气不够，难以施展" HUAN "。\n");

        if (me->query_skill_mapped("sword") != "yinyang-ren"
            && me->query_skill_mapped("blade") != "yinyang-ren")
                return notify_fail("你没有激发阴阳刃法，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "长啸一声，手中" + weapon->name() + HIY "化出"
              "无数光环，猛然间光芒瀑涨，连连洒向$n" HIY "。\n" NOR;

        // 根据所激发的是sword或blade来判断ap值。
        if (me->query_skill_mapped("sword") == "yinyang-ren")
                ap = me->query_skill("sword");
        else 
                ap = me->query_skill("blade");

	dp = target->query_skill("dodge");
        attack_time = 4;

	if (ap / 2 + random(ap * 2) > dp)
	{
		msg += HIR "结果$n" HIR "被$N" HIR "攻了个措手不及，$n"
                       HIR "慌忙招架，心中叫苦。\n" NOR;
                count = ap / 12;
                attack_time += random(ap / 45);
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "$n" HIC "见$N" HIC "这几招凌厉无比，凶猛异"
                       "常，只得苦苦招架。\n" NOR;
                count = 0;
        }
	message_combatd(msg, me, target);

        if (attack_time > 8)
                attack_time = 8;

	me->add("neili", -attack_time * 20);

	for (i = 0; i < attack_time; i++)
	{
		if (! me->is_fighting(target))
			break;

	        COMBAT_D->do_attack(me, target, weapon, 0);
	}
        me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(attack_time));

	return 1;
}
