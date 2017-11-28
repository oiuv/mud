// longxiang.c 龙象般若功
//

#include <ansi.h>

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "mizong-neigong" ||
               force == "xiaowuxiang";
}

void skill_improved(object me)
{
        int lvl;

        lvl = me->query_skill("longxiang", 1);
        if (lvl % 30 == 0)
                write(HIY "你修炼成了第" + chinese_number(lvl / 30 + 1) +
                      "层龙象般若功！\n" NOR);
        else
                write(HIR "你的第" + chinese_number(lvl / 30 + 1) +
                      "层龙象般若功又增进了一层。\n" NOR);
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("longxiang", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force", 1) < 70)
                return notify_fail("你的基本内功火候还不够。\n");

        if (me->query("gender") == "无性" && (int)me->query_skill("longxiang", 1) > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的龙象般若功。\n");

        if (me->query("str") < 30)
                return notify_fail("你先天膂力不足，无法学习刚猛的龙象般若功。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("龙象般若功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"longxiang/" + func;
}

int difficult_level()
{
        object me;
        int lvl;

        if (me = this_player())
        {
                // 有小无相功？难以学习。
                if (lvl = me->query_skill("xiaowuxiang", 1))
                        return 3000;

                // 有九阳神功？较难学习。
                if (lvl = me->query_skill("jiuyang-shengong", 1))
                        return 1000;
        }

        return 500;
}
