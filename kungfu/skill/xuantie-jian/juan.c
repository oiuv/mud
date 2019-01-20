// juan.c 卷字诀

#include <ansi.h>

inherit F_SSERVER;

#define JUAN "「" HIW "卷字诀" NOR "」"

int perform(object me, object target)
{
        object weapon;
        // int damage;
        int ap, dp;
        string msg;

        if (userp(me) && ! me->query("can_perform/xuantie-jian/juan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUAN "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query_skill("xuantie-jian", 1) < 100)
                return notify_fail("你的玄铁剑法不够娴熟，不能使用" JUAN "。\n");

        if ((int)me->query_skill("force") < 400)
                return notify_fail("你的内功火候不够，不能使用" JUAN "。\n");

        if ((int)me->query("neili") < 100 )
                return notify_fail("你现在内力太弱，不能使用" JUAN "。\n");

        if (me->query_skill_mapped("sword") != "xuantie-jian")
                return notify_fail("你没有激发玄铁剑法，不能施展" JUAN "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "$N一抖手中的" + weapon->name() + HIY "，自下而上的朝$n"
	      HIY "卷了过去，曲曲折折，变化无常！\n" NOR;

	ap = me->query_skill("sword");
	dp = target->query_skill("dodge");
        if (random(ap) > dp / 2)
        {
                target->start_busy(ap / 20 + 2);
                me->add("neili", -50);
                msg += YEL "$p" YEL "连忙竭力招架，一时无暇反击。\n" NOR;
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，斜跃避开了$P"
                       CYN "的攻击。\n"NOR;
		me->add("neili", -25);
        	me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}
