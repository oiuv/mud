inherit SKILL;

mapping *action = ({
([      "action" : "$N脚踏八卦方位，手中$w横推，由上至下向$n砍去",
        "force"  : 145,
        "attack" : 35,
        "dodge"  : 30,
        "parry"  : 12,
        "lvl"    : 0,
        "damage" : 12,
        "damage_type" : "割伤",
]),
([      "action" : "$N刀锋自下而上划了个半弧，$w一提一收，平刃挥向$n的颈部",
        "force"  : 153,
        "attack" : 42,
        "dodge"  : 40,
        "parry"  : 15,
        "lvl"    : 20,
        "damage" : 18,
        "damage_type" : "割伤",
]),
([      "action" : "$N脚踏八卦方位，斜步上前，将$w舞得如白雾一般压向$n",
        "force"  : 168,
        "attack" : 51,
        "dodge"  : 45,
        "parry"  : 17,
        "lvl"    : 40,
        "damage" : 24,
        "damage_type" : "割伤",
]),
([      "action" : "$N转“嵌”位至“易”位，$w缓缓的斜着向$n推去",
        "force"  : 187,
        "attack" : 55,
        "dodge"  : 55,
        "parry"  : 21,
        "lvl"    : 60,
        "damage" : 35,
        "damage_type" : "割伤",
]),
([      "action" : "$N手拖$w，转身跃起，一道白光射向$n的胸口",
        "force"  : 201,
        "attack" : 55,
        "dodge"  : 27,
        "parry"  : 32,
        "lvl"    : 80,
        "damage" : 35,
        "damage_type" : "割伤",
]),
([      "action" : "$N挥舞$w，上劈下撩，左挡右开，齐齐罩向$n",
        "force"  : 227,
        "attack" : 70,
        "dodge"  : 30,
        "parry"  : 35,
        "lvl"    : 100,
        "damage" : 40,
        "damage_type" : "割伤",
]),
([      "action" : "$N左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force"  : 260,
        "attack" : 80,
        "dodge"  : 45,
        "parry"  : 35,
        "lvl"    : 120,
        "damage" : 46,
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 350)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的基本内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("shangjia-dao", 1))
                return notify_fail("你的基本刀法火候有限，无法领会更高深的商家刀法。\n");

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
        level = (int) me->query_skill("shangjia-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练商家刀法。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的体力不够练商家刀法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shangjia-dao/" + action;
}
