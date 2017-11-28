inherit SKILL;

mapping *action = ({
([      "action": "$N马步一立，身子微曲，暗喝一声，一招「望月拜天」，一拳直捅$n的$l",
        "force" : 30,
        "dodge" : 5,
        "parry" : 7,
        "attack": 4,
        "damage": 4,
        "lvl"   : 0,
        "skill_name" : "望月拜天",
        "damage_type": "瘀伤"
]),
([      "action": "$N哈哈一笑，左拳由下至上，右拳平平击出，一招「跨日向天」，交替打向$n",
        "force" : 45,
        "dodge" : 18,
        "parry" : 17,
        "attack": 6,
        "damage": 6,
        "lvl"   : 20,
        "skill_name" : "跨日向天",
        "damage_type": "瘀伤"
]),
([      "action": "$N对$n一声大喝，使一招「长虹经天」，左拳击出，随即右拳跟上，两重力道打向$n的$l",
        "force" : 57,
        "dodge" : 16,
        "parry" : 19,
        "attack": 7,
        "damage": 11,
        "lvl"   : 40,
        "skill_name" : "长虹经天",
        "damage_type": "瘀伤"
]),
([      "action": "$N闷喝一声，双拳向上分开，一记「举火烧天」，拳划弧线，左右同时击向$n的$l",
        "force" : 65,
        "dodge" : 24,
        "parry" : 21,
        "attack": 9,
        "damage": 14,
        "lvl"   : 60,
        "skill_name" : "举火烧天",
        "damage_type": "瘀伤"
]),
([      "action": "$N施出「一臂擎天」，一声大吼，一拳凌空打出，拳风直逼$n的$l",
        "force" : 85,
        "dodge" : 24,
        "parry" : 28,
        "attack": 13,
        "damage": 19,
        "lvl"   : 80,
        "skill_name" : "一臂擎天",
        "damage_type": "瘀伤"
]),
([      "action": "$N一声长啸，双拳交错击出，一招「石破天惊」，拳风密布$n的前后左右",
        "force" : 97,
        "dodge" : 28,
        "parry" : 30,
        "attack": 16,
        "damage": 21,
        "lvl"   : 100,
        "skill_name" : "石破天惊",
        "damage_type": "瘀伤"
]),
([      "action": "$N怒吼一声，凌空飞起，一式「天崩地裂」，双拳居高临下，齐齐捶向$n",
        "force" : 115,
        "dodge" : 24,
        "parry" : 21,
        "attack": 17,
        "damage": 24,
        "lvl"   : 120,
        "skill_name" : "天崩地裂",
        "damage_type": "瘀伤"
]),
([      "action": "$N仰天大笑，势若疯狂，衣袍飞舞，一招「无法无天」，拳风凌厉，如雨点般向$n打去",
        "force" : 135,
        "dodge" : 26,
        "parry" : 25,
        "attack": 23,
        "damage": 28,
        "lvl"   : 140,
        "skill_name" : "无法无天",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "cuff" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "kunlun-zhang" || combo == "sanyin-shou";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练震天拳必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学震天拳。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练震天拳。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("zhentian-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的震天拳。\n");

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
        level = (int) me->query_skill("zhentian-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练震天拳法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhentian-quan/" + action;
}
