inherit SKILL;

mapping *action = ({
([      "action": "$N双掌骤起，一招「电」字诀，一掌击向$n面门，另一掌却按向$n小腹",
        "force" : 185,
        "dodge" : 11,
        "parry" : 12,
        "attack": 9,
        "damage": 12,
        "lvl"   : 0,
        "skill_name" : "电字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N双掌互错，变幻莫测，一招「雨」字诀，瞬息之间向$n攻出了四四一十六招",
        "force" : 205,
        "dodge" : 18,
        "parry" : 17,
        "attack": 13,
        "damage": 17,
        "lvl"   : 20,
        "skill_name" : "雨字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N一声清啸，呼的一掌，一招「霜」字诀，去势奇快，向$n的$l猛击过去，",
        "force" : 217,
        "dodge" : 16,
        "parry" : 19,
        "attack": 17,
        "damage": 21,
        "lvl"   : 40,
        "skill_name" : "霜字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N双掌交错，若有若无，一招「震」字诀，自巧转拙，拍向$n的$l",
        "force" : 225,
        "dodge" : 24,
        "parry" : 21,
        "attack": 22,
        "damage": 33,
        "lvl"   : 60,
        "skill_name" : "震字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N一招「雳」字诀，右手一拳击出，左掌紧跟着在右拳上一搭，变成双掌下劈，击向$n的$l",
        "force" : 255,
        "dodge" : 24,
        "parry" : 28,
        "attack": 33,
        "damage": 41,
        "lvl"   : 80,
        "skill_name" : "雳字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N双手齐划，跟着双掌齐推，一招「霹」字诀，一股排山倒海的掌力，直扑$n面门",
        "force" : 267,
        "dodge" : 28,
        "parry" : 30,
        "attack": 36,
        "damage": 49,
        "lvl"   : 100,
        "skill_name" : "霹字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N突然滴溜溜的转身，一招「霆」字诀，掌影飞舞，霎时之间将$n四面八方都裹住了",
        "force" : 280,
        "dodge" : 24,
        "parry" : 21,
        "attack": 37,
        "damage": 51,
        "lvl"   : 120,
        "skill_name" : "霆字诀",
        "damage_type": "瘀伤"
]),
([      "action": "$N仰天大笑，势若疯狂，衣袍飞舞，一招「雷」字诀，掌风凌厉，如雨点般向$n打去",
        "force" : 320,
        "dodge" : 36,
        "parry" : 35,
        "attack": 41,
        "damage": 58,
        "lvl"   : 140,
        "skill_name" : "雷字诀",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练霹雳奔雷掌必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学霹雳奔雷掌。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练霹雳奔雷掌。\n");

        if ((int)me->query_skill("strike", 1) < 80)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("benlei-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的霹雳奔雷掌。\n");

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
        level = (int) me->query_skill("benlei-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练霹雳奔雷掌。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -90);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"benlei-zhang/" + action;
}
