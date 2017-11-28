// jianzhang.c  剑掌五连环

#include <ansi.h>

inherit F_SSERVER;

#define LIAN "「" HIW "剑掌五连环" NOR "」"
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;
	int count;
 
        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

        if (userp(me) && ! me->query("can_perform/huashan-jian/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(LIAN "只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对！\n");

	if ((int)me->query("neili") < 160)
		return notify_fail("你的真气不够，无法施展" LIAN "！\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够，难以施展" LIAN "！\n");

	if ((int)me->query_skill("huashan-jian", 1) < 50)
		return notify_fail("你的华山剑法还不到家，无法施展" LIAN "！\n");

        if (me->query_skill_mapped("sword") != "huashan-jian")
                return notify_fail("你没有激发华山剑法，无法施展" LIAN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "使出华山派绝技「" HIW "剑掌五连环" HIY"」，身法陡然加快！\n" NOR;
	message_combatd(msg, me);
	me->add("neili", -120);

	count = me->query_skill("sword") / 10;
	me->add_temp("apply/attack", count);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                if (! target->is_busy() && random(3) == 1)
                        target->start_busy(1);
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->add_temp("apply/attack", -count);
	me->start_busy(1 + random(3));
	return 1;
}
