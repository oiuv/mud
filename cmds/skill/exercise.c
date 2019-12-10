// exercise.c

#include <skill.h>

inherit F_CLEAN_UP;

int exercising(object me);
int halt_exercise(object me);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	int exercise_cost;
	string force;
	object where;
//      int n;

	seteuid(getuid());
	where = environment(me);

	if (where->query("pigging"))
		return notify_fail("你还是专心拱猪吧！\n");

	if (me->is_busy() || me->query_temp("pending/exercising"))
		return notify_fail("你现在正忙着呢。\n");

	if (me->is_fighting())
		return notify_fail("战斗中不能练内功，会走火入魔。\n");

	if (! stringp(force = me->query_skill_mapped("force")))
		return notify_fail("你必须先用 enable 选择你要用的内功心法。\n");

	if (! arg || ! sscanf(arg, "%d", exercise_cost))
		return notify_fail("你要花多少气练功？\n");

	if (exercise_cost < 10)
		return notify_fail("你的内功还没有达到那个境界！\n");

	if ((int)me->query("qi") < exercise_cost)
		return notify_fail("你现在的气太少了，无法产生内息运行全身经脉。\n");

	if ((int)me->query("jing") * 100 / (int)me->query("max_jing") < 70)
		return notify_fail("你现在精不够，无法控制内息的流动！\n");

        if (environment(me)->query("no_fight")
           && ! environment(me)->query("can_dazuo")
           && me->query("doing") != "scheme")
                return notify_fail("你无法在这个地方安心打坐。\n");

        notify_fail("你无法顺利的运转内息。\n");
        if (SKILL_D(force)->do_effect(me))
                return 0;

	write("你坐下来运气用功，一股内息开始在体内流动。\n");

	me->set_temp("pending/exercise", 1);
	me->set_temp("exercise_cost", exercise_cost);
        me->set_short_desc("正坐在地下修炼内力。");
	message_vision("$N盘膝坐下，开始修炼内力。\n", me);
	me->start_busy(bind((:call_other, __FILE__, "exercising" :), me),
                       bind((:call_other, __FILE__, "halt_exercise" :), me));
	return 1;
}

int exercising(object me)
{
	int exercise_cost = (int)me->query_temp("exercise_cost");
	int neili_gain = (int)me->query_skill("force") / 5;

        neili_gain = 1 + neili_gain / 2 + random(neili_gain) +
                     environment(me)->query("exercise_improve");
        if (neili_gain < 0) neili_gain = 1;

	if (exercise_cost > 0)
        {
                if (neili_gain > exercise_cost)
                        neili_gain = exercise_cost;
                
                if (neili_gain > me->query("qi"))
                {
                        neili_gain = me->query("qi");
                        me->set_temp("exercise_cost", 0);
                        me->set_short_desc(0);
                        exercise_cost = 0;
                } else
                {
                        me->set_temp("exercise_cost", exercise_cost -= neili_gain);
                }
                me->add("neili", neili_gain);
                me->add("qi", -neili_gain);
                
                if (exercise_cost > 0)
                	return 1;
        }

	me->set_temp("pending/exercise", 0);
        me->set_short_desc(0);
	message_vision("$N运功完毕，深深吸了口气，站了起来。\n", me);
	if ((int)me->query("neili") < (int)me->query("max_neili") * 2)
		return 0;
	else
        {
		if ((int)me->query("max_neili") >= (int)me->query_current_neili_limit())
                {
			write("你的内力修为似乎已经达到了瓶颈。\n");
			me->set("neili", (int)me->query("max_neili"));
			return 0;
		} else
                {
			me->add("max_neili", 1);
			me->set("neili", (int)me->query("max_neili"));
			write("你的内力增加了！！\n");
			return 0;
		}
	}
}

int halt_exercise(object me)
{
        tell_object(me, "你将真气压回丹田，站了起来。\n");
        tell_room(environment(me), me->name() + "深吸一口气，站了起来。\n", me);
	if ((int)me->query("neili") > (int)me->query("max_neili") * 2)
		me->set("neili", (int)me->query("max_neili") * 2);
	me->set_temp("pending/exercise", 0);
        me->set_short_desc(0);
	return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : exercise|dazuo [<耗费「气」的量> 必须多于 10]

运气练功，控制体内的气在各经脉间流动，藉以训练人体肌肉骨骼的耐
力、爆发力，并且用内力的形式将能量储备下来。注意：你不能在不能
战斗的地方打坐。

HELP );
        return 1;
}