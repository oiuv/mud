// abandon.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        int skill_lvl;
        int jingcost;
        string skill;
        string name;
        int lost;

        if(! arg || arg == "" || sscanf(arg, "%s", skill) != 1)
                return notify_fail("你要放弃经验还是某一项技能？\n");

        if (me->is_fighting())
                return notify_fail("你正忙着打架呢，哪有时间做这种事？\n");

        if (me->is_busy())
                return notify_fail("你正忙，没法静下心来。\n");

        jingcost = me->query("int") + random(me->query("int"));
        if (jingcost > me->query("jing"))
                return notify_fail("你无法集中精力。\n");

        if (skill == "exp")
        {
                lost = me->query("combat_exp");
                if (lost < 1000)
                        return notify_fail("你发现自己现在对武学简直就是一无所知。\n");

                message("vision", me->name() + "坐下在凝神思索什么。\n",
                        environment(me), me);
                tell_object(me, "你不再想拳脚兵器轻功内功，只是一门心思忘记武功。\n");
                me->start_busy(2 + random(2));
                if (random(me->query("int")) > 20)
                {
                        tell_object(me, "可是你发现自己似乎记性太好，没有半点效果。\n");
                        return 1;
                }

                lost = random(lost / 100) + 1;
                me->add("combat_exp", -lost);
                switch (random(6))
                {
                case 0:
                        tell_object(me, HIR "你又想起了很多温馨"
                                    "的往事，不由得沉浸其中。\n" NOR);
                        break;
                case 1:
                        tell_object(me, HIR "你似乎又看到了遥远"
                                    "的童年，一时忘却了尘世间的烦恼。\n" NOR);
                        break;
                case 2:
                        tell_object(me, HIR "你黯然一声长叹，只觉"
                                    "得自己为了武学荒废一生，实在无谓。\n" NOR);
                        break;
                case 3:
                        tell_object(me, HIR "你心如止水，所有的"
                                    "武功都仿佛离自己远去了。\n" NOR);
                        break;
                case 4:
                        tell_object(me, HIR "你抬头仰望天空，发"
                                    "现它明亮透析，说不出的娇媚，令你身心俱化。\n" NOR);
                        break;
                case 5:
                        tell_object(me, HIR "你脑海中晃过当年无"
                                    "数刻苦修炼的日子，不由得暗自苦笑。\n" NOR);
                        break;
                }

                UPDATE_D->check_user(me);
                return 1;
        }

        if (skill == "zhengqi-jue")
        {
                return notify_fail("你发现自己似乎记性太好，没有半点效果。\n");
        }
        if (skill == "tianmo-jue")
        {
                return notify_fail("你发现自己似乎记性太好，没有半点效果。\n");
        }
        if (skill == "yangyan-shu")
        {
                return notify_fail("你发现自己似乎记性太好，没有半点效果。\n");
        }

        name = to_chinese(skill);
        if (name[0] < 160) name = "这项技能";
        skill_lvl = (int)me->query_skill(skill, 1);
        if (! skill_lvl)
        {
                me->delete_skill(skill);
                write("好了。\n");
                return 1;
        }

        me->start_busy(1 + random(me->query("int") / 10));
        if (random(me->query("int")) > 24)
                return notify_fail("你集中精力不再想" + name + "，结果发现毫无结果。\n");

        skill_lvl = random(skill_lvl);
        if (skill_lvl < 1)
        {
                me->delete_skill(skill);
                write("你集中精力不再想" + name + "，结果终于将它彻底忘记了。\n");
                // 曾经学过读书写字
                if (skill == "literate") me->set("learned_literate", 1);
        } else
        {
                me->set_skill(skill, skill_lvl);
                write("你集中精力不再想" + name + "，结果有所效果。\n");
        }
        return 1;
}

int help()
{
    write(@TEXT
指令格式：abandon|fangqi <技能名称> | exp

放弃你的实战经验或是某一项你所学过的技能，成功率和你的天赋有
关，只有能够休息的地方才能够静下心来忘记武功。如果你对这项技
能的修为比较高，一次不一定能够彻底的忘记。

有时候因为武功相克或者你不再打算在某项技能上再下功夫，就可以
使用这条指令放弃它。
TEXT );
    return 1;
}
