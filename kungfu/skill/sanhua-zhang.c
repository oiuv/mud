// sanhua-zhang.c 散花掌

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N合掌抱球，一式「春深芳草尽」，双掌变幻吞吐，缓缓推向$n的$l",
        "force" : 350,
        "attack": 69,
        "dodge" : 75,
        "parry" : 50,
        "damage": 25,
        "skill_name" : "春深芳草尽",
        "damage_type" : "瘀伤"
]),
([      "action": "$N五指绽开，一式「夏闲独兰馨」，左右掌穿插翻飞，疾向$n的$l拍去",
        "force" : 360,
        "attack": 72,
        "dodge" : 60,
        "parry" : 65,
        "damage": 20,
        "skill_name" : "夏闲独兰馨",
        "damage_type" : "瘀伤"
]),
([      "action": "$N使一式「秋酣菊霜清」，左掌虚托，右掌乍伸乍合，猛地插往$n的$l",
        "force" : 340,
        "attack": 79,
        "dodge" : 55,
        "parry" : 70,
        "damage": 32,
        "skill_name" : "秋酣菊霜清",
        "damage_type" : "瘀伤"
]),
([      "action": "$N双掌血红，一式「冬卧听梅吟」，幻成漫天梅花朵朵，雨点般向$n击去",
        "force" : 370,
        "attack": 67,
        "dodge" : 50,
        "parry" : 60,
        "damage": 35,
        "skill_name" : "冬卧听梅吟",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo == "nianhua-zhi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练散花掌必须空手。\n");

        if ((int)me->query_skill("force", 1) < 60)
                return notify_fail("你的内功火候不够，无法学散花掌。\n");

        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力太弱，无法练散花掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("sanhua-zhang", 1))
                return notify_fail("你的基本掌法火候水平有限，无法领会更高深的散花掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练散花掌。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -66);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sanhua-zhang/" + action;
}
