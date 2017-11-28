#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N纵身跃起手中$w轻挥，一招「礼贤下士」，斩向$n后颈",
        "force"  : 60,
        "attack" : 35,
        "parry"  : 10,
        "dodge"  : 30,
        "damage" : 17,
        "lvl"    : 0,
        "skill_name" : "礼贤下士",
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w连话三个弧形，一招「完壁归赵」，向$n的右臂齐肩斩落",
        "force"  : 71,
        "attack" : 45,
        "parry"  : 22,
        "dodge"  : 45,
        "damage" : 24,
        "lvl"    : 20,
        "skill_name" : "完壁归赵",
        "damage_type" : "刺伤"
]),
([      "action" : "$N轻吁一声，飞身一跃而起，一招「卧薪尝胆」，连续向$n刺出数剑",
        "force"  : 82,
        "attack" : 51,
        "parry"  : 18,
        "dodge"  : 53,
        "damage" : 33,
        "lvl"    : 40,
        "skill_name" : "卧薪尝胆",
        "damage_type" : "刺伤"
]),
([      "action" : "$N仰天长啸，斜行向前，一招「五岳为轻」，$w横削直击，击向$n的$l",
        "force"  : 112,
        "attack" : 58,
        "parry"  : 20,
        "dodge"  : 52,
        "damage" : 45,
        "lvl"    : 60,
        "skill_name" : "五岳为轻",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够，无法修习苏秦背剑。\n");

        if ((int)me->query_skill("sword", 1) < 10)
                return notify_fail("你的基本剑法火候太浅，无法修习苏秦背剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("suqin-beijian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的苏秦背剑。\n");

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

        level = (int) me->query_skill("suqin-beijian",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够练苏秦背剑。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的内力不够练苏秦背剑。\n");

        me->receive_damage("qi", 33);
        me->add("neili", -26);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"suqin-beijian/" + action;
}
