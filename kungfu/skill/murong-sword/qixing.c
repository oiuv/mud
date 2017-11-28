// beidou.c  北斗七星剑

#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
	object weapon;
        string msg;
        int i;
 
        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("「北斗七星剑」只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("施展「北斗七星剑」手中必须拿着一把剑！\n");

	if ((int)me->query("neili") < 220)
		return notify_fail("你的真气不够，无法施展「北斗七星剑」！\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功火候不够，无法施展「北斗七星剑」！\n");

	if ((int)me->query_skill("sword") < 150)
		return notify_fail("你的慕容剑法还不到家，无法使用绝技「北斗七星剑」！\n");

        if (me->query_skill_mapped("sword") != "murong-sword")
                return notify_fail("你没有激发慕容剑法，无法使用「北斗七星剑」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "$N" HIM "使出慕容家绝技「北斗七星剑」，手中" + weapon->name() +
              HIM "暗合北斗七星方位，忽伸忽缩，变化莫测！\n" NOR;

	message_combatd(msg, me);
	me->add("neili", -140);

        for (i = 0; i < 7; i++)
        {
                if (! me->is_fighting(target))
                        break;
        	COMBAT_D->do_attack(me, target, weapon, 0);
        }

	me->start_busy(1 + random(7));

	return 1;
}
