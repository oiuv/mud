inherit SKILL;

mapping *action = ({
([      "action": "$N使一招「云里乾坤」，右拳至左拳之底穿出，对准$n$l猛然攻去",
        "force" : 50,
        "dodge" : 20,
        "parry" : 20,
        "attack": 15,
        "damage": 20,
        "lvl"   : 0,
        "skill_name" : "云里乾坤",
        "damage_type": "瘀伤"
]),
([      "action": "$N左拳突然张开，拳开变掌，一招「雾里看花」便往$n的$l招呼过去",
        "force" : 65,
        "dodge" : 25,
        "parry" : 25,
        "attack": 17,
        "damage": 23,
        "lvl"   : 20,
        "skill_name" : "雾里看花",
        "damage_type":  "瘀伤"
]),
([      "action": "$N两手虎口相对，往内一圈，一招「金鼓齐鸣」往$n的$l击出",
        "force" : 85,
        "dodge" : 31,
        "parry" : 33,
        "attack": 21,
        "damage": 28,
        "lvl"   : 40,
        "skill_name" : "金鼓齐鸣",
        "damage_type":  "瘀伤"
]),
([      "action": "$N步履一沉，左拳虚晃一招，右拳使出「梅花弄影」击向$n$l",
        "force" : 110,
        "dodge" : 42,
        "parry" : 45,
        "attack": 35,
        "damage": 33,
        "lvl"   : 60,
        "skill_name" : "梅花弄影",
        "damage_type":  "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "cuff" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "huashan-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练华山拳法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学华山拳法。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("huashan-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的华山拳法。\n");

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
        level = (int) me->query_skill("huashan-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练华山拳法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"huashan-quan/" + action;
}
