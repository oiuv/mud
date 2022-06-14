// 流星锤法 - 李文秀的武功，绝招：星月争辉
inherit SKILL;

mapping *action = ({
    ([
        "action":"$N一招「星光灿烂」，$w连连闪动，攻向$n的$l",
        "force":120,
        "dodge":10,
        "damage":2,
        "lvl":0,
        "skill_name":"星光灿烂",
        "damage_type":"瘀伤"]),
    ([
        "action":"$N一招「流星赶月」，$w气势如虹，击向$n的$l",
        "force":140,
        "dodge":12,
        "damage":5,
        "lvl":20,
        "skill_name":"流星赶月",
        "damage_type":"瘀伤"]),
    ([
        "action":"$N身影飘动，一招「星过长空」，$w快速砸向$n的$l",
        "force":150,
        "dodge":16,
        "damage":15,
        "lvl":40,
        "skill_name":"星过长空",
        "damage_type":"瘀伤"]),
    ([
        "action":"$N一招「群星闪烁」，$w数分数合，$n只觉无处躲避",
        "force":160,
        "dodge":18,
        "damage":30,
        "lvl":60,
        "skill_name":"群星闪烁",
        "damage_type":"瘀伤"]),
    ([
        "action":"$N突然猛跨两步，$w陡出，迅如崩雷，一招「流星火雨」击向$n的前胸",
        "force":220,
        "dodge":22,
        "damage":50,
        "lvl":100,
        "skill_name":"流星火雨",
        "damage_type":"瘀伤"]),
});

int valid_enable(string usage) { return usage=="whip" || usage=="parry"; }

int valid_learn(object me)
{
    object weapon;
    if (!objectp(weapon = me->query_temp("weapon")) ||
        (string)weapon->query("skill_type") != "whip")
        return notify_fail("练流星锤的武器不对呀。\n");

    if ((int)me->query_skill("force") < 50)
        return notify_fail("你的内功火候不够，无法练流星锤法。\n");

    if ((int)me->query("max_neili") < 150)
        return notify_fail("你的内力太弱，无法练流星锤法。\n");

    if ((int)me->query_skill("whip", 1) < 50)
        return notify_fail("你的基本鞭法火候太浅。\n");

    if ((int)me->query_skill("whip", 1) < (int)me->query_skill("liuxing-chui", 1))
        return notify_fail("你的基本鞭法水平有限，无法领会更高深的流星锤法。\n");

    return 1;
}

mapping query_action(object me, object weapon)
{
    int i, level;
    level = (int) me->query_skill("liuxing-chui", 1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 50)
        return notify_fail("你的体力太低了。\n");

    if ((int)me->query("neili") < 30)
        return notify_fail("你的内力不够练流星锤法。\n");

    me->receive_damage("qi", 36);
    me->add("neili", -18);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"liuxing-chui/" + action;
}
