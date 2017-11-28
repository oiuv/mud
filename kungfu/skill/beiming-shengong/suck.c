// maxsuck.c

#include <ansi.h>

inherit F_SSERVER;

int exert(object me, object target)
{
	int sp, dp;
	int my_max, tg_max;
        int sucked;

	if (! target || target == me) target = offensive_target(me);

	if (environment(me)->query("no_fight"))
		return notify_fail("在这里不能攻击他人。\n");

	if (! objectp(target) || ! me->is_fighting(target))
		return notify_fail("你要吸取谁的丹元？\n");

        if (target->query("race") != "人类" ||
            target->query("not_living"))
                return notify_fail("搞错了！只有活着的生物才能有丹元！\n");

        my_max = me->query("max_neili");
        tg_max = target->query("max_neili");

	if (me->query_temp("sucked"))
		return notify_fail("你刚刚吸取过丹元！\n");

	if (objectp(me->query_temp("weapon")))
		return notify_fail("你必须空手才能施用北冥神功吸人丹元！\n");

        if (! me->is_fighting() || ! target->is_fighting())

	if ((int)me->query_skill("beiming-shengong", 1) < 90)
		return notify_fail("你的北冥神功功力不够，不能吸取对方的丹元！n");

	if ((int)me->query("neili") < 20)
		return notify_fail("你的内力不够，不能使用北冥神功。\n");

        if ((int)me->query_current_neili_limit() <= my_max)
                return notify_fail("你的内功水平有限，再吸取也是徒劳。\n");

	if ((int)target->query("max_neili") < 100)
		return notify_fail( target->name() +
			"丹元涣散，功力未聚，你无法从他体内吸取任何东西！\n");

        if ((int)target->query("max_neili") < (int)me->query("max_neili") / 5)
		return notify_fail( target->name() +
			"的内功修为远不如你，你无法从他体内吸取丹元！\n");

        if (target->query_skill_mapped("force") == "taixuan-gong")
        {
                tell_object(target, HIW + me->name() + HIW "伸出右手，轻轻握在你的手"
                             "臂上，试图吸取你的内力，但是你体内的太玄真气猛地将"
                             "其反弹回去。\n");

                return notify_fail(HIG "你伸出右手，轻轻握在" + target->name() +
                                   HIG "的手臂上，却猛的感觉一股内劲将你的手弹回。\n" NOR);
        }

	message_combatd(HIG "$N" HIG "全身一振，伸出右手，轻轻握在$n"
                        HIG "的手臂上。\n\n" NOR, me, target);

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

                sucked = 1 + (me->query_skill("beiming-shengong", 1) - 90) / 10;
                target->add("max_neili", -sucked);
                if (target->query("max_neili") < 1)
			target->set("max_neili", 0);
                if (my_max > tg_max + 100)  sucked /= 2;
                if (my_max > tg_max + 200)  sucked /= 2;
                if (my_max > tg_max + 400)  sucked /= 2;
                if (my_max > tg_max + 800)  sucked /= 2;
                if (my_max > tg_max + 1600) sucked /= 2;
                if (my_max > tg_max + 3200) sucked /= 2;

                if (sucked < 1)
                        tell_object(me, HIG "可是你发现对方内力"
                                    "似乎弱过你太多，一时难以吸收以为己用。\n" NOR);
                else
                        me->add("max_neili", sucked);

                //me->start_busy(4 + random(4));
                me->start_busy(4);
                if (! target->is_busy()) target->start_busy(2);
                me->add("neili", -10);

		call_out("del_sucked", 10, me);
	}
	else
	{	
		message_combatd(HIY "可是$p" HIY "看破了$P" HIY
                                "的企图，机灵地溜了开去。\n" NOR,
                                me, target);
                me->start_busy(6);
		call_out("del_sucked", 15, me);
	}

	return 1;
}

void del_sucked(object me)
{
        me->delete_temp("sucked");
}
