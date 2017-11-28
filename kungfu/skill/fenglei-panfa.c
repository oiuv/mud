#include <ansi.h>;
inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「秋风起夕」，右手立掌而出，左手单臂抡起$w，夹杂着阵阵风声向$n$l砸去",
        "skill_name" : "秋风起夕",
        "force" : 320,
        "attack": 27,
        "dodge" : -10,
        "parry" : 40,
        "lvl"   : 0,
        "damage": 62,
        "damage_type" : "挫伤",
]),
([      "action" : "$N将手中$w抛上半空，跃起一掌砸在$w上，这式「风吹云散」有如流星坠地，直轰$n",
        "skill_name" : "风吹云散",
        "force" : 260,
        "attack": 38,
        "dodge" : -20,
        "parry" : 45,
        "lvl"   : 40,
        "damage": 66,
        "damage_type" : "挫伤",
]),
([      "action" : "凭空闪出一道雪白的光幕，光电闪烁中$w挟「雷雨交加」的无上劲力，从$N手中飞出砍向$n的$l",
        "skill_name" : "雷雨交加",
        "force" : 300,
        "attack": 43,
        "dodge" : -20,
        "parry" : 47,
        "lvl"   : 80,
        "damage": 70,
        "damage_type" : "挫伤",
]),
([      "action" : "$N双眼磕闭，全身衣物却在内劲冲击下涨如气球，那$w在这「八方云涌」的推动下，向$n缓缓压来",
        "skill_name" : "八方云涌",
        "force" : 340,
        "attack": 51,
        "dodge" : 5,
        "parry" : 50,
        "lvl"   : 120,
        "damage": 75,
        "damage_type" : "挫伤",
]),
([      "action" : "$N双手画圈，光幕宛如一轮明月，将$P笼罩，这「九天雷动」的劲力带着$w以排山倒海之势飞旋而出",
        "skill_name" : "九天雷动",
        "force" : 380,
        "attack": 55,
        "dodge" : -10,
        "parry" : 55,
        "lvl"   : 160,
        "damage": 80,
        "damage_type" : "挫伤",
]),
});


int valid_enable(string usage) { return usage == "hammer" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("hammer", 1) < (int)me->query_skill("fenglei-panfa", 1))
                return notify_fail("你的基本锤法水平有限，无法领会更高深的风雷盘法。\n");

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
        level = (int) me->query_skill("fenglei-panfa",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力不够，练不了风雷盘法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够，练不了风雷盘法。\n");

        me->receive_damage("qi", 90);
        me->add("neili", -90);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fenglei-panfa/" + action;
}
