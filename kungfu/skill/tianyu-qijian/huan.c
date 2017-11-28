#include <ansi.h>
#include <combat.h>

#define HUAN "「" HIY "幻剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
	int i;

        if (userp(me) && ! me->query("can_perform/tianyu-qijian/huan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUAN  "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对，难以施展" HUAN "。\n");

        if ((int)me->query_skill("tianyu-qijian", 1) < 120)
                return notify_fail("你的天羽奇剑不够娴熟，难以施展" HUAN "。\n");

        if ((int)me->query_skill("force") < 160)
                return notify_fail("你的内功火候不足，难以施展" HUAN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" HUAN "。\n");
                        
        if (me->query_skill_mapped("sword") != "tianyu-qijian")
                return notify_fail("你没有激发天羽奇剑，难以施展" HUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "凝神息气，手腕疾抖，挽出千万个剑花，铺天盖地飞向$n"
              HIY "。\n" NOR;

	message_combatd(msg, me, target);
	me->add("neili", -100);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(5));

	return 1;
}
