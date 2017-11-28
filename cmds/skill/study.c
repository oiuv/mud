// study.c

#include <skill.h>
#include <command.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object where = environment(me);
	object ob;
	string zhao_name, book_name;
        string sname;
        string *args;
        mapping needs;
        string *need_sk;
        mixed need_lvl;
	int my_skill, cost, times, i;
        int t = time();

	if (! arg)
		return notify_fail("你要读什么？\n");

        if (where->query("pigging"))
                return notify_fail("你还是专心拱猪吧！\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (t == me->query_temp("time/study"))
                return notify_fail("你刚刚才读过书（如果你要连续读书，可以指明读书的次数）。\n");

	if (me->is_fighting())
		return notify_fail("你无法在战斗中专心下来研读新知！\n");

	if (! arg || (i = sizeof(args = explode(arg, " "))) < 1)
                return notify_fail("指令格式：study|du <书籍> <次数>\n");

        i--;
        if (i >= 1 && sscanf(args[i], "%d", times) && times)
                i--;
        else
                times = 1;
        if (args[i] == "with" && i >= 1)
                i--;
        book_name = implode(args[0..i], " ");

	if (times < 1 || times > 100)
		return notify_fail("读书次数最少一次，最多也"
                                   "不能超过一百次。\n");

	if (! objectp(ob = present(book_name, me)))
		return notify_fail("没这本书可读啊？\n");

	if (! mapp(ob->query("skill")))
		return notify_fail("你无法从这样东西学到任何东西。\n");

	if (!me->query_skill("literate", 1))
		return notify_fail("你是个文盲，先学点文化(literate)吧。\n");

        if (environment(me)->query("no_fight") &&
            (me->query("doing") != "scheme" || this_player(1)))
                return notify_fail("你无法在这个地方安心读书。\n");

	message("vision", me->name() + "正专心地研读" + ob->name() +
		"。\n", environment(me), me);
	if ((int)me->query("combat_exp") < ob->query("skill/exp_required"))
	{
		write("你的实战经验不足，再怎么读也没用。\n");
		return 1;
	}

	cost = (ob->query("skill/jing_cost") * 20 +
                ob->query("skill/difficulty") -
                me->query_int()) / 20;
	if (cost < 10) cost = 10;

        if (mapp(needs = ob->query("skill/need")))
        {
                foreach (need_sk in keys(needs))
                {
                        // check all skills
                        need_lvl = needs[need_sk];
                        if (functionp(need_lvl))
                                need_lvl = evaluate(need_lvl);
                        else
                        if (! intp(need_lvl))
                                need_lvl = 0;

                        if (me->query_skill(need_sk, 1) < need_lvl)
                                // not reach the line
                                return notify_fail("你研读了一会儿，发现如果不通晓" +
                                                   to_chinese(need_sk) +
                                                   "的话，恐怕难以领会上面的含义。\n");
                        // check next skill
                }
        }

        sname = ob->query("skill/name");
	notify_fail("以你目前的能力，还没有办法学这个技能。\n");
	if (! SKILL_D(sname)->valid_learn(me))
                return 0;

        if (! XUE_CMD->can_learn(me, sname))
                return 0;

	if (me->query_skill(sname, 1) > ob->query("skill/max_skill"))
		return notify_fail("你研读了一会儿，但是发现"
                                   "上面所说的对你而言都太浅"
                                   "了，没有学到任何东西。\n");

	if (me->query_skill(sname, 1) < ob->query("skill/min_skill"))
		return notify_fail("你研读了一会儿，但是却发现"
                                   "你对这门技能的理解还太浅"
                                   "，结果毫无收获。\n");

	if (! me->query_skill(sname, 1))
                me->set_skill(sname, 0);

	my_skill = me->query_skill(sname, 1);
	if (! me->can_improve_skill(sname))
        {
		return notify_fail("也许是缺乏实战经验，你对" +
                                   ob->name() + "上面所说的"
                                   "东西总是无法领会。\n");
	}

        me->set_temp("time/study", t);
	for (i = 0; i < times; i++)
	{
        	if ((int)me->query("jing") > cost)
                        me->receive_damage("jing", cost );
                else
                if (me->query("env/auto_regenerate") &&
                    SKILL_D("force/regenerate")->exert(me, me))
                {
                        // try to regenerate & learn again
                        write("你觉得精神好了一些，继续读书。\n");
                        i--;
                        continue;
                } else
                {
                        me->set("jing", 0);
                        break;
                }

		//me->improve_skill(sname, (int) me->query_skill("literate", 1) / 10 + 1);
		//天赋聪颖增加读书加成效果 by 薪有所属
		if (me->query("special_skill/clever"))
			me->improve_skill(sname, (int) me->query_skill("literate", 1) / 5 + 1);
		else
			me->improve_skill(sname, (int) me->query_skill("literate", 1) / 10 + 1);
	}
        if (! i)
        {
                write("你现在太累了，结果一行也没有看下去。\n");
                return 1;
        }

	if (zhao_name = SKILL_D(sname)->query_skill_name(my_skill))
	        write(sprintf("你研读了" + chinese_number(i) +
                      "行有关%s的技巧，对「%s」这一招似乎有些心得。\n",
		      to_chinese(sname), zhao_name));
	else
	        write(sprintf("你研读了"+chinese_number(i) +
                      "行有关%s的技巧，似乎有点心得。\n",
                      to_chinese(sname)));

        if (i < times)
                write("你现在已经过于疲倦，无法继续研读新知。\n");

	return 1;
}

int help(object me)
{
        write( @HELP
指令格式: study|du <物品名称> [次数]
          study|du <物品名称> with [次数]

这个指令使你可以通过阅读秘笈或其他物品自学某些技巧, 但前提
是: 你不能是个『文盲』。并且你不能在不能战斗的地方读书。

see also : learn
HELP );
        return 1;
}
