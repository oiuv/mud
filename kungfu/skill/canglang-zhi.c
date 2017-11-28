#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N一指点出，这一招「鲸蛟相搏」中宫直进，指气将$n压得揣不过气来",
        "force" : 41,
        "attack": 1,
        "parry" : 3,
        "dodge" : 5,
        "damage": 1,
        "lvl"   : 0,
        "damage_type" : "点穴",
        "skill_name"  : "鲸蛟相搏"
]),
([      "action": "$N身形不动，一招「翻江倒海」攻出。$n稍一犹豫，$N的中指已刺向自己",
        "force" : 49,
        "attack": 3,
        "parry" : 4,
        "dodge" : 7,
        "damage": 2,
        "lvl"   : 10,
        "damage_type" : "点穴",
        "skill_name"  : "翻江倒海"
]),
([      "action": "只见$N一转身，正是一式「龙腾万里」，一指由胁下穿出，疾刺$n的$l",
        "force" : 55,
        "attack": 6,
        "parry" : 7,
        "dodge" : 5,
        "damage": 4,
        "lvl"   : 20,
        "damage_type" : "点穴",
        "skill_name"  : "龙腾万里"
]),
([      "action": "只见$N一招「巨浪滔天」，十指如穿花蝴蝶一般上下翻飞，全全笼罩$n",   
        "force" : 71,
        "attack": 5,
        "parry" : 11,
        "dodge" : 19,
        "damage": 4,
        "lvl"   : 30,
        "damage_type" : "点穴",
        "skill_name"  : "巨浪滔天"
]),
([      "action": "只见$N面带微笑，负手而立，一招「遥观沧海」，$n顿觉一道指力直扑而来",
        "force" : 90,
        "attack": 8,
        "parry" : 12,
        "dodge" : 10,
        "damage": 7,
        "lvl"   : 40,
        "damage_type" : "点穴",
        "skill_name"  : "遥观沧海"
]),
([      "action": "忽听$N一声轻叱，一招「沧海一粟」，左手划了个半弧，食指闪电般点向$n",
        "force" : 110,
        "attack": 12,
        "parry" : 23,
        "dodge" : 25,
        "damage": 9,
        "lvl"   : 50,
        "damage_type" : "点穴",
        "skill_name"  : "沧海一粟"
]),
});

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练沧浪指法必须空手。\n");

        if ((int)me->query_skill("force") < 10)
                return notify_fail("你的内功火候不够，无法学沧浪指法。\n");

        if ((int)me->query_skill("finger", 1) < 10)
                return notify_fail("你的指法火候不够，无法学沧浪指法。\n");

        if ((int)me->query("max_neili") < 50)
                return notify_fail("你的内力修为太弱，无法练沧浪指法。\n");

        if (me->query_skill("finger", 1) < me->query_skill("canglang-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的沧浪指法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("canglang-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 30)
                return notify_fail("你的体力太低了，无法练沧浪指法。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的内力不够，无法练沧浪指法。\n");

        me->receive_damage("qi", 25);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"canglang-zhi/" + action;
}
