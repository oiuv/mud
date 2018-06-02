// practice.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object where = environment(me);
        string skillname;
        string base_skname;
        int skill, skill_basic, times, i;
        int t = time();
        int improve;

        if (where->query("pigging"))
                return notify_fail("你还是专心拱猪吧！\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (t == me->query_temp("time/practice"))
                return notify_fail("你刚刚才练习过（如果你要连续练习，可以"
                                   "指明练习的次数）。\n");

        if (me->is_fighting())
                return notify_fail("你已经在战斗中了，学一点实战经验吧。\n");

        if (environment(me)->query("no_fight") && me->query("doing") != "scheme")
                return notify_fail("你无法在这个地方安心练习。\n");

        if (! arg) return (__DIR__"enable")->main(me, arg);

        if ((sscanf(arg, "%s %d", base_skname, times) != 2))
        {
                times = 1;
                base_skname = arg;
        }
            
        if (times < 1 || times > 50)
                return notify_fail("练习次数必须大于一次，但不能超过五十次。\n");

        if (! stringp(skillname = me->query_skill_mapped(base_skname)))
                return notify_fail("你只能练习用 enable 指定的特殊技能。\n");

        skill_basic = me->query_skill(base_skname, 1);
        skill = me->query_skill(skillname, 1);

        if (skill < 1)
                return notify_fail("你好像还没有学过这项技能吧？\n");

        if (skill_basic < 1)
                return notify_fail("你对这方面的技能还是一窍不通，最好从先从基本学起。\n");

        if (skill_basic <= skill)
                return notify_fail("你的" + to_chinese(base_skname) +
                                   "火候不够，难以继续提升你" +
                                   to_chinese(skillname) + "的水平。\n");

        notify_fail("你现在不能练习这项技能。\n");
        if (! SKILL_D(skillname)->valid_learn(me)) return 0;

        if (! XUE_CMD->can_learn(me, skillname))
                return 0;

        notify_fail("你试着练习" + to_chinese(skillname) + "，但是并没有任何进步。\n");

        if (! me->can_improve_skill(skillname))
                return notify_fail("也许是缺乏实战经验，你的练习总没法进步。\n");

        me->set_temp("time/practice", t);
		
		//练习和int挂钩 by 大曾
        if (skill >= 500)
                improve = skill_basic / (int) me->query("int");
        else
        if (skill >= 300)
                improve = skill_basic * 3 / (int) me->query("int");
        else
                improve = skill_basic * 6 / (int) me->query("int") + 30 / (int) me->query("int");

//转世特技武星转世 by 薪有所属
        if (me->query("special_skill/wuxing"))
                improve += improve * 20 / 100;
                
        for (i = 0; i < times; i++)
        {
                if (SKILL_D(skillname)->practice_skill(me))
                        me->improve_skill(skillname, improve, skill_basic > skill ? 0 : 1);
                else break;
        }
        if (i > 0)
                write(HIC "你试着把" + to_chinese(skillname) +
                      "练了" + chinese_number(i) + "趟。\n" NOR);

        if (i >= times)
                return 1;

        return 0;
}

int help(object me)
{
        write(@TEXT
指令格式：practice | lian <技能种类> <次数>

这个指令让你练习某个种类的技能，这个技能必须是经过 enable 的
专业技能。如果你对这方面的基本技能够高，可以经由练习直接升级，
而且升级的上限只跟你基本技能的等级有关，换句话说，勤加练习是
使你的所学「青出于蓝胜于蓝」的唯一途径，当然，在这之前你必须
从实际运用中获得足够的经验以提升你的基本技能。

其他相关指令：apprentice, research, skills, study, learn

TEXT);
        return 1;
}

