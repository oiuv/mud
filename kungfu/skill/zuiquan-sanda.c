inherit SKILL;

mapping *action = ({
([      "action": "$N连续上步，脚下蹒跚，双拳缓缓划向$n的$l",
        "force" : 80,
        "attack": 12,
        "parry" : 14,
        "dodge" : 5,
        "lvl"   : 0,
        "damage_type" : "瘀伤"
]),
([      "action": "$N左脚虚踏，全身右转，摆姿扭腰，右臂顺势猛地扫向$n的$l",
        "force" : 100,
        "attack": 15,
        "parry" : 16,
        "dodge" : 10,
        "lvl"   : 8,
        "damage_type" : "瘀伤"
]),
([      "action": "$N身子往前一晃，伸出双掌，指天打地，猛的向$n的$l劈去",
        "force" : 120,
        "attack": 18,
        "parry" : 19,
        "dodge" : 5,
        "lvl"   : 15,
        "damage_type" : "瘀伤"
]),
([      "action": "$N脚下一个不稳，身子顿时向前一倾，双掌顺势拍出，如闪电一般切向$n",
        "force" : 170,
        "attack": 23,
        "parry" : 24,
        "dodge" : 10,
        "lvl"   : 42,
        "damage_type" : "瘀伤"
]),
([      "action": "$N摇摇晃晃，偏偏倒倒，可双拳却拳出如风，笼罩着$n头，胸，腹三处要害",
        "force" : 200,
        "attack": 25,
        "parry" : 24,
        "dodge" : 5,
        "lvl"   : 50,
        "damage_type" : "瘀伤"
]),
([      "action": "$N醉眼朦胧，但却举重若轻，一声大喝，喷出一口酒气，单掌挟千钧之力拍向$n",
        "force" : 210,
        "attack": 28,
        "parry" : 25,
        "dodge" : 10,
        "lvl"   : 58,
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "unarmed" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练醉拳三打必须空手。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候不够，无法学醉拳三打。\n");

        if ((int)me->query("max_neili") < 50)
                return notify_fail("你的内力太弱，无法练醉拳三打。\n");

        if (me->query_skill("unarmed", 1) < me->query_skill("zuiquan-sanda", 1)
           && me->query_skill("cuff", 1) < me->query_skill("zuiquan-sanda", 1))
                return notify_fail("你拳脚与拳法均火候不足，无法领会更高"
                                   "深的醉拳三打。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("zuiquan-sanda", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 35)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 25);
        me->add("neili", -20);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__ "zuiquan-sanda/" + action;
}
