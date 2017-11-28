inherit SKILL;

mapping *action = ({
([      "action": "$N左手$w轻送，施出雪山剑法起手「朝天势」向前刺出，罩向$n的$l",
        "force" : 153,
        "attack": 39,
        "dodge" : 65,
        "parry" : 67,
        "damage": 41,
        "lvl"   : 0,
        "skill_name" : "朝天势",
        "damage_type": "割伤"
]),
([      "action": "$N剑尖倏地翻上，手中$w斜刺$n$l，正是雪山派剑法中「老枝横斜」一招",
        "force" : 167,
        "attack": 43,
        "dodge" : 68,
        "parry" : 69,
        "damage": 43,
        "lvl"   : 20,
        "skill_name" : "老枝横斜",
        "damage_type": "刺伤"
]),
([      "action": "$N一招「雪泥鸿爪」，剑尖一抖，$w中宫直进，剑到中途却变转剑锋，斜削$n",
        "force" : 173,
        "attack": 48,
        "dodge" : 71,
        "parry" : 79,
        "damage": 45,
        "lvl"   : 40,
        "skill_name" : "雪泥鸿爪",
        "damage_type": "割伤"
]),
([      "action": "$N手中$w微微颤动，一招「朔风忽起」，忽然刺出，顿时一道剑光射向$n的$l",
        "force" : 195,
        "attack": 51,
        "dodge" : 75,
        "parry" : 82,
        "damage": 49,
        "lvl"   : 60,
        "skill_name" : "朔风忽起",
        "damage_type": "刺伤"
]),
([      "action": "$N左手紧握剑指，右手$w上隐隐透出青气，一式「岭上双梅」，剑指剑锋同时刺向$n",
        "force" : 218,
        "attack": 57,
        "dodge" : 79,
        "parry" : 83,
        "damage": 53,
        "lvl"   : 80,
        "skill_name" : "岭上双梅",
        "damage_type": "刺伤"
]),
([      "action": "$N一式「明驼西来」，$w划了一个半月弧形，洒出点点银光，直飞$n$l而去",
        "force" : 224,
        "attack": 62,
        "dodge" : 85,
        "parry" : 89,
        "damage": 57,
        "lvl"   : 100,
        "skill_name" : "明驼西来",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「梅雪争春」，手中$w对着$n猛攻数剑，招式精奇，荡气回肠",
        "force" : 238,
        "attack": 69,
        "dodge" : 87,
        "parry" : 91,
        "damage": 61,
        "lvl"   : 130,
        "skill_name" : "梅雪争春",
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，一招「暗香疏影」，夹带着一阵旋风掠过$n全身",
        "force" : 257,
        "attack": 75,
        "dodge" : 95,
        "parry" : 99,
        "damage": 68,
        "lvl"   : 160,
        "skill_name" : "暗香疏影",
        "damage_type": "刺伤"
]),
([      "action": "$N一招「月色黄昏」，使得若有若无，朦朦胧胧，$w斜斜划出，直取$n$l",
        "force" : 270,
        "attack": 81,
        "dodge" : 107,
        "parry" : 109,
        "damage": 73,
        "lvl"   : 190,
        "skill_name" : "月色黄昏",
        "damage_type": "刺伤"
]),
([      "action": "$N长啸一声，一招「鹤飞九天」，手中$w豪光绽放，剑尖顿时迸出数道剑气射向$n",
        "force" : 285,
        "attack": 85,
        "dodge" : 115,
        "parry" : 115,
        "damage": 77,
        "lvl"   : 220,
        "skill_name" : "鹤飞九天",
        "damage_type": "刺伤"
])
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不到，无法学习雪山剑法。\n");

        if (me->query("max_neili") < 1200)
                return notify_fail("你的内力太差，无法学习雪山剑法。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候太浅，无法学习雪山剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("xueshan-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的雪山剑法。\n");

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
        level = (int) me->query_skill("xueshan-jian", 1);
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
                return notify_fail("你的体力不够练雪山剑法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练雪山剑法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -70);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xueshan-jian/" + action;
}
