// zijinbagua-dao.c
// Designed by qdz
//

inherit SKILL;

mapping *action = ({
([      "action" : "$N脚踏八卦方位，手中$w横推，由上至下向$n砍去",
        "force"  : 145,
        "attack" : 35,
        "dodge"  : 30,
        "parry"  : 12,
        "lvl"    : 0,
        "damage" : 32,
        "damage_type" : "割伤",
]),
([      "action" : "$N刀锋自下而上划了个半弧，$w一提一收，平刃挥向$n的颈部",
        "force"  : 173,
        "attack" : 42,
        "dodge"  : 40,
        "parry"  : 15,
        "lvl"    : 30,
        "damage" : 38,
        "damage_type" : "割伤",
]),
([      "action" : "$N脚踏八卦方位，斜步上前，将$w舞得如白雾一般压向$n",
        "force"  : 198,
        "attack" : 51,
        "dodge"  : 45,
        "parry"  : 17,
        "lvl"    : 50,
        "damage" : 44,
        "damage_type" : "割伤",
]),
([      "action" : "$N转“嵌”位至“易”位，$w缓缓的斜着向$n推去",
        "force"  : 237,
        "attack" : 55,
        "dodge"  : 55,
        "parry"  : 21,
        "lvl"    : 80,
        "damage" : 50,
        "damage_type" : "割伤",
]),
([      "action" : "$N手拖$w，转身跃起，一道白光射向$n的胸口",
        "force"  : 261,
        "attack" : 55,
        "dodge"  : 27,
        "parry"  : 32,
        "lvl"    : 100,
        "damage" : 65,
        "damage_type" : "割伤",
]),
([      "action" : "$N挥舞$w，上劈下撩，左挡右开，齐齐罩向$n",
        "force"  : 287,
        "attack" : 70,
        "dodge"  : 30,
        "parry"  : 35,
        "lvl"    : 120,
        "damage" : 70,
        "damage_type" : "割伤",
]),
([      "action" : "$N左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force"  : 360,
        "attack" : 80,
        "dodge"  : 45,
        "parry"  : 35,
        "lvl"    : 140,
        "damage" : 86,
        "damage_type" : "割伤",
]),
([      "action" : "$N蓦的使一招「八卦八阵」，顿时剑光中无数朵刀花从四面八方涌向$n全身",
        "force"  : 410,
        "attack" : 95,
        "dodge"  : 64,
        "parry"  : 32,
        "lvl"    : 160,
        "damage" : 89,
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为尚浅，无法练习紫金八卦刀。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 120 )
                return notify_fail("你的基本刀法水平有限，无法练习紫金八卦刀。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("zijinbagua-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的紫金八卦刀。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("zijinbagua-dao", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 90)
                return notify_fail("你的体力不够，练不了紫金八卦刀。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够，练不了紫金八卦刀。\n");

        me->receive_damage("qi", 85);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zijinbagua-dao/" + action;
}


