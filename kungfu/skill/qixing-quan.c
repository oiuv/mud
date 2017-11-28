inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「星光灿烂」，双拳闪动, 攻向$n的$l",
        "force"  : 120,
        "dodge"  : 10,
        "damage" : 2,
        "lvl"    : 0,
        "skill_name" : "星光灿烂",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招「摇光易位」，一拳横扫，气势如虹，击向$n的$l",
        "force"  : 140,
        "dodge"  : 12,
        "damage" : 5,
        "lvl"    : 20,
        "skill_name" : "摇光易位",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身影向飘动，脸浮微笑，一招「星过长空」，右拳快速拍向$n的$l",
        "force"  : 150,
        "dodge"  : 16,
        "damage" : 15,
        "lvl"    : 40,
        "skill_name" : "星过长空",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招「群星闪烁」，双拳数分数合，$n只觉到处是$N的拳影",
        "force"  : 160,
        "dodge"  : 18,
        "damage" : 22,
        "lvl"    : 60,
        "skill_name" : "群星闪烁",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N施展开「千变万化」绕着$n一转，飞身游走，拳出如风，不住的击向$n。",
        "force"  : 170,
        "dodge"  : 21,
        "damage" : 26,
        "lvl"    : 80,
        "skill_name" : "千变万化",
        "damage_type" : "瘀伤"
]),
([      "action" : "只见$N突然猛跨两步，已到$n面前，右拳陡出，迅如崩雷，"
                   "一招「流星雨」击向$n的前胸",
        "force"  : 220,
        "dodge"  : 22,
        "damage" : 30,
        "lvl"    : 100,
        "skill_name" : "点石成金",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一招「北斗生采」，拳影交错，上中下一齐攻向$n。",
        "force"  : 250,
        "dodge"  : 25,
        "damage" : 35,
        "lvl"    : 120,
        "skill_name" : "北斗生采",
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage=="cuff" || usage=="parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练七星拳法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法练七星拳法。\n");

        if ((int)me->query("max_neili") < 120)
                return notify_fail("你的内力太弱，无法练七星拳法。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("qixing-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的七星拳法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("qixing-quan",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的内力不够练七星拳法。\n");

        me->receive_damage("qi", 36);
        me->add("neili", -18);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qixing-quan/" + action;
}
