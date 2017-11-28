// hunger.c

#include <condition.h>
#include <ansi.h>

int dispel() { return 0; }

int update_condition(object me, int duration)
{
        if (me->query("food") > 0 && me->query("water") > 0)
                return 0;

	if (! interactive(me) ||
	    ! environment(me) ||
	    environment(me)->is_chat_room())
		return CND_CONTINUE;

	if (duration == 4)
	{
                if (me->query("food") <= 0 && me->query("water") <= 0)
			tell_object(me, HIY "你饿得头晕眼花，渴得喉咙冒烟，看来"
                                    "要赶快找点吃喝的东西了。\n"NOR);
                else
                if (me->query("food") <= 0)
			tell_object(me, HIY "你饿得头晕眼花，看来要赶快找点吃的了。\n" NOR);
                else
		if (me->query("water") <= 0)
			tell_object(me, HIY "\n你渴得喉咙冒烟，看来要赶快喝点什么了。\n" NOR);
	}
	else
	if (duration == 7)
	{
                if (me->query("food") <= 0 && me->query("water") <= 0)
			tell_object(me, HIR "你又饥又渴，觉得自己快要死了。\n"NOR);
                else
                if (me->query("food") <= 0)
			tell_object(me, HIR "你饿得快死了。\n"NOR);
                else
		if (me->query("water") <= 0)
			tell_object(me, HIR "你渴得要虚脱了。\n"NOR);
	}
	else
	if (duration >= 13)
	{
                if (wizardp(me))
                {
                        tell_object(me, HIY "你眼看快要饿死了，好在你是巫师，变！"
                                        "变！变！你三口两口把变出来\n" +
                                        "的不知道什么东西给吞下肚，感觉好多了。\n" NOR);
                        me->set("food", me->max_food_capacity());
                        me->set("water", me->max_food_capacity());
                        return 0;
                }

                if (me->query("mud_age") < 86400)
                {
                        tell_object(me, HIY "你眼看就要不行了，突然天下掉下馅饼牛"
                                        "奶，你一阵狂吃滥喝，感觉总\n" +
                                        "算是好多了。\n" NOR);
                        me->set("food", me->max_food_capacity());
                        me->set("water", me->max_food_capacity());
                        return 0;
                }

                if (me->query("food") <= 0 && me->query("water") == 0)
			tell_object(me, HIR "你又饥又渴，终于晕了过去。\n"NOR);
                else
                if (me->query("food") <= 0)
			tell_object(me, HIR "你饿得晕了过去。\n"NOR);
                else
		if (me->query("water") <= 0)
			tell_object(me, HIR "你渴得晕了过去。\n"NOR);
		me->receive_damage("qi", 0);
                me->unconcious();
                return 0;
	}
        
        me->apply_condition("hunger", duration + 1);
	return CND_CONTINUE;
}
