inherit SKILL;

mapping *action = ({
([      "skill_name": "阳关三叠",
        "action": "$N双掌一错，一招「阳关三叠」幻出层层掌影奔向$n的$l",
        "force" : 70,
        "attack": 5,
        "dodge" : 20,
        "parry" : 20,
        "damage": 50,
        "lvl"   : 0,
        "damage_type":  "瘀伤"
]),
([      "skill_name": "地久天长",
        "action": "$N暴喝一声，单掌猛然推出，一招「地久天长」强劲的掌风直扑$n的$l",
        "force" : 90,
        "attack": 10,
        "dodge" : 25,
        "parry" : 25,
        "damage": 50,
        "lvl"   : 15,
        "damage_type":  "瘀伤"
]),
([      "skill_name": "金龙戏水",
        "action": "$N双掌纷飞，一招「金龙戏水」直取$n的$l",
        "force" : 110,
        "attack": 20,
        "dodge" : 32,
        "parry" : 32,
        "damage": 33,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "skill_name": "万物复苏",
        "action": "$N按北斗方位急走，一招「万物复苏」，阵阵掌风无孔不入般地击向$n的$l",
        "force" : 140,
        "attack": 30,
        "dodge" : 30,
        "parry" : 45,
        "damage": 70,
        "lvl"   : 50,
        "damage_type": "瘀伤"
]),
([      "skill_name": "回光反照",
        "action": "$N回身错步，双掌平推，凝神聚气，一招「回光反照」拍向$n的$l",
        "force" : 170,
        "attack": 35,
        "dodge" : 45,
        "parry" : 50,
        "damage": 30,
        "lvl"   : 70,
        "damage_type": "瘀伤"
]),
([      "skill_name": "神光乍现",
        "action": "$N左掌立于胸前，右掌推出，一招「神光乍现」迅然击向$n$l",
        "force" : 190,
        "attack": 40,
        "dodge" : 50,
        "parry" : 52,
        "damage": 30,
        "lvl"   : 90,
        "damage_type": "瘀伤"
]),
([      "skill_name": "百里千长",
        "action": "$N使出「百里千长」，身形急进，快速向$n出掌攻击",
        "force" : 220,
        "attack": 40,
        "dodge" : 65,
        "parry" : 55,
        "damage": 30,
        "lvl"   : 110,
        "damage_type": "瘀伤"
]),
([      "skill_name": "星游九天",
        "action": "$N一招「星游九天」，双掌虚虚实实的击向$n的$l",
        "force" : 250,
        "attack": 45,
        "dodge" : 60,
        "parry" : 57,
        "damage": 30,
        "lvl"   : 130,
        "damage_type": "瘀伤"
]),
([      "skill_name": "北斗易位",
        "action": "$N左掌画了个圈圈，右掌推出，一招「北斗易位」击向$n$l",
        "force" : 270,
        "attack": 50,
        "dodge" : 68,
        "parry" : 61,
        "damage": 30,
        "lvl"   : 150,
        "damage_type": "瘀伤"
]),
});

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练重阳神掌必须空手。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不足，无法练重阳神掌。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法练重阳神掌。\n");

        if ((int)me->query_skill("strike", 1) < 100)
                return notify_fail("你的基本掌法水平有限，无法学重阳神掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("chongyang-shenzhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的重阳神掌。\n");

        return 1;
}

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "zhongnan-zhi";
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("chongyang-shenzhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够了，休息一下再练吧。\n");

        if ((int)me->query("neili") < 65)
                return notify_fail("你的内力不够了，休息一下再练吧。\n");

        me->receive_damage("qi", 60);
        me->add("force", -55);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chongyang-shenzhang/" + action;
}
