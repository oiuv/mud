// closed.c

#include <ansi.h>

inherit F_CLEAN_UP;

#define PERIOD          864
#define PERIOD_POT      100

int clossing(object me);
int halt_closing(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
//	int exercise_cost;
	object where;

	seteuid(getuid());
	where = environment(me);
	
	if (where->query("pigging"))
		return notify_fail("你还是专心拱猪吧！\n");

        if (! ultrap(me))
                return notify_fail("你还没有到大宗师的境界，还是好好学习锻炼吧。\n");

        if (wizardp(me))
                return notify_fail("巫师闭什么关？\n");

        if (! where->query("no_fight"))
                return notify_fail("在这里闭关？不太安全吧？\n");

        if (! where->query("sleep_room"))
                return notify_fail("你得找一个能够休息的地方闭关。\n");

	if (me->is_busy())
		return notify_fail("你现在正忙着呢。\n");

        if (me->query("potential") - me->query("learned_points") < 10000)
                return notify_fail("你的潜能不够，没法闭关修行。\n");

	if ((int)me->query("qi") * 100 / me->query("max_qi") < 90)
		return notify_fail("你现在的气太少了，无法静心闭关。\n");

	if ((int)me->query("jing") * 100 / me->query("max_jing") < 90)
		return notify_fail("你现在的精太少了，无法静心闭关。\n");

        if ((int)me->query("max_neili") < 4000)
                return notify_fail("你觉得内力颇有不足，看来目前还难以"
				   "进行长时间的闭关修炼。\n");

	if ((int)me->query("neili") * 100 / me->query("max_neili") < 90)
		return notify_fail("你现在的内力太少了，无法静心闭关。\n");

	message_vision("$N盘膝坐下，开始冥神运功，闭关修行。\n", me);
        me->set("startroom", base_name(where));
	me->set("doing", "closed");
        CLOSE_D->user_closed(me, "closed");
	me->start_busy(bind((:call_other, __FILE__, "closing" :), me),
                       bind((:call_other, __FILE__, "halt_closing" :), me));
        CHANNEL_D->do_channel(this_object(), "rumor",
                              sprintf("大宗师%s(%s)开始闭关修行。",
			      me->name(1), me->query("id")));

	return 1;
}

int continue_closing(object me)
{
	me->start_busy(bind((:call_other, __FILE__, "closing" :), me),
                       bind((:call_other, __FILE__, "halt_closing" :), me));
        CLOSE_D->user_closed(me);
	tell_object(me, HIR "\n你继续闭关...\n" NOR);
        return 1;
}

int filter_skill(string sk, object me)
{
        if (me->query_skill(sk, 1) < 200 || ! me->can_improve_skill(sk))
                return 0;

        if (SKILL_D(sk)->type() != "martial")
                return 0;

        if (SKILL_D(sk)->valid_enable("force"))
                return 1;

        if (SKILL_D(sk)->valid_enable("parry") ||
            SKILL_D(sk)->valid_enable("dodge"))
                return 0;

        return 1;
}

int closing(object me)
{
        int t;
        int tn;
        int pot;
        int r;
        int exp_inc;
        string *ks;

        pot = me->query("potential");
        if (pot <= me->query("learned_points"))
        {
                tell_object(me, "你的潜能耗尽了。\n");
                message_vision("$N睁开双目，缓缓吐了一口气，站了起来。\n", me);
                CLOSE_D->user_opened(me);
        	CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s(%s)闭关功德圆满。",
		                      me->name(1), me->query("id")));
		if (! interactive(me))
		{
			me->force_me("chat* haha");
			call_out("user_quit", 0, me);
		}

                return 0;
        }

        t = me->query_temp("last_closing");
        tn = time();
        if (tn - t < 0)
        {
                me->set_temp("last_closing", tn);
                return 1;
        }

        if (tn - t < PERIOD)
                return 1;

        me->set_temp("last_closing", tn);
        if (me->add("learned_points", PERIOD_POT / 2 + random(PERIOD_POT)) > pot)
                me->set("learned_points", pot);

        if (random(10) == 0)
                tell_object(me, "闭关修炼中...\n");

        if ((random(100) < 4) && me->can_improve_neili())
        {
                tell_object(me, HIR "你对内功有所领悟，感到内力进步了！\n" NOR);
                me->improve_neili(1);
        }

        if ((random(100) < 4) && me->can_improve_jingli())
        {
                tell_object(me, HIM "你对神通有所领悟，感到精力进步了！\n" NOR);
                me->improve_jingli(1);
        }

        exp_inc = 50 + random(100);
        exp_inc = exp_inc * (100 + me->query_skill("martial-cognize",1)) / 500;
        exp_inc = exp_inc * (100 + me->query("int")) / 100;
        me->add("combat_exp", exp_inc);
        //closed增加武学修养 by 薪有所属
        me->improve_skill("martial-cognize", 1000 + random(500));

        ks = filter_array(keys(me->query_skills()), (: filter_skill :), me);
        if (r = sizeof(ks))
        {
                r = random(r);
                tell_object(me, HIY "你对" + to_chinese(ks[r]) + "有所感悟。\n" NOR);
                me->improve_skill(ks[r], 5000 + random(1000));
        }

        return 1;
}

int halt_closing(object me)
{
        CLOSE_D->user_opened(me);
        tell_object(me, "你中止了闭关。\n");
        message_vision(HIY "$N" HIY "大喝一声，睁开眼来，一股气流登时"
                       "将众人迫退四步。\n\n" NOR, me);
        me->add("potential", (me->query("learned_points") - me->query("potential")) / 2);
        CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name(1) +
                              "闭关中途突然复出。");
	return 1;
}

private void user_quit(object me)
{
	if (! objectp(me) || interactive(me))
		return;

	me->force_me("quit");
}

int help(object me)
{
        write(@HELP
指令格式 : closed

闭关修行，只有你到了大宗师的境界以后才能够闭关修行。要求必须在
一个安全并且可以休息的地方才能闭关，闭关前需要有一万点潜能，闭
关开始以后，玩家离线以后其角色将仍然在线修行，直到玩家中止闭关
(halt)或是潜能耗尽。期间内玩家的经验、技能、内力将会提升。

HELP );
        return 1;
}
