#include <ansi.h>
#include <combat.h>

#define XIAN "「" HIY "推天献印势" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/hujia-daofa/xian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! target || ! me->is_fighting(target))
                return notify_fail(XIAN "只能对战斗中的对手使用。\n");
 
        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对，难以施展" XIAN "。\n");

        if ((int)me->query_skill("force") < 160)
                return notify_fail("你的内功火候不够，难以施展" XIAN "。\n");

        if ((int)me->query_skill("hujia-daofa", 1) < 120)
                return notify_fail("你的胡家刀法还不到家，难以施展" XIAN "。\n");

        if (me->query_skill_mapped("blade") != "hujia-daofa")
                return notify_fail("你没有激发胡家刀法，难以施展" XIAN "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你的真气不够，难以施展" XIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "横过手中" + weapon->name() +  HIY "，施出「推天献"
              "印势」，双手握刀，将整个刀锋向$n" HIY "缓缓推进！\n"NOR;

        ap = me->query_skill("blade") + me->query_skill("force");
        dp = target->query_skill("force");

        if (ap / 4 + random(ap / 2) > dp)
	{
		damage = ap / 8 + random(ap / 8);
                me->add("neili", -150);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 25,
                                           HIR "$n" HIR "何曾见过如此高明的刀法，"
                                           "一声惨叫，刀锋已入体三分，鲜血四处喷溅！\n" NOR);
		me->start_busy(2);
                if (ap / 3 + random(ap / 2) > dp && ! target->is_busy())
                        target->start_busy(ap / 60 + 2);
	} else 
	{
		msg += CYN "$p" CYN "大吃一惊，也不招架，当即向后"
                       "横移数尺，避开了$P" CYN "这一招。\n" NOR;
                me->add("neili", -50);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
