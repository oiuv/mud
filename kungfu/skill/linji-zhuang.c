// linji-zhuang.c 临济十二庄

#include <ansi.h>

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int query_neili_improve(object me)
{
        int lvl;

	if (me->query("sex"))
		return 0;

        lvl = (int)me->query_skill("linji-zhuang", 1);
        return lvl * lvl * 15 * 21 / 100 / 200 + 500;
}

int valid_force(string force)
{
        return force == "wudang-xinfa" ||
               force == "emei-xinfa" ||
               force == "taiji-shengong";
}

int valid_learn(object me)
{
  int nf, nh, np;
	nf = (int)me->query_skill("force", 1);
	nh = (int)me->query_skill("linji-zhuang", 1);
	np = (int)me->query_skill("mahayana", 1);

        if (me->query("gender") != "女性")
                return notify_fail("你非女子，不能练习临济十二庄。\n");

        if (np <= nh && np < 200)
                return notify_fail("你的大乘涅磐功修为不够，无法领会更高深的临济十二庄。\n");

        if (nf < 40)
                return notify_fail("你的基本内功火候还不够，无法领会临济十二庄。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("临济十二庄只能用学(learn)的来增加熟练度。\n");
}

void skill_improved(object me)
{
        switch (me->query_skill("linji-zhuang",1))
        {
        case 30:
                tell_object(me, HIG "你已经把天地庄练成了！\n" NOR );
                break;
        case 60:
                tell_object(me, HIG "你已经把之心庄练成了！\n" NOR );
                break;
        case 90:
                tell_object(me, HIG "你已经把龙鹏庄练成了！\n" NOR );
                break;
        case 120:
                tell_object(me, HIG "你已经把风云庄练成了！\n" NOR );
                break;
        case 150:
                tell_object(me, HIG "你已经把大小庄练成了！\n" NOR );
                break;
        case 180:
                tell_object(me, HIG "你已经把幽冥庄练成了！\n" NOR );
                break;
        }
        return;
}

string exert_function_file(string func)
{
        return __DIR__"linji-zhuang/" + func;
}
