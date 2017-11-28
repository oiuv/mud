// quan 九阴神拳
 
#include <ansi.h>
#include <combat.h>
 
inherit F_SSERVER;

#define QUAN "「" HIW "九阴神拳" NOR "」"
 
int perform(object me, object target)
{
	string msg;
	int ap, dp;
        int damage;

        if (! target)
        {
        	me->clean_up_enemy();
        	target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail(QUAN "只能对战斗中的对手使用。\n");

	if (me->query_skill("jiuyin-shengong", 1) < 230)
		return notify_fail("你的九阴神功还不够娴熟，不能使用" QUAN "！\n");

	if (me->query_skill("cuff", 1) < 220)
		return notify_fail("你的基本拳法还不够娴熟，不能使用" QUAN "！\n");

        if (me->query("neili") < 240)
                return notify_fail("你的内力不够，不能使用" QUAN "！\n");

        if (me->query_temp("weapon"))
                return notify_fail("此招只能空手施展！\n");

        if (me->query_skill_prepared("unarmed") != "jiuyin-shengong"
           && me->query_skill_prepared("cuff") != "jiuyin-shengong")
                return notify_fail("你没有准备使用九阴神功，无法施展" QUAN "。\n");
 
       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "一声冷哼，握拳击出，招式雄浑，难擢其威！\n" NOR;
 
	ap = me->query_skill("jiuyin-shengong", 1) * 3 / 2 + me->query("str") * 20 +
             me->query_skill("martial-cognize", 1);
	dp = target->query_skill("dodge") + target->query("dex") * 20 +
             target->query_skill("martial-cognize", 1);

        me->start_busy(2);
        me->add("neili", -50);
        if (ap / 2 + random(ap) < dp)
        {
		msg += HIG "只见$n" HIG "不慌不忙，轻轻一闪，躲过了$N" HIG "这一击！\n"NOR;
        } else
	{
		me->add("neili",-90);
                damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 85 + random(5),
                                           HIR "$n" HIR "连忙格挡，可是这一拳力道何等之重，哪里抵"
                                           "挡得住？只被打得吐血三尺，连退数步！\n" NOR);
	}

	message_combatd(msg, me, target);
	return 1;
}
