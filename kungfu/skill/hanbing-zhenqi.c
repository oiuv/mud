// hanbing-zhenqi.c 寒冰真气
// by vin
// modify by rcwiz

#include <ansi.h>
inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force) 
{       return force == "huashan-xinfa" ||
               force == "henshan-xinfa" ||
               force == "songshan-xinfa" ||
               force == "zixia-shengong" ||
               force == "zhenyue-jue"; 
}


int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("hanbing-zhenqi", 1);
          return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落")
                return notify_fail("你心中暗想：我行事光明磊落，学这阴毒的"
                                   "武功做甚。\n");

        if (me->query("gender") == "无性"
           && (int)me->query_skill("hanbing-zhenqi", 1) > 19)
                return notify_fail("你无根无性，阴阳不调，难以锻炼寒冰真气。\n");

        if (me->query("con") < 34)
                return notify_fail("你先天根骨不够，无法修炼寒冰真气！\n");

        if (me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功火候不够，难以锻炼寒冰真气。\n");

        if (me->query("max_neili") < 1000)
                return notify_fail("你目前的内力修为不够，难以锻炼寒冰真气。\n");

        if (me->query_skill("force", 1) < me->query_skill("hanbing-zhenqi", 1))
                return notify_fail("你的基本内功水平不够，难以锻炼更深厚的寒冰真气。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("寒冰真气只能用学(learn)的来增加熟练度。\n");
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        mixed result;
        int lvl  = me->query_skill("hanbing-zhenqi", 1);
        int flvl = me->query("jiali");

        result = ::hit_ob(me, victim, damage_bonus, factor);

        if (intp(result) && result > 0)
        {
                if (me->query("neili") < 500
                   || lvl < 220
                   || flvl < 100
                   || random(2) != 1)
                        return;

                if (me->query_temp("weapon")
                   || me->query_temp("secondary_weapon")
                   || ! me->query_temp("freezing"))
                        return;

                if (flvl * 2 + random(lvl) > victim->query_skill("force"))
                {
                        victim->affect_by("freezing",
                               ([ "level"    : flvl * 3,
                                  "id"       : me->query("id"),
                                  "duration" : lvl / 50 + random(lvl / 20) ]));

                        me->add("neili", -80);

                        return random(2) ? ([ "damage" : result,
                                              "msg"    : HIW "$n" HIW "接下$N" HIW "一招，霎"
                                                         "时只感到寒风袭体，说不出的恶心难受"
                                                         "。\n" NOR ]):

                                           ([ "damage" : result,
                                              "msg"    : HIW "只见$n" HIW "全身一颤，嘴皮乌"
                                                         "紫，竟似受了$N" HIW "寒冰内劲的干"
                                                         "扰。\n" NOR ]);
                }
        }
        return result;
}

string exert_function_file(string func)
{
        return __DIR__"hanbing-zhenqi/" + func;
}

