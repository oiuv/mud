inherit SKILL;

mapping *action = ({
([      "action": "$N手中的$w荡出，一招「太阳剑」，就如大江东去，势不可挡",
        "force" : 153,
        "attack": 39,
        "dodge" : 65,
        "parry" : 67,
        "damage": 41,
        "lvl"   : 0,
        "skill_name" : "太阳剑",
        "damage_type": "割伤"
]),
([      "action": "$N踏上一步，一招「少阴剑」，手中$w舞出一道剑光劈向$n的$l",
        "force" : 167,
        "attack": 43,
        "dodge" : 68,
        "parry" : 69,
        "damage": 43,
        "lvl"   : 20,
        "skill_name" : "少阴剑",
        "damage_type": "割伤"
]),
([      "action": "$N手中$w一抖，一招「少阳剑」，一剑刺向$n的$l，没有半点花巧",
        "force" : 173,
        "attack": 48,
        "dodge" : 71,
        "parry" : 79,
        "damage": 45,
        "lvl"   : 40,
        "skill_name" : "少阳剑",
        "damage_type": "割伤"
]),
([      "action": "$N手中$w微微颤动，一招「太阴剑」，忽然刺出，顿时一道剑光射向$n的$l",
        "force" : 195,
        "attack": 51,
        "dodge" : 75,
        "parry" : 82,
        "damage": 49,
        "lvl"   : 60,
        "skill_name" : "太阴剑",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「天地定位」，横过$w，蓦然横扫$n，气势如宏",
        "force" : 218,
        "attack": 57,
        "dodge" : 79,
        "parry" : 83,
        "damage": 53,
        "lvl"   : 80,
        "skill_name" : "天地定位",
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，一招「山泽通气」，夹带着一阵旋风掠过$n全身",
        "force" : 224,
        "attack": 62,
        "dodge" : 85,
        "parry" : 89,
        "damage": 57,
        "lvl"   : 100,
        "skill_name" : "山泽通气",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「雷风相薄」，手中$w猛然攻下，蓦然横扫$n，气势如宏",
        "force" : 238,
        "attack": 69,
        "dodge" : 87,
        "parry" : 91,
        "damage": 61,
        "lvl"   : 130,
        "skill_name" : "雷风相薄",
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，一招「水火不射」，夹带着一阵旋风掠过$n全身",
        "force" : 257,
        "attack": 75,
        "dodge" : 95,
        "parry" : 99,
        "damage": 68,
        "lvl"   : 160,
        "skill_name" : "水火不射",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「八卦相错」，横转$w蓦然横扫$n，气势如宏",
        "force" : 270,
        "attack": 81,
        "dodge" : 107,
        "parry" : 109,
        "damage": 73,
        "lvl"   : 190,
        "skill_name" : "八卦相错",
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，一招「乾坤无极」，夹带着一阵旋风掠过$n全身",
        "force" : 285,
        "attack": 85,
        "dodge" : 115,
        "parry" : 115,
        "damage": 77,
        "lvl"   : 220,
        "skill_name" : "乾坤无极",
        "damage_type": "刺伤"
])
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不到，无法学习乾坤神剑。\n");

        if (me->query("max_neili") < 2000)
                return notify_fail("你的内力太差，无法学习乾坤神剑。\n");

        if ((int)me->query_skill("sword", 1) < 150)
                return notify_fail("你的基本剑法火候太浅，无法学习乾坤神剑。\n");

        if (me->query_skill("sword", 1) < me->query_skill("qiankun-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的乾坤神剑。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("qiankun-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon")) || 
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练乾坤神剑。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练乾坤神剑。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -70);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qiankun-jian/" + action;
}
