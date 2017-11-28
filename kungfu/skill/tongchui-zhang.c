inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「千锤百炼」，单掌平势缓推而出，陡然拍向$n的$l",
        "force"  : 33,
        "dodge"  : 5,
        "parry"  : 2,
        "attack" : 2,
        "damage" : 1,
        "lvl"    : 0,
        "skill_name" : "千锤百炼",
        "damage_type": "瘀伤"
]),
([      "action" : "$N使一招「旁敲侧击」，右手划了一个圈子，左手挥劈$n而去",
        "force"  : 45,
        "dodge"  : 18,
        "parry"  : 17,
        "attack" : 6,
        "damage" : 4,
        "lvl"    : 20,
        "skill_name" : "旁敲侧击",
        "damage_type": "瘀伤"
]),
([      "action" : "$N右手由钩变掌，使一招「力拔千钧」，单掌登时横扫$n的$l",
        "force"  : 51,
        "dodge"  : 16,
        "parry"  : 19,
        "attack" : 11,
        "damage" : 7,
        "lvl"    : 40,
        "skill_name" : "力拔千钧",
        "damage_type": "瘀伤"
]),
([      "action" : "$N双手划弧，双掌轮番拍出，使一招「威震八方」砍向$n的面门",
        "force"  : 62,
        "dodge"  : 24,
        "parry"  : 21,
        "attack" : 15,
        "damage" : 9,
        "lvl"    : 60,
        "skill_name" : "威震八方",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
        return combo == "jueming-tui";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练铜锤掌法必须空手。\n");

        if ((int)me->query_skill("force") < 15)
                return notify_fail("你的内功火候不够，无法学铜锤掌法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力修为太弱，无法练铜锤掌法。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("tongchui-zhang", 1))
                return notify_fail("你的基本掌法火候不足，无法领会更高深的铜锤掌法。\n");

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
        level = (int) me->query_skill("tongchui-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练铜锤掌法。\n");

        me->receive_damage("qi", 48);
        me->add("neili", -42);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tongchui-zhang/" + action;
}
