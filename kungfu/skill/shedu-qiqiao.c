// shedu-qiqiao.c
inherit SKILL;

mapping *action = ({
([      "action" : "$N左指挥出，一式「青蛇挺身」，削向$n的掌缘",
        "force" : 80,
        "dodge" : 5,
        "lvl" : 0,
        "skill_name" : "青蛇挺身",
        "damage_type" : "刺伤"
]),
([      "action" : "$N全身之力聚于一指，一式「银蛇吐信」，指向$n的胸前",
        "force" : 100,
        "dodge" : 5,
        "lvl" : 15,
        "damage" : 25,
        "skill_name" : "银蛇吐信",
        "damage_type" : "刺伤"
]),
([      "action" : "$N左掌贴于神道穴，右手一式「金蛇摆尾」，向$n的$l划过",
        "force" : 120,
        "dodge" : 8,
        "lvl" : 25,
        "damage" : 55,
        "skill_name" : "金蛇摆尾",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双目怒视，一式「蝮蛇捕食」，双指拂向$n的额、颈、肩、臂、胸、背",
        "force" : 150,
        "dodge" : 5,
        "damage": 65,
        "lvl" : 45,
        "skill_name" : "蝮蛇捕食",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一式「待机而行」，左掌掌心向外，右指蓄势点向$n的$l",
        "force" : 180,
        "dodge" : 15,
        "damage": 80,
        "lvl" : 60,
        "skill_name" : "待机而行",
        "damage_type" : "刺伤"
]),
([      "action" : "$N右手伸出，十指叉开，一式「猛蛇出洞」，小指拂向$n的太渊穴",
        "force" : 200,
        "dodge" : 20,
        "damage": 100,
        "lvl" : 70,
        "skill_name" : "猛蛇出洞",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双迸出无数道劲气，一式「千蛇缠身」射向$n的全身",
        "force" : 220,
        "dodge" : 25,
        "damage": 120,
        "lvl" : 80,
        "skill_name" : "千蛇缠身",
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage=="finger" || usage=="poison" || usage=="parry"; }

int valid_combine(string combo) { return combo == "lingshe-quan"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练蛇毒奇巧必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学蛇毒奇巧。\n");

        if ((int)me->query("max_neili") < 350)
                return notify_fail("你的内力太弱，无法练蛇毒奇巧。\n");

        if ((int)me->query_skill("poison", 1) < 30)
                return notify_fail("你的基本毒技火候不够，无法学蛇毒奇巧。\n");

        if ((int)me->query_skill("poison", 1) < (int)me->query_skill("shedu-qiqiao", 1))
                return notify_fail("你的基本毒技水平有限，无法领会更高深的蛇毒奇巧。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("shedu-qiqiao", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的蛇毒奇巧。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("shedu-qiqiao",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 55)
                return notify_fail("你的内力不够练蛇毒奇巧。\n");

        me->receive_damage("qi", 52);
        me->add("neili", -44);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shedu-qiqiao/" + action;
}
