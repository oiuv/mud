inherit SKILL;

mapping *action = ({
([      "action" : "$N藏刀内收，刀锋自下而上划了个半弧，向$n的$l挥去",
        "force" : 193,
        "dodge" : 3,
        "parry" : 5,
        "damage": 61,
        "attack": 33,
        "lvl" : 0,
        "damage_type" : "割伤"
]),
([      "action" : "$N左掌虚托右肘，手中$w笔直划向$n的$l",
        "force" : 217,
        "dodge" : 9,
        "parry" : 7,
        "damage": 68,
        "attack": 37,
        "lvl" : 20,
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w绕颈而过，刷地一声自上而下向$n猛劈",
        "force" : 225,
        "dodge" : 13,
        "parry" : 7,
        "damage": 73,
        "attack": 38,
        "lvl" : 40,
        "damage_type" : "割伤"
]),
([      "action" : "$N右手反执刀柄，猛一挫身，$w直向$n的颈中斩去",
        "force" : 239,
        "dodge" : 11,
        "parry" : 9,
        "damage": 79,
        "attack": 41,
        "lvl" : 60,
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w幻出无数刀尖，化作点点繁星，向$n的$l挑去",
        "force" : 257,
        "dodge" : 11,
        "parry" : 13,
        "damage": 83,
        "attack": 48,
        "lvl" : 80,
        "damage_type" : "割伤"
]),
([      "action" : "$N双手合执$w，拧身急转，刀尖直刺向$n的双眼",
        "force" : 276,
        "dodge" : 19,
        "parry" : 23,
        "damage": 89,
        "attack": 53,
        "lvl" : 100,
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w划出一个大平十字，向$n纵横劈去",
        "force" : 312,
        "dodge" : 17,
        "parry" : 13,
        "damage": 97,
        "attack": 59,
        "lvl" : 120,
        "damage_type" : "割伤"
]),
([      "action" : "$N反转刀尖对准自己，全身一个翻滚，$w向$n拦腰斩去",
        "force" : 297,
        "dodge" : 18,
        "parry" : 21,
        "damage": 113,
        "attack": 68,
        "lvl" : 140,
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w的刀光仿佛化成一簇簇烈焰，将$n团团围绕",
        "force" : 323,
        "dodge" : 29,
        "parry" : 23,
        "damage": 117,
        "attack": 69,
        "lvl" : 170,
        "damage_type" : "割伤"
]),
([      "action" : "$N刀尖平指，一片片切骨刀气如飓风般裹向$n的全身",
        "force" : 317,
        "dodge" : 31,
        "parry" : 25,
        "damage": 121,
        "attack": 78,
        "lvl" : 200,
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return (usage == "blade") || (usage == "parry")
; }

int valid_learn(object me)
{
        if (me->query("character") != "心狠手辣" && me->query("character") != "国士无双")
                return notify_fail("你觉得这霸刀刀法实在过于狠毒，自己委实学不会。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力不足，没有办法练霸刀刀法，多练些内力再来吧。\n");

        if ((int)me->query_skill("blade", 1) < 180)
                return notify_fail("你的基本刀法火候太浅，没有办法练霸刀刀法。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅，没有办法练霸刀刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("badao-daofa", 1))
                return notify_fail("你的基本刀法水平还不够，无法领会更高深的霸刀刀法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("badao-daofa",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练霸刀刀法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练霸刀刀法。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -60);
        return 1;
}

