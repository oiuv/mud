#include <ansi.h>;
inherit SKILL;

mapping *action = ({
([      "action" : "$N左手单臂抡起$w，一招「开山」，夹杂着阵阵风声向$n$l砸去",
        "skill_name" : "开山",
        "force" : 320,
        "attack": 27,
        "dodge" : -30,
        "parry" : -34,
        "lvl"   : 0,
        "damage": 62,
        "damage_type" : "挫伤",
]),
([      "action" : "$N将手中$w划出一道半弧，一式「断岳」便如流星坠地，直轰$n",
        "skill_name" : "断岳",
        "force" : 460,
        "attack": 38,
        "dodge" : -27,
        "parry" : -45,
        "lvl"   : 40,
        "damage": 66,
        "damage_type" : "挫伤",
]),
([      "action" : "突然间$N手中$w挟着无上劲力，一招「劈天」施出，飞砍向$n而去",
        "skill_name" : "劈天",
        "force" : 500,
        "attack": 43,
        "dodge" : -25,
        "parry" : -47,
        "lvl"   : 80,
        "damage": 70,
        "damage_type" : "挫伤",
]),
([      "action" : "$N嗔目大喝，施一招「分海」，$w在劲力推动之下，向$n缓缓压来",
        "skill_name" : "分海",
        "force" : 540,
        "attack": 51,
        "dodge" : -45,
        "parry" : -50,
        "lvl"   : 120,
        "damage": 75,
        "damage_type" : "挫伤",
]),
([      "action" : "$N紧握$w，那势「还虚」的劲力便如同排山倒海般朝$n飞旋而出",
        "skill_name" : "还虚",
        "force" : 580,
        "attack": 55,
        "dodge" : -20,
        "parry" : -25,
        "lvl"   : 160,
        "damage": 80,
        "damage_type" : "挫伤",
]),
([      "action" : "$N高举$w，那势「破衲」的劲力便如同排山倒海般朝$n飞旋而出",
        "skill_name" : "破衲",
        "force" : 620,
        "attack": 65,
        "dodge" : -40,
        "parry" : -35,
        "lvl"   : 180,
        "damage": 98,
        "damage_type" : "挫伤",
]),
([      "action" : "$N反转$w，那势「克己」的劲力便如同排山倒海般朝$n飞旋而出",
        "skill_name" : "克己",
        "force" : 640,
        "attack": 69,
        "dodge" : -62,
        "parry" : -33,
        "lvl"   : 200,
        "damage": 104,
        "damage_type" : "挫伤",
]),
});


int valid_enable(string usage) { return usage == "hammer" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query("str") < 32)
                return notify_fail("你的先天膂力孱弱，无法修炼盘古七势。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力修为太浅，无法修炼盘古七势。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候太浅，无法修炼盘古七势。\n");

        if ((int)me->query_skill("hammer", 1) < 80)
                return notify_fail("你的基本锤法火候太浅，无法修炼盘古七势。\n");

        if ((int)me->query_skill("hammer", 1) < (int)me->query_skill("pangu-qishi", 1))
                return notify_fail("你的基本锤法水平有限，无法领会更高深的盘古七势。\n");

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
        level = (int) me->query_skill("pangu-qishi",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力不够，练不了盘古七势。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够，练不了盘古七势。\n");

        me->receive_damage("qi", 90);
        me->add("neili", -90);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"pangu-qishi/" + action;
}
