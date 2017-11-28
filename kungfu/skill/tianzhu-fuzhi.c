// tianzhu-fuzhi.c 天竺拂指

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N侧身抬臂，右指划了个半圈，轻轻拂向向$n$l，不着力道",
        "force" : 100,
        "attack": 10,
        "parry" : 15,
        "dodge" : -5,
        "lvl"   : 0,
        "damage_type" : "点穴"
]),
([      "action": "$N左掌虚托，右手中指穿腋疾出，轻拂$n胸前的诸多要穴",
        "force" : 140,
        "attack": 15,
        "parry" : 18,
        "dodge" : -5,
        "lvl"   : 20,
        "damage_type" : "点穴"
]),
([      "action": "$N俯身斜倚，左手半推，右手中指和食指向$n的$l轻轻拂过",
        "force" : 170,
        "attack": 20,
        "parry" : 25,
        "dodge" : 5,
        "lvl"   : 40,
        "damage_type" : "点穴"
]),
([      "action": "$N双目微睁，双手十指幻化出千百个指影，拂向$n的$l",
        "force" : 210,
        "attack": 28,
        "parry" : 30,
        "dodge" : 5,
        "damage": 10,
        "lvl"   : 60,
        "damage_type" : "点穴"
]),
([      "action": "只见$N左掌护住丹田，右手斜指苍天，蓄势点向$n的$l",
        "force" : 250,
        "attack": 30,
        "parry" : 35,
        "dodge" : 15,
        "damage": 10,
        "lvl"   : 80,
        "damage_type" : "点穴"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练天竺拂指必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学天竺拂指。\n");

        if ((int)me->query_skill("finger", 1) < 10)
                return notify_fail("你的基本指法火候不够，无法学天竺拂指。\n");

        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力太弱，无法练天竺拂指。\n");

        if (me->query_skill("finger", 1) < me->query_skill("tianzhu-fuzhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的天竺拂指。\n");

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
        level = (int) me->query_skill("tianzhu-fuzhi",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练天竺拂指。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练天竺拂指。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianzhu-fuzhi/" + action;
}
