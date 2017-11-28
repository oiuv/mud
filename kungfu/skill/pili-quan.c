inherit SKILL;

mapping *action = ({
([      "action": "$N使一招「霹雳闪」，双拳飞出，袭向$n$l",
        "force" : 130,
        "dodge" : 20,
        "parry" : 20,
        "attack": 15,
        "damage": 20,
        "lvl"   : 0,
        "skill_name" : "霹雳闪",
        "damage_type": "瘀伤"
]),
([      "action": "$N左右双拳连环击出，一招「天雷轰」，拳风骤响，袭向$n$l",
        "force" : 185,
        "dodge" : 25,
        "parry" : 25,
        "attack": 17,
        "damage": 43,
        "lvl"   : 20,
        "skill_name" : "天雷轰",
        "damage_type":  "瘀伤"
]),
([      "action": "$N左掌圈花扬起，屈肘当胸，右手虎口朝上，一招「天地绝」打向$n的",
        "force" : 220,
        "dodge" : 31,
        "parry" : 33,
        "attack": 21,
        "damage": 68,
        "lvl"   : 40,
        "skill_name" : "天地绝",
        "damage_type":  "内伤"
]),
});

int valid_enable(string usage) { return usage == "cuff" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "feihua-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练霹雳闪必须空手。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候不够，无法学霹雳神拳。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练霹雳神拳。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("pili-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的霹雳神拳。\n");

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
        level = (int) me->query_skill("pili-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练霹雳神拳。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"pili-quan/" + action;
}
