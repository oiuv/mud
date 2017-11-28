inherit SKILL;

mapping *action = ({
([      "action" : "$N手持$w一刀劈下，迅即无比，势不可当",
        "force"  : 160,
        "dodge"  : 20,
        "parry"  : 25,
        "lvl"    : 0,
        "damage" : 44,
        "damage_type" : "割伤",
]),
([      "action" : "$N刀锋自下而上划了个半弧，$w忽深忽吐，刺向$n的颈部",
        "force"  : 180,
        "dodge"  : 30,
        "parry"  : 40,
        "lvl"    : 25,
        "damage" : 58,
        "damage_type" : "割伤",
]),
([      "action" : "$N忽然将$w舞得天花乱坠，闪电般压向$n",
        "force"  : 200,
        "dodge"  : 35,
        "parry"  : 50,
        "lvl"    : 50,
        "damage" : 56,
        "damage_type" : "割伤",
]),
([      "action" : "$N一横$w，刀锋像门板一样向$n推去，封住$n所有的退路",
        "force"  : 230,
        "dodge"  : 45,
        "parry"  : 55,
        "lvl"    : 70,
        "damage" : 62,
        "damage_type" : "内伤",
]),
([      "action" : "$N转身跃起，手舞$w，身与刀进合做一道电光射向$n",
        "force"  : 265,
        "dodge"  : 50,
        "parry"  : 75,
        "lvl"    : 90,
        "damage" : 70,
        "damage_type" : "割伤",
]),
([      "action" : "$N挥舞$w，乱砍乱杀，$w化作道道白光，上下翻飞罩向$n",
        "force"  : 270,
        "dodge"  : 55,
        "parry"  : 85,
        "lvl"    : 110,
        "damage" : 75,
        "damage_type" : "割伤",
]),
([      "action" : "$N将$w使得毫无章法，不守半点规矩，偏生快得出奇，$w挟风声劈向$n的$l",
        "force"  : 290,
        "dodge"  : 52,
        "parry"  : 90,
        "lvl"    : 130,
        "damage" : 80,
        "damage_type" : "割伤",
]),
([      "action" : "$N大喝一声，手中的$w就如长虹一般向$n直劈而下",
        "force"  : 310,
        "dodge"  : 61,
        "parry"  : 95,
        "lvl"    : 150,
        "damage" : 85,
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage)
{
        return usage == "blade" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 160)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 60)
                return notify_fail("你的基本刀法火候不够，无法学习天雷绝刀。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("tianlei-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的天雷绝刀。\n");

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
        level   = (int) me->query_skill("tianlei-dao", 1);
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

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够，练不了天雷绝刀。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，练不了天雷绝刀。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -68);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianlei-dao/" + action;
}