// breakup.c

#include <ansi.h>

inherit F_CLEAN_UP;

int breaking(object me);
int halt_breaking(object me);

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

        if (me->query("breakup"))
                return notify_fail("你已经打通了任督二脉了，似乎没有必要再来一次。\n");

        if (wizardp(me))
                return notify_fail("巫师也要打通任督二脉？是不是烧得慌？\n");

        if (! where->query("no_fight"))
                return notify_fail("在这里打通任督二脉？不太安全吧？\n");

        if (! where->query("sleep_room"))
                return notify_fail("你得找一个能够休息的地方闭关修行。\n");

	if (me->is_busy())
		return notify_fail("你现在正忙着呢。\n");

        if (me->query("potential") - me->query("learned_points") < 1000)
                return notify_fail("你的潜能不够，没法闭关修行以打通任督二脉。\n");

	if ((int)me->query("qi") * 100 / me->query("max_qi") < 90)
		return notify_fail("你现在的气太少了，无法静心闭关。\n");

	if ((int)me->query("jing") * 100 / me->query("max_jing") < 90)
		return notify_fail("你现在的精太少了，无法静心闭关。\n");

        if ((int)me->query_skill("force") < 450)
                return notify_fail("你觉得自己的内功火候还有限，看来需"
				   "要先锻炼好内功才行。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你觉得内力颇有不足，看来目前还难以"
				   "打通任督二脉。\n");

	if ((int)me->query("neili") * 100 / me->query("max_neili") < 90)
		return notify_fail("你现在的内力太少了，无法静心闭关。\n");

	message_vision("$N盘膝坐下，开始冥神运功，闭关修行。\n", me);
        me->set("startroom", base_name(where));
        me->set("doing", "breakup");
        CLOSE_D->user_closed(me);
	me->start_busy(bind((: call_other, __FILE__, "breaking" :), me),
                       bind((: call_other, __FILE__, "halt_breaking" :), me));
        CHANNEL_D->do_channel(this_object(), "rumor",
                              sprintf("%s%s(%s)开始闭关修行，试图打通任督二脉。",
                              ultrap(me) ? "大宗师" : "",
			      me->name(1), me->query("id")));

	return 1;
}

int continue_breaking(object me)
{
	me->start_busy(bind((:call_other, __FILE__, "breaking" :), me),
                       bind((:call_other, __FILE__, "halt_breaking" :), me));
        CLOSE_D->user_closed(me);
	tell_object(me, HIR "\n你继续闭关修行以打通任督二脉...\n" NOR);
        return 1;
}

private void stop_breaking(object me)
{
        CLOSE_D->user_opened(me);
	if (! interactive(me))
	{
		me->force_me("chat* sigh");
		call_out("user_quit", 0, me);
	}
}

int breaking(object me)
{
        string msg;

        if (me->query("potential") <= me->query("learned_points"))
        {
                tell_object(me, "你的潜能耗尽了。\n");
                message_vision("$N睁开双目，缓缓吐了一口气，站了起来。\n", me);
                CLOSE_D->user_opened(me);
        	CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s(%s)闭关结束，似乎没有太大的进展。",
		                      me->name(1), me->query("id")));
		if (! interactive(me))
		{
			me->force_me("chat* sigh");
			call_out("user_quit", 0, me);
		}

                return 0;
        }

        me->add("learned_points", 1);

        if (random(10))
                return 1;

        if (random(40000) < me->query("con"))
        {
                message_vision(HIW "只见$N" HIW "头上白雾腾腾、浑身"
                               "如同笼罩在云中，看来已经到了三花聚顶、"
                               "五气朝元、龙虎相济、天人交会的紧要关头！\n" NOR, me);
                tell_object(me, HIR "你觉得内力在丹田源源而生，不断"
                            "冲击诸处大穴，浑身燥热难当，几欲大声呼喊。\n" NOR);
                message_vision(HIC "突然$N" HIC "大喝一声，一股无形气浪"
                               "陡然散布开来，四周空气登时变得燥热。\n" NOR, me);
                tell_object(me, HIG "你顿时觉得浑身一阵轻松，一股清凉之意油然"
                            "而起，心灵一片空明，内力没有丝毫阻滞，舒泰之极。\n" NOR);
                me->set("breakup", 1);
        	CHANNEL_D->do_channel(this_object(), "rumor",
                                      sprintf("听说%s(%s)经过闭关苦修，终于打通"
                                              "了任督二脉，窥视到了无上的武学境界。",
		                      me->name(1), me->query("id")));
                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 250000);
                CHAR_D->setup_char(me);
                stop_breaking(me);
                return 0;
        }

        switch (random(5))
        {
        case 0:
                msg = "你默默运转内力，隐隐有些感觉。\n";
                break;

        case 1:
                msg = "你将内力运出丹田，过紫宫、入泥丸、透十二重楼，遍布奇筋八脉，然后收回丹田。\n";
                break;

        case 2:
                msg = "你将内力运经诸穴，抵四肢百赅，然后又回收丹田。\n";
                break;

        case 3:
                msg = "你在丹田中不断积蓄内力，只觉得浑身燥热。\n";
                break;

        default:
                msg = "你缓缓呼吸吐纳，将空气中水露皆收为己用。\n";
                break;
        }

        tell_object(me, msg);
        return 1;
}

int halt_breaking(object me)
{
        CLOSE_D->user_opened(me);
        tell_object(me, "你中止了闭关。\n");
        message_vision(HIY "$N" HIY "轻轻叹了一口气，缓缓的睁开眼。\n\n" NOR, me);
        me->add("potential", (me->query("learned_points") - me->query("potential")) / 2);
        CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name(1) +
                              "闭关中途突然复出。");
	return 1;
}

private void user_quit(object me)
{
	if (! me || interactive(me))
		return;

	me->force_me("quit");
}

int help(object me)
{
        write(@HELP
指令格式 : breakup

闭关修行以打通任督二脉，需要非常深厚的内力和内功功底才能做到。
而且会消耗潜能。一旦打通了任督二脉可以同时扩展精、气、精力、
内力的上限。

HELP );
        return 1;
}