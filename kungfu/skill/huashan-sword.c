// huashan-sword.c
// Modified by Venus Oct.1997
#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "name"  : "有凤来仪",
        "action": "$N使一招「有凤来仪」，手中$w剑光暴长，向$n的$l刺去",
        "force" : 70,
	"attack": 10,
	"parry" : 5,
        "dodge" : 10,
        "damage": 30,
        "lvl"   : 0,
        "damage_type":  "刺伤"
]),
([      "name"  : "无边落木",
        "action": "$N剑随身转，一招「无边落木」罩向$n的$l",
        "force" : 120,
	"attack": 20,
	"parry" : 15,
        "dodge" : 20,
        "damage": 40,
        "lvl"   : 20,
        "damage_type":  "刺伤"
]),
([      "name"  : "鸿飞冥冥",
        "action": "$N舞动$w，一招「鸿飞冥冥」挟著无数剑光刺向$n的$l",
        "force" : 160,
	"attack": 25,
	"parry" : 20,
        "dodge" : 30,
        "damage": 45,
        "lvl"   : 40,
        "damage_type":  "刺伤"
]),
([      "name"  : "平沙落雁",
        "action": "$N手中$w龙吟一声，祭出「平沙落雁」往$n的$l刺出数剑",
        "force" : 190,
	"attack": 30,
	"parry" : 28,
        "dodge" : 35,
        "damage": 50,
        "lvl"   : 60,
        "damage_type":  "刺伤"
]),
([      "name"  : "金玉满堂",
        "action": "$N手中$w剑光暴长，一招「金玉满堂」往$n$l刺去",
        "force" : 220,
	"attack": 40,
	"parry" : 33,
        "dodge" : 40,
        "damage": 55,
        "lvl"   : 80,
        "damage_type":  "刺伤"
]),
([      "name"  : "白虹贯日",
        "action": "$N手中$w化成一道光弧，直指$n$l，一招「白虹贯日」发出虎哮龙吟刺去",
        "force" : 260,
	"attack": 50,
	"parry" : 40,
        "dodge" : -20,
        "damage": 90,
        "lvl"   : 100,
        "damage_type":  "刺伤"
]),
});

int valid_learn(object me)
{
    object ob;

    if ((int)me->query("max_neili") < 100)
        return notify_fail("你的内力不够，没有办法练华山剑法。\n");

    if (! (ob = me->query_temp("weapon"))
    ||  (string)ob->query("skill_type") != "sword" )
        return notify_fail("你必须先找一把剑才能学习剑法。\n");

    if (me->query_skill("sword", 1) < me->query_skill("huashan-sword", 1))
	return notify_fail("你的基本剑法火候有限，无法领会更高深的华山剑法。\n");

    return 1;
}

int valid_enable(string usage)
{
    return usage=="sword" || usage=="parry";
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
	level = (int) me->query_skill("huashan-sword", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 60)
        return notify_fail("你的体力太低，没有办法练习华山剑法。\n");
                
    if ((int)me->query("neili") < 40)
        return notify_fail("你的内力不够，没有办法练习华山剑法。\n");

    me->receive_damage("qi", 50);
    me->add("neili", -31);
    return 1;
}

int valid_effect(object me, object weapon, string name, int skill)
{
}

string perform_action_file(string action)
{
        return __DIR__"huashan-sword/" + action;
}
