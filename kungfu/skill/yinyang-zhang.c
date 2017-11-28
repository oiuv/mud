#include <ansi.h>
inherit SKILL;

mapping *action = ({
([  "action": "$N使出一招「山阴手」，运掌如飞，招招直打$n的$l",
    "force" : 60,
    "attack": 25,
    "dodge" : 10,
    "parry" : 16,
    "damage": 15,
    "lvl"   : 0,
    "skill_name" : "山阴手" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N使出一招「千层刃」，双掌急运内力，带着凛冽的掌风直拍$n的$l",
    "force" : 80,
    "attack": 55,
    "dodge" : 15,
    "parry" : 19,
    "damage": 25,
    "lvl"   : 20,
    "skill_name" : "千层刃" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N惨然一声长啸，一招「消魂刀」，双掌猛然击下，直扑$n的要脉",
    "force" : 100,
    "attack": 45,
    "dodge" : 20,
    "parry" : 18,
    "damage": 50,
    "lvl"   : 40,
    "skill_name" : "消魂刀" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N骨骼暴响，双臂忽然暴长数尺，一招「离魂掌」直直攻向$n的$l",
    "force" : 130,
    "attack": 40,
    "dodge" : 20,
    "parry" : 23,
    "damage": 65,
    "lvl"   : 80,
    "skill_name" : "离魂掌" ,
    "damage_type" : "瘀伤"
]),
([  "action": "$N施展出一招「夺魂手」，双掌缤纷拍出，陡然间双掌已至$n跟前",
    "force" : 150,
    "attack": 61,
    "dodge" : 32,
    "parry" : 35,
    "damage": 80,
    "lvl"   : 120,
    "skill_name" : "夺魂手" ,
    "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
            return notify_fail("练阴阳掌必须空手。\n");

        if ((int)me->query("max_neili") < 200)
            return notify_fail("你的内力修为太浅，无法练习阴阳掌。\n");

        if ((int)me->query_skill("strike", 1) < 30)
            return notify_fail("你的基本掌法太差，无法领会阴阳掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("yinyang-zhang", 1))
            return notify_fail("你的基本掌法火候不够，无法领会更高深的阴阳掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("yinyang-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -48);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yinyang-zhang/" + action;
}

