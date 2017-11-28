inherit SKILL;

mapping *action = ({
([      "action" : "$N一式「白云出岫」，双掌间升起一团淡淡的白雾，缓缓推向$n的$l",
        "force" : 50,
        "dodge" : 5,
        "parry" : 10,
        "damage": 5,
        "lvl" : 0,
        "skill_name" : "白云出岫",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N并指如剑，一式「白虹贯日」，疾向$n的$l戳去",
        "force" : 60,
        "dodge" : -5,
        "parry" : 15,
        "damage": 5,
        "lvl" : 10,
        "skill_name" : "白虹贯日",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一式「云断秦岭」，左掌微拂，右掌乍伸乍合，猛地插往$n的$l",
        "force" : 65,
        "dodge" : 5,
        "parry" : 10,
        "damage": 10,
        "lvl" : 20,
        "skill_name" : "云断秦岭",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双掌隐隐泛出青气，一式「青松翠翠」，幻成漫天碧绿的松针，雨点般向$n击去",
        "force" : 70,
        "dodge" : 10,
        "parry" : 20,
        "damage": 15,
        "lvl" : 30,
        "skill_name" : "青松翠翠",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身形往上一纵，使出一式「天绅倒悬」，双掌并拢，笔直地向$n的$l插去",
        "force" : 75,
        "dodge" : 15,
        "parry" : 10,
        "damage": 15,
        "lvl" : 40,
        "skill_name" : "天绅倒悬",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身形一变，使一式「无边落木」，双掌带着萧刹的劲气，猛地击往$n的$l",
        "force" : 80,
        "dodge" : 15,
        "parry" : 15,
        "damage": 20,
        "lvl" : 50,
        "skill_name" : "无边落木",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一式「高山流水」，左掌凝重，右掌轻盈，同时向$n的$l击去",
        "force" : 85,
        "dodge" : 20,
        "parry" : 15,
        "damage": 20,
        "lvl" : 60,
        "skill_name" : "高山流水",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N突地一招「金玉满堂」，双掌挟着一阵风雷之势，猛地劈往$n的$l",
        "force" : 90,
        "dodge" : 20,
        "parry" : 20,
        "damage": 25,
        "lvl" : 70,
        "skill_name" : "金玉满堂",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「风伴流云」，双掌缦妙地一阵挥舞，不觉已击到$n的$l上",
        "force" : 110,
        "dodge" : 15,
        "parry" : 20,
        "damage": 25,
        "lvl" : 80,
        "skill_name" : "风伴流云",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「烟雨飘渺」，身形凝立不动，双掌一高一低，看似简单，却令$n无法躲闪",
        "force" : 120,
        "dodge" : 25,
        "parry" : 10,
        "damage": 30,
        "lvl" : 90,
        "skill_name" : "烟雨飘渺",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "huashan-quan";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练华山掌法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学华山掌法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练华山掌法。\n");

        if ((int)me->query_skill("strike", 1) < 20)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("huashan-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的华山掌法。\n");

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
        level = (int) me->query_skill("huashan-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练华山掌法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"huashan-zhang/" + action;
}
