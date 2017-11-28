// dian.c 点字诀

#include <ansi.h>

inherit F_SSERVER;
 
int perform(object me, object target)
{
	 object weapon;
        string msg;
        int ap, dp;
 
        if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("「点字诀」只能对战斗中的对手使用。\n");
 
	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "staff")
		return notify_fail("运用「点字诀」手中必须持杖！\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够！\n");

	if ((int)me->query_skill("staff") < 150)
		return notify_fail("你的杖法还不到家，无法使用「点字诀」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "$N" HIG "手中的" + weapon->name() +
              HIG "忽然变得诡秘异常，忽伸忽缩，笼罩了$n" HIG "多处大穴！\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("dodge");
        if (ap / 2 + random(ap) > dp)
	{
              msg += HIY "$n" HIY "大惊之下，慌忙抵挡，一时间无暇反击！\n" NOR;
		target->start_busy(ap / 27 + 2);
	} else 
	{
		msg += HIC "可是$p" HIC "身法灵动，躲开了$n" HIC "的缠身进击！" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
