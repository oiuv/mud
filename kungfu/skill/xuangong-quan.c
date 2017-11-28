#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「划手」，双手划了个半圈，按向$n的$l",
        "force"  : 37,
        "dodge"  : 35,
        "parry"  : 38,
        "attack" : 5,
        "damage" : 1,
        "lvl" : 0,
        "skill_name"  : "划手",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N使一招「单鞭」，右手收置肋下，左手向外挥出，劈向$n的$l",
        "force"  : 48,
        "dodge"  : 51,
        "parry"  : 53,
        "attack" : 7,
        "damage" : 2,
        "lvl" : 10,
        "skill_name"  : "单鞭",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手回收，右手由钩变掌，由右向左，使一招「印掌」，向$n的$l打去",
        "force"  : 62,
        "dodge"  : 45,
        "parry"  : 57,
        "attack" : 9,
        "damage" : 3,
        "lvl" : 20,
        "skill_name"  : "印掌",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N双手划弧，右手向上，左手向下，使一招「拗鞭」，分击$n的面门和$l",
        "force"  : 74,
        "dodge"  : 53,
        "parry"  : 62,
        "attack" : 11,
        "damage" : 5,
        "lvl" : 30,
        "skill_name"  : "拗鞭",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手由胸前向下，身体微转，划了一个大圈，使一招「摔碑手」，击向$n的$l",
        "force"  : 92,
        "dodge"  : 76,
        "parry"  : 88,
        "attack" : 15,
        "damage" : 8,
        "lvl" : 50,
        "skill_name"  : "摔碑手",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手由下上挑，右手内合，使一招「拨云见日」，向$n的$l打去",
        "force"  : 120,
        "dodge"  : 81,
        "parry"  : 97,
        "attack" : 19,
        "damage" : 11,
        "lvl" : 70,
        "skill_name"  : "拨云见日",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左手变掌横于胸前，右拳由肘下穿出，一招「七星拳」，锤向$n的$l",
        "force"  : 152,
        "dodge"  : 95,
        "parry"  : 108,
        "attack" : 21,
        "damage" : 14,
        "lvl" : 100,
        "skill_name"  : "七星拳",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左脚前踏半步，右手使一招「海底针」，指由下向$n的$l戳去",
        "force"  : 183,
        "dodge"  : 105,
        "parry"  : 113,
        "attack" : 31,
        "damage" : 17,
        "lvl" : 130,
        "skill_name"  : "海底针",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N招「倒骑龙」，左脚一个弓箭步，右手上举向外撇出，向$n的$l挥去",
        "force"  : 212,
        "dodge"  : 115,
        "parry"  : 138,
        "attack" : 39,
        "damage" : 21,
        "lvl" : 160,
        "skill_name"  : "倒骑龙",
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "unarmed" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练无极玄功拳必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学无极玄功拳。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练无极玄功拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 60)
                return notify_fail("你的基本拳脚火候不够，无法学无极玄功拳。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("xuangong-quan", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的无极玄功拳。\n");

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
        level = (int) me->query_skill("xuangong-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练无极玄功拳。\n");

        me->receive_damage("qi", 40);
        me->add("neili", -50);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xuangong-quan/" + action;
}
