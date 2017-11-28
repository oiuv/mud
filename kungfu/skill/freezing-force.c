// freezing-force.c 少林 冰蚕寒功
// Feb.21 1998 by Java

#include <ansi.h>

inherit FORCE;

int valid_enable(string usage)
{
        return usage == "force";
}

int valid_force(string force)
{
        return force == "guixi-gong" ||
               force == "huagong-dafa";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("freezing-force", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_learn(object me)
{
        if (me->query_skill("force", 1) < 50)
                return notify_fail("你的基本内功火候不够，难以锻炼冰蚕寒功！\n");

        if (me->query_skill("yijinjing", 1))
                me->delete_skill("yijinjing");

        if (me->query_skill("force", 1) < me->query_skill("freezing-force", 1))
                return notify_fail("你的基本内功水平不够，难以锻炼更深厚的冰蚕寒功！\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("冰蚕寒功无法通过简单的练习来增加熟练度。\n");
}

// hit effect called by combatd
mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        mixed result;
        int lvl;
        int flvl;

        result = ::hit_ob(me, victim, damage_bonus, factor);
        if (intp(result) && result > 0)
        {
                lvl  = me->query_skill("freezing-force", 1);
                flvl = me->query("jiali");
                if (lvl < 80 || flvl < 10)
                        return;
                        
                if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                        return;

                if (flvl * 2 + random(lvl) > victim->query_skill("force"))
                {
                        victim->affect_by("freezingbc",
                                ([ "level" : flvl * 3 / 2 + random(flvl / 2),
                                   "id"    : me->query("id"),
                                   "duration" : lvl / 40 + random(lvl / 20) ]));

                        return ([ "damage" : result,
                                  "msg" : HIW "霎时$n" HIW "只觉得寒风袭"
                                          "体，有种说不出的难受。\n" NOR ]);
                }
        }

        return result;
}

string exert_function_file(string func)
{
        return __DIR__"freezing-force/" + func;
}

