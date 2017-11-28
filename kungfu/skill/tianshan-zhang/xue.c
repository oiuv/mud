// xue.c 冰雪纷飞

#include <ansi.h>

inherit F_SSERVER;

#define XUE "「" HIW "冰雪纷飞" NOR "」"
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;

       if (userp(me) && ! me->query("can_perform/tianshan-zhang/fugu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");
 
        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(XUE "只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "staff")
		return notify_fail("你使用的武器不对！\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的真气不够！\n");

	if ((int)me->query_skill("force", 1) < 100)
		return notify_fail("你的基本内功火候不够！\n");

	if ((int)me->query_skill("tianshan-zhang", 1) < 100)
		return notify_fail("你的天山杖法还不到家，无法使用" XUE "！\n");

        if (me->query_skill_mapped("staff") != "tianshan-zhang")
                return notify_fail("你没有激发天山杖法，使不了" XUE "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "使出星宿绝技「冰雪纷飞」，招式变得诡秘异常！\n" NOR;
	message_combatd(msg, me);
	me->add("neili", -120);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(3));
	return 1;
}
