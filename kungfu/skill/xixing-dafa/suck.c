// suck.c

#include <ansi.h>

inherit F_SSERVER;

int exert(object me, object target)
{
	int sp, dp;
	int my_max, tg_max;
        int amount;
        object weapon;

	if (! target || target == me) target = offensive_target(me);

	if (environment(me)->query("no_fight"))
		return notify_fail("在这里不能攻击他人。\n");

	if (! objectp(target) || ! me->is_fighting(target))
		return notify_fail("你只能吸取战斗中的对手的丹元！\n");

        if (target->query("race") != "人类" ||
            target->query("not_living"))
                return notify_fail("搞错了！只有活着的生物才能有丹元！\n");

        my_max = me->query("max_neili");
        tg_max = target->query("max_neili");

	if (me->query_temp("sucked"))
		return notify_fail("你刚刚吸取过丹元！\n");

        if (! me->is_fighting() || ! target->is_fighting())

	if ((int)me->query_skill("xixing-dafa", 1) < 200)
		return notify_fail("你的吸星大法尚未大成，还"
                                   "不能吸取对方的丹元收为己用！\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的内力不够，不能使用吸星大法。\n");

        if ((int)me->query_current_neili_limit() <= my_max)
                return notify_fail("你的内功水平有限，再吸取也是徒劳。\n");

	if ((int)target->query("max_neili") < 100)
		return notify_fail( target->name() +
			"丹元涣散，功力未聚，你无法从他体内吸取任何东西！\n");

        if ((int)target->query("max_neili") < (int)me->query("max_neili") / 5)
		return notify_fail( target->name() +
			"的内功修为远不如你，你无法从他体内吸取丹元！\n");

        if (! objectp(weapon = me->query_temp("weapon")))
        	message_combatd(HIR "$N" HIR "探出右手，平平的拍在$n"
                                HIR "的胸前，似乎没有半点力道。\n\n" NOR,
                                me, target);
        else
                message_combatd(HIR "$N" HIR "把手中的" + weapon->name() +
                                HIR "一扬，慢慢的逼向$n" HIR + "，$p"
                                HIR "连忙架住。\n" NOR,
                                me, target);

        if (target->query_skill_mapped("force") == "taixuan-gong")
        {
                tell_object(target, HIW + me->name() + HIW "伸出右手，轻轻握在你的手"
                             "臂上，试图吸取你的内力，但是你体内的太玄真气猛地将"
                             "其反弹回去。\n");

                return notify_fail(HIG "你伸出右手，轻轻握在" + target->name() +
                                   HIG "的手臂上，却猛的感觉一股内劲将你的手弹回。\n" NOR);
        }

        if (living(target) && !target->is_killing(me))
        {
                me->want_kill(target);
                target->kill_ob(me);
        }

        sp = me->query_skill("force");
        dp = target->query_skill("force");

	me->set_temp("sucked", 1);

        if ((sp + random(sp) > dp + random(dp) ) || ! living(target))
	{
		tell_object(target, HIR "你只觉全身乏力，全身功力如"
			    "融雪般消失得无影无踪！\n" NOR);
		tell_object(me, HIG "你觉得" + target->name() +
			    HIG "的丹元自手掌源源不绝地流了进来。\n" NOR);

                amount = 1 + (me->query_skill("xixing-dafa", 1) - 120) / 10;
                target->add("max_neili", -amount);
                me->add("max_neili", amount);
                me->add("exception/xixing-count", amount * 10);
                SKILL_D("xixing-dafa")->check_count(me);
                if (target->query("max_neili") < 1)
			target->set("max_neili", 0);

                me->start_busy(4 + random(4));
                if (! target->is_busy()) target->start_busy(2);
                me->add("neili", -10);

		call_out("del_sucked", 10, me);
	} else
	{	
		message_combatd(HIY "可是$p" HIY "看破了$P" HIY
                                "的企图，运用内力震开了$P" HIY
                                "，随即躲了开去。\n" NOR,
                                me, target);
                me->start_busy(7);
		call_out("del_sucked", 20, me);
	}

	return 1;
}

void del_sucked(object me)
{
        me->delete_temp("sucked");
}
