//kuangfeng-jian 狂风快剑

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N纵身跃起手中$w轻挥，斩向$n后颈",
        "force"  : 160,
        "attack" : 35,
        "parry"  : 40,
        "dodge"  : 80,
        "damage" : 125,
        "lvl"    : 0,
        "skill_name" : "风平浪静",
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w连话三个弧形，向$n的右臂齐肩斩落",
        "force"  : 180,
        "attack" : 55,
        "parry"  : 52,
        "dodge"  : 95,
        "damage" : 148,
        "lvl"    : 30,
        "skill_name" : "风起云涌",
        "damage_type" : "刺伤"
]),
([      "action" : "$N轻吁一声，刷刷刷刷四剑，向$n胸，腹，腰，肩四处连刺",
        "force"  : 220,
        "attack" : 81,
        "parry"  : 18,
        "dodge"  : 123,
        "damage" : 195,
        "lvl"    : 60,
        "skill_name" : "风卷残云",
        "damage_type" : "刺伤"
]),
([      "action" : "$N仰天一声清啸，斜行向前，$w横削直击，迅捷无比，击向$n的$l",
        "force"  : 280,
        "attack" : 108,
        "parry"  : 20,
        "dodge"  : 152,
        "damage" : 230,
        "lvl"    : 90,
        "skill_name" : "风流云散",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力修为不够，无法修习狂风快剑。\n");

        if ((int)me->query_skill("dodge", 1) < 90)
                return notify_fail("你的基本轻功火候太浅，无法修习狂风快剑。\n");

        if ((int)me->query_dex() < 28)
                return notify_fail("你的身法还不够灵活，无法修习狂风快剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("kuangfeng-jian", 1))
	        return notify_fail("你的基本剑法水平有限，无法领会更高深的狂风快剑。\n");

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

        level = (int) me->query_skill("kuangfeng-jian",1);
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

        if ((int)me->query("qi") < 65)
                return notify_fail("你的体力不够练狂风快剑。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的内力不够练狂风快剑。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -36);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"kuangfeng-jian/" + action;
}
