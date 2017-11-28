// 养颜术
#include <ansi.h>
inherit SKILL;

string type() { return "knowledge"; }

int valid_learn(object me)
{
    return 1;
}

void skill_improved(object me)
{
        int lvl, per;

        lvl = me->query_skill("yangyan-shu", 1);
        per = me->query("per");

        if ((lvl % 10) == 0)
        {
				if (per < 30) me->add("per",1);
                tell_object(me, HIG "你感觉自己的颜值要爆表了。\n" NOR);
        } else
                tell_object(me, HIM "你用心学习养颜术，感觉自己的颜值有所提升。\n" NOR);
}
