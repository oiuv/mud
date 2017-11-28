inherit SKILL;

mapping *action = ({
([      "action" : "$N藏刀内收，一招「碧海青天」，刀锋自下而上划了个半弧，向$n的$l挥去",
        "force" : 10,
        "attack": 18,
        "dodge" : 1,
        "parry" : 5,
        "damage": 10,
        "lvl" : 0,
        "skill_name" : "碧海青天",
        "damage_type" : "割伤"
]),
([      "action" : "$N左掌虚托右肘，一招「碧玉丹心」，手中$w笔直划向$n的$l",
        "force" : 30,
        "attack": 16,
        "dodge" : 3,
        "parry" : 7,
        "damage": 12,
        "lvl" : 20,
        "skill_name" : "碧玉丹心",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「青烟缈缈」，$w绕颈而过，刷地一声自上而下向$n猛劈",
        "force" : 53,
        "attack": 19,
        "dodge" : 2,
        "parry" : 13,
        "damage": 17,
        "lvl" : 40,
        "skill_name" : "青烟缈缈",
        "damage_type" : "割伤"
]),
([      "action" : "$N右手反执刀柄，一招「烟碧三宵」，猛一挫身，$w直向$n的颈中斩去",
        "force" : 61,
        "attack": 27,
        "dodge" : 5,
        "parry" : 19,
        "damage": 25,
        "lvl" : 60,
        "skill_name" : "烟碧三宵",
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「烟消云散」，无数刀尖化作点点繁星，向$n的$l挑去",
        "force" : 80,
        "attack": 52,
        "dodge" : 10,
        "parry" : 11,
        "damage": 30,
        "lvl" : 80,
        "skill_name" : "烟消云散",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候不到，无法学习碧烟刀法。\n");

        if (me->query("max_neili") < 350)
                return notify_fail("你的内力太差，无法学习碧烟刀法。\n");

        if ((int)me->query_skill("blade", 1) < 30)
                return notify_fail("你的基本刀法火候太浅，无法学习碧烟刀法。\n");

        if (me->query_skill("blade", 1) < me->query_skill("biyan-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的碧烟刀法。\n");

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
        level = (int) me->query_skill("biyan-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon")) || 
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够练碧烟刀法。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的内力不够练碧烟刀法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -20);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"biyan-dao/" + action;
}
