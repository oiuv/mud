//shunv-jian 淑女剑法
//modify by rcwiz 2003

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N娇喝一声，手中$w剑光暴涨，指向$n$l",
        "force"  : 130,
        "attack" : 35,
        "parry"  : 20,
        "dodge"  : 40,
        "damage" : 100,
        "lvl"    : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w反转斜刺，剑法柔中带刚，指向$n$l",
        "force"  : 150,
        "attack" : 45,
        "parry"  : 52,
        "dodge"  : 55,
        "damage" : 118,
        "lvl"    : 30,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一声娇斥，剑势陡快，手中$w斩向$n",
        "force"  : 190,
        "attack" : 81,
        "parry"  : 18,
        "dodge"  : 103,
        "damage" : 155,
        "lvl"    : 60,
        "damage_type" : "砍伤"
]),
([      "action" : "$N腰姿一摆，剑光突现，手中$w一退反进，刺向$n$l",
        "force"  : 250,
        "attack" : 108,
        "parry"  : 20,
        "dodge"  : 122,
        "damage" : 200,
        "lvl"    : 90,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力修为不够，无法修习淑女剑法。\n");

        if ((int)me->query_skill("dodge", 1) < 40)
                return notify_fail("你的基本轻功火候太浅，无法修习淑女剑法。\n");

        if ((int)me->query_dex() < 24)
                return notify_fail("你的身法还不够灵活，无法修习淑女剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("shunv-jian", 1))
	        return notify_fail("你的基本剑法水平有限，无法领会更高深的淑女剑法。\n");

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

        level = (int) me->query_skill("shunv-jian",1);
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

        if ((int)me->query("qi") < 45)
                return notify_fail("你的体力不够。\n");

        if ((int)me->query("neili") < 38)
                return notify_fail("你的内力不够。\n");

        me->receive_damage("qi", 40);
        me->add("neili", -34);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shunv-jian/" + action;
}
