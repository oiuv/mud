// lianhua-zhi.c 莲花指

inherit SKILL;

mapping *action = ({
([      "action": "$N侧身抬臂，右指划了个半圈，一式「腊月开莲」击向$n的$l",
        "force" : 100,
        "attack": 10,
        "parry" : 15,
        "dodge" : -5,
        "lvl"   : 0,
        "skill_name" : "腊月开莲",
        "damage_type" : "刺伤"
]),
([      "action": "$N左掌虚托，一式「莲蕊璨目」，右指穿腋疾出，指向$n的胸前",
        "force" : 140,
        "attack": 15,
        "parry" : 18,
        "dodge" : -5,
        "lvl"   : 20,
        "skill_name" : "莲蕊璨目",
        "damage_type" : "刺伤"
]),
([      "action": "$N俯身斜倚，左手半推，右手一式「荷内莲香」，向$n的$l划过",
        "force" : 170,
        "attack": 20,
        "parry" : 25,
        "dodge" : 5,
        "lvl"   : 40,
        "skill_name" : "荷内莲香",
        "damage_type" : "刺伤"
]),
([      "action": "$N双目微睁，一式「杏莲九出」，双手幻化出千百个指影，拂向$n的$l",
        "force" : 210,
        "attack": 28,
        "parry" : 30,
        "dodge" : 5,
        "damage": 10,
        "lvl"   : 60,
        "skill_name" : "杏莲九出",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「七宝莲花」，左掌护住丹田，右手斜指苍天，蓄势点向$n的$l",
        "force" : 250,
        "attack": 30,
        "parry" : 35,
        "dodge" : 15,
        "damage": 10,
        "lvl"   : 80,
        "skill_name" : "七宝莲花",
        "damage_type" : "刺伤"
]),
([      "action": "$N双掌平托胸前，十指叉开，一式「叶底留莲」，指向$n的周身大穴",
        "force" : 280,
        "attack": 45,
        "parry" : 40,
        "dodge" : 20,
        "damage": 15,
        "lvl"   : 100,
        "skill_name" : "叶底留莲",
        "damage_type" : "刺伤"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练莲花指必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学莲花指。\n");

        if ((int)me->query_skill("finger", 1) < 60)
                return notify_fail("你的基本指法火候不够，无法学莲花指。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练莲花指。\n");

        if (me->query_skill("finger", 1) < me->query_skill("lianhua-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的莲花指。\n");

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
        level = (int)me->query_skill("lianhua-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练莲花指。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练莲花指。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"lianhua-zhi/" + action;
}
