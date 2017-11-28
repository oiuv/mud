#include <ansi.h>
#include <combat.h>

#define KUANG "「" HIY "狂风绝技" NOR "」"

inherit F_SSERVER;
 
int perform(object me, object target)
{
	//object weapon;
    string msg;
	int i;

        if (userp(me) && ! me->query("can_perform/xuanfeng-tui/kuang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target)
	{
		me->clean_up_enemy();
	        target = me->select_opponent();
	}

        if (! target || ! me->is_fighting(target))
                return notify_fail(KUANG "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(KUANG "只能空手施展。\n");

        if ((int)me->query_skill("xuanfeng-tui", 1) < 100)
                return notify_fail("你旋风扫叶腿不够娴熟，难以施展" KUANG "。\n");

        if ((int)me->query_skill("xuanfeng-tui", 1) < 100)
                return notify_fail("你的旋风扫叶腿不够娴熟，难以施展" KUANG "。\n");

        if (me->query_skill_mapped("unarmed") != "xuanfeng-tui")
                return notify_fail("你没有激发旋风扫叶腿，难以施展" KUANG "。\n");

        if (me->query_skill_prepared("unarmed") != "xuanfeng-tui")
                return notify_fail("你没有准备旋风扫叶腿，难以施展" KUANG "。\n");

        if (me->query("neili") < 300)
                return notify_fail("你的真气不够，难以施展" KUANG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "使出桃花岛狂风绝技，身法飘忽不定，足带风尘，掌携"
              "万钧，有若天仙！\n" NOR;
	message_combatd(msg, me);
	me->add("neili", -100);

	for (i = 0; i < 6; i++)
	{
		if (! me->is_fighting(target))
			break;
                if (random(3) == 0 && ! target->is_busy())
                        target->start_busy(1);
		COMBAT_D->do_attack(me, target, 0, 0);
	}

	me->start_busy(1 + random(6));
	return 1;
}
