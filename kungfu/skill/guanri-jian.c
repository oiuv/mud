inherit SKILL;

mapping *action = ({
([      "action": "$N左手$w轻送，施出观日剑法起手「日出东海」向前刺出，罩向$n的$l",
        "force" : 153,
        "attack": 39,
        "dodge" : 65,
        "parry" : 67,
        "damage": 41,
        "lvl"   : 0,
        "skill_name" : "日出东海",
        "damage_type": "割伤"
]),
([      "action": "$N剑尖倏地翻上，手中$w斜刺$n$l，正是观日剑法中「寰阳万钧」一招",
        "force" : 167,
        "attack": 43,
        "dodge" : 68,
        "parry" : 69,
        "damage": 43,
        "lvl"   : 20,
        "skill_name" : "寰阳万钧",
        "damage_type": "刺伤"
]),
([      "action": "$N一招「丹阳破虚」，剑尖一抖，$w中宫直进，剑到中途却变转剑锋斜削$n",
        "force" : 173,
        "attack": 48,
        "dodge" : 71,
        "parry" : 79,
        "damage": 45,
        "lvl"   : 40,
        "skill_name" : "丹阳破虚",
        "damage_type": "割伤"
]),
([      "action": "$N手中$w微微颤动，一招「赤日炎炎」，忽然刺出，顿时一道剑光射向$n而去",
        "force" : 195,
        "attack": 51,
        "dodge" : 75,
        "parry" : 82,
        "damage": 49,
        "lvl"   : 60,
        "skill_name" : "赤日炎炎",
        "damage_type": "刺伤"
]),
([      "action": "$N左手紧握剑指，右手$w紫光暴涨，一式「烽火绝尘」，剑指剑锋同时刺向$n",
        "force" : 218,
        "attack": 57,
        "dodge" : 79,
        "parry" : 83,
        "damage": 53,
        "lvl"   : 80,
        "skill_name" : "烽火绝尘",
        "damage_type": "刺伤"
]),
([      "action": "$N一式「洪峰万里」，$w划了一个半月弧形，洒出点点火光，直飞$n而去",
        "force" : 224,
        "attack": 62,
        "dodge" : 85,
        "parry" : 89,
        "damage": 57,
        "lvl"   : 100,
        "skill_name" : "洪峰万里",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「炼狱洪炉」，手中$w对着$n猛攻数剑，招式精奇之极",
        "force" : 238,
        "attack": 69,
        "dodge" : 87,
        "parry" : 91,
        "damage": 61,
        "lvl"   : 130,
        "skill_name" : "炼狱洪炉",
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，一招「日照九天」，夹带着一阵炽热掠过$n全身",
        "force" : 257,
        "attack": 75,
        "dodge" : 95,
        "parry" : 99,
        "damage": 68,
        "lvl"   : 160,
        "skill_name" : "日照九天",
        "damage_type": "刺伤"
]),
([      "action": "$N一招「残阳血照」，使得若有若无，朦朦胧胧，$w斜斜划出，直取$n$l",
        "force" : 270,
        "attack": 81,
        "dodge" : 107,
        "parry" : 109,
        "damage": 73,
        "lvl"   : 190,
        "skill_name" : "残阳血照",
        "damage_type": "刺伤"
]),
([      "action": "$N长啸一声，一招「天火燎原」$w豪光绽放，剑尖顿时迸出数道剑气射向$n",
        "force" : 285,
        "attack": 85,
        "dodge" : 115,
        "parry" : 115,
        "damage": 77,
        "lvl"   : 220,
        "skill_name" : "天火燎原",
        "damage_type": "刺伤"
])
});

int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法学习观日剑法。\n");

        if (me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不足，无法学习观日剑法。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法太浅，无法学习观日剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("guanri-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的观日剑法。\n");

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
        level = (int) me->query_skill("guanri-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练观日剑法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练观日剑法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -70);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"guanri-jian/" + action;
}
