inherit SKILL;

mapping *action = ({
([      "action": "$N使一招「飞雪式」，一掌直出，袭向$n$l",
        "force" : 60,
        "dodge" : 20,
        "parry" : 20,
        "attack": 15,
        "damage": 20,
        "lvl"   : 0,
        "skill_name" : "飞雪式",
        "damage_type": "瘀伤"
]),
([      "action": "$N左右双掌齐出，一招「落花式」，掌风呼呼，将$n笼罩",
        "force" : 85,
        "dodge" : 25,
        "parry" : 25,
        "attack": 17,
        "damage": 43,
        "lvl"   : 20,
        "skill_name" : "落花式",
        "damage_type":  "瘀伤"
]),
([      "action": "$N两手虎口相对，往内一圈，一招「千变万化」往$n的$l拍出",
        "force" : 155,
        "dodge" : 31,
        "parry" : 33,
        "attack": 21,
        "damage": 68,
        "lvl"   : 40,
        "skill_name" : "千变万化",
        "damage_type":  "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "piaofeng-quan";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练飞花掌法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学飞花掌法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练飞花掌法。\n");

        if ((int)me->query_skill("strike", 1) < 20)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("feihua-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的飞花掌法。\n");

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
        level = (int) me->query_skill("feihua-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练飞花掌法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"feihua-zhang/" + action;
}
