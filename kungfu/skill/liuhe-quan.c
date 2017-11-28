inherit SKILL;

mapping *action = ({
([      "action": "$N马步一立，身子微曲，暗喝一声，一招「猫蹿」，一拳直捅$n的$l",
        "force" : 30,
        "dodge" : 5,
        "parry" : 7,
        "attack": 4,
        "damage": 4,
        "lvl"   : 0,
        "skill_name" : "猫蹿",
        "damage_type": "瘀伤"
]),
([      "action": "$N哈哈一笑，左拳由下至上，右拳平平击出，一招「兔滚」，交替打向$n",
        "force" : 45,
        "dodge" : 18,
        "parry" : 17,
        "attack": 6,
        "damage": 6,
        "lvl"   : 20,
        "skill_name" : "兔滚",
        "damage_type": "瘀伤"
]),
([      "action": "$N对$n一声大喝，使一招「鹰翻」，左拳击出，随即右拳跟上，两重力道打向$n的$l",
        "force" : 57,
        "dodge" : 16,
        "parry" : 19,
        "attack": 7,
        "damage": 11,
        "lvl"   : 40,
        "skill_name" : "鹰翻",
        "damage_type": "瘀伤"
]),
([      "action": "$N闷喝一声，双拳向上分开，一记「鹞子翻身」，拳划弧线，左右同时击向$n的$l",
        "force" : 65,
        "dodge" : 24,
        "parry" : 21,
        "attack": 9,
        "damage": 14,
        "lvl"   : 60,
        "skill_name" : "鹞子翻身",
        "damage_type": "瘀伤"
]),
([      "action": "$N施出「细胸巧」，一声大吼，一拳凌空打出，拳风直逼$n的$l",
        "force" : 85,
        "dodge" : 24,
        "parry" : 28,
        "attack": 13,
        "damage": 19,
        "lvl"   : 80,
        "skill_name" : "细胸巧",
        "damage_type": "瘀伤"
]),
([      "action": "$N一声长啸，双拳交错击出，一招「跺子脚」，拳风密布$n的前后左右",
        "force" : 97,
        "dodge" : 28,
        "parry" : 30,
        "attack": 16,
        "damage": 21,
        "lvl"   : 100,
        "skill_name" : "跺子脚",
        "damage_type": "瘀伤"
]),
([      "action": "$N怒吼一声，凌空飞起，一式「松子灵」，双拳居高临下，齐齐捶向$n",
        "force" : 115,
        "dodge" : 24,
        "parry" : 21,
        "attack": 17,
        "damage": 24,
        "lvl"   : 120,
        "skill_name" : "松子灵",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "unarmed" || usage == "cuff" || usage == "parry"; }

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练六合拳必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学六合拳。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练六合拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 20)
                return notify_fail("你的基本拳脚火候太浅。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("liuhe-quan", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的六合拳。\n");

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
        level = (int) me->query_skill("liuhe-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 100 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if( (int)me->query("neili") < 80 )
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -50);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"liuhe-quan/" + action;
}
