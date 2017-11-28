
#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N右手中指斜指而出，一招「天山指」已袭向$n$l",
        "force" : 90,
        "dodge" : 5,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "点穴",
        "skill_name" : "天龙式"
]),
([      "action": "$N飞身而起，左手食指一伸，一式「六绝指」罩向$n要穴",
        "force" : 140,
        "attack": 5,
        "parry" : 5,
        "dodge" : 5,
        "damage": 20,
        "lvl" : 40,
        "damage_type" : "点穴",
        "skill_name" : "天龙式"
]),
([      "action": "$N化掌为指，右手无名指连连指出，一股气流袭向$n$l",
        "force" : 155,
        "attack": 10,
        "parry" : 7,
        "dodge" : 5,
        "damage": 30,
        "lvl"   : 40,
        "damage_type" : "点穴",
        "skill_name" : "天龙式"
]),
([      "action": "$N纵身而起，双手成指一式「天龙式」猛地指向$n$l",
        "force" : 220,
        "attack": 40,
        "parry" : 21,
        "dodge" : 15,
        "damage": 55,
        "lvl"   : 100,
        "damage_type" : "点穴",
        "skill_name" : "天龙式"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("大天龙指必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学大天龙指。\n");

        if ((int)me->query_skill("finger", 1) < 40)
                return notify_fail("你的基本指法火候不够，无法学大天龙指。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力太弱，无法练大天龙指。\n");

        if (me->query_skill("finger", 1) < me->query_skill("tianlong-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的大天龙指。\n");

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
        level = (int)me->query_skill("tianlong-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练大天龙指。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练大天龙指。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianlong-zhi/" + action;
}

