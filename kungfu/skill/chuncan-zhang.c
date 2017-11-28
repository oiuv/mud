inherit SKILL;

mapping *action = ({
([      "action" : "$N一式「破茧出笼」，双掌间升起一团淡淡的白雾，缓缓推向$n的$l",
        "force" : 30,
        "dodge" : 15,
        "parry" : 20,
        "damage": 1,
        "lvl" : 0,
        "skill_name" : "破茧出笼",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一式「锦绸抽丝」，左掌凝重，右掌轻盈，同时向$n的$l击去",
        "force" : 55,
        "dodge" : 28,
        "parry" : 25,
        "damage": 3,
        "lvl" : 20,
        "skill_name" : "锦绸抽丝",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N突地一招「蚕丝绵绵」，双掌挟着一阵风雷之势，猛地劈往$n的$l",
        "force" : 70,
        "dodge" : 42,
        "parry" : 38,
        "damage": 9,
        "lvl" : 40,
        "skill_name" : "蚕丝绵绵",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「千丝万缕」，双掌缦妙地一阵挥舞，不觉已击到$n的$l上",
        "force" : 91,
        "dodge" : 53,
        "parry" : 49,
        "damage": 12,
        "lvl" : 80,
        "skill_name" : "千丝万缕",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「碧蚕春生」，身形凝立不动，双掌一高一低，看似简单，却令$n无法躲闪",
        "force" : 102,
        "dodge" : 61,
        "parry" : 57,
        "damage": 18,
        "lvl" : 120,
        "skill_name" : "碧蚕春生",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo) { return combo == "hujia-quan"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练春蚕掌法必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学春蚕掌法。\n");

        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力太弱，无法练春蚕掌法。\n");

        if ((int)me->query_skill("strike", 1) < 20)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("chuncan-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的春蚕掌法。\n");

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
        level = (int) me->query_skill("chuncan-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练春蚕掌法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -25);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chuncan-zhang/" + action;
}
