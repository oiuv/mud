inherit SKILL;

mapping *action = ({
([      "action": "$N双手不住地忽伸忽缩，手臂关节喀喇声响，右掌一立，左掌啪的一下朝$n$l击去",
        "force" : 100,
        "attack": 18,
        "dodge" : 30,
        "parry" : 15,
        "damage": 40,
        "lvl"   : 0,
        "damage_type": "瘀伤"
]),
([      "action": "$N身形挫动，风声虎虎，接着朝$n连发八掌，一掌快似一掌，一掌猛似一掌",
        "force" : 200,
        "attack": 25,
        "dodge" : 40,
        "parry" : 30,
        "damage": 45,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "action": "$N攸地变爪为掌，身子不动，右臂陡长，潜运内力，一掌朝$n$l劈去",
        "force" : 250,
        "attack": 35,
        "dodge" : 50,
        "parry" : 55,
        "damage": 45,
        "lvl"   : 60,
        "damage_type": "瘀伤"
]),
([      "action": "$N一声怪啸，形如飘风，左掌已如风行电挚般拍向$n，掌未到，风先至，迅猛已极",
        "force" : 290,
        "attack": 42,
        "dodge" : 70,
        "parry" : 75,
        "damage": 43,
        "lvl"   : 90,
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "wusheng-zhao";
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("tianchan-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练天蟾掌必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法练天蟾掌。\n");

        if ((int)me->query("max_neili") < 450)
                return notify_fail("你的内力太弱，无法练天蟾掌。\n");

        if (me->query_skill("strike", 1) < me->query_skill("tianchan-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的天蟾掌。\n");

        return 1;
}


int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了，先休息一下吧。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练天蟾掌。\n");

        if (me->query_skill("tianchan-zhang", 1) < 50)
                me->receive_damage("qi", 30);
        else
                me->receive_damage("qi", 35);

        me->add("neili", -54);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianchan-zhang/" + action;
}

