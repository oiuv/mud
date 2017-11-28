// yanlian.c

#include <skill.h>
#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }
int practicing(object me);
int halt_practice(object me);

int main(object me, string arg)
{
	seteuid(getuid());

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (environment(me)->query("no_fight"))
                return notify_fail("你在这里演练也不怕吵到别人？\n");

        if (! arg)
                return notify_fail("你想演练什么？\n");

        if (file_size(SKILL_D(arg) + ".c") <= 0)
                return notify_fail("没听说过有这种武功。\n");
               
        if (! mapp(SKILL_D(arg)->query_sub_skills()))
                return notify_fail("这种武功无需演练，还是勤加练习吧。\n");

        if ((int) me->query_skill(arg, 1) > 0)
                return notify_fail("你已经会" + to_chinese(arg) +
                                   "了，不必再演练了，还是多练习吧。\n");

        if (! SKILL_D(arg)->get_ready(me))
                return 1;

        me->set_temp("pending/practice", 1);
        me->set_temp("pending/practicing_skill", arg);
	me->start_busy((: practicing :), (: halt_practice :));

        write("你开始演练" + to_chinese(arg) + "。\n");
        return 1;
}

int practicing(object me)
{
        int i;
        int lvl;
        int step;
        int cost;
        string skill;
        string sub_skill;
        string action_msg;
        mapping action;
        mapping sub_skills;
        string  *skill_names;
        string  *color_msg = ({HIY, HIG, HIW, HIM, HIC});

        step = (int) me->query_temp("pending/practice");
        skill = me->query_temp("pending/practicing_skill");
        if (! step || ! stringp(skill))
                return 0;
        if (! mapp(sub_skills = SKILL_D(skill)->query_sub_skills()))
                return 0;

        skill_names = keys(sub_skills);
        if (step <= sizeof(sub_skills))
        {
                sub_skill = skill_names[step - 1];
                if (! me->query_skill(sub_skill, 1))
                {
                        write("你正欲继续演练，突然一楞，这才发现自己不会运用" +
                              to_chinese(sub_skill) + "\n");
                        return 0;
                }
                if (file_size(SKILL_D(sub_skill) + ".c") <= 0)
                {
                        write("嗯、怎么回事？怎么" + to_chinese(sub_skill) +
                              "这种武功好像失传了？\n");
                        return 0;
                }
                action = SKILL_D(sub_skill)->query_action(me, me->query_temp("weapon"));
                action_msg = action["action"];
                action_msg = replace_string(action_msg, "$n", "虚空");
                action_msg = replace_string(action_msg, "$l", "无尽处");
                action_msg = replace_string(action_msg, "$w", "兵刃");
                cost = action["force"] * 8 / sizeof(sub_skills);
                if (me->query("neili") < cost)
                {
                        write("你刚欲出招，忽然间丹田真气不继，难以施为。\n");
                        return 0;
                }
                me->add("neili", -cost);
                cost = action["force"] / 10;
                if (me->query("qi") < cost)
                {
                        write("你觉得气力不加，疲惫不堪，无法再出招。\n");
                        return 0;
                }
                me->add("qi", -cost);
                cost = action["force"] * 8 / me->query("int") / sizeof(sub_skills);
                if (me->query("jing") < cost)
                {
                        write("一阵烦恶涌上心头，你几欲呕吐。\n");
                        return 0;
                }
                me->add("jing", -cost);

                message_vision(color_msg[random(sizeof(color_msg))] + action_msg +
                               "。\n\n" NOR, me);
                if (me->query_skill(sub_skill, 1) <
                    (int) sub_skills[sub_skill])
                {
                        write("你演练完" + to_chinese(sub_skill) + "这一招，"
                              "觉得有些迷茫，一时无法继续演练下去。\n");
                        return 0;
                }
        } else
        {
                message_vision("$N缓缓的收住步伐，似有所思。\n", me);
                me->set_temp("pending/practice", 0);
                if (SKILL_D(skill)->get_finish(me))
                {
                        write(HIC "\n恭喜你练成了「" + to_chinese(skill) + "」。\n\n" NOR);
                        lvl = 0;
                        for (i = 0; i < sizeof(sub_skills); i++)
                        {
                                lvl += me->query_skill(skill_names[i], 1);
                                me->delete_skill(skill_names[i]);
                        }
                        lvl /= sizeof(sub_skills);
                        me->set_skill(skill, lvl);
                }
                return 0;
        }

        step++;
        me->set_temp("pending/practice", step);
        return 1;
}

int halt_practice(object me)
{
        write("你收住意念，不再继续演练。\n");
        me->set_temp("pending/practice", 0);
        me->set_temp("pending/practicing_skill", 0);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : yanlian <技能>

这个指令可以让你将某些武功合而为一，成为一种强大得多的新技能。比如六
脉神剑。当你把六脉剑法一一学全后，你就可以演练六脉神剑(six-finger)，
一旦成功，你将领悟到一种全新的技能。演练将耗费精、气、内力、潜能。如
果因为这些因素不能满足，演练将失败。
HELP
        );
        return 1;
}
