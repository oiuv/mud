//lingshe_zhangfa.c 灵蛇杖法

#include "ansi.h"

inherit SKILL;

mapping *action = ({
([	"action": "$N使出一招「灵蛇出洞」，手中$w大开大阖扫向$n的$l",
	"force" : 380,
        "attack": 85,
	"dodge" : 35,
	"parry" : 50,
	"damage": 85,
	"skill_name" : "灵蛇出洞",
	"damage_type": "挫伤"
]),
([	"action": "$N手中$w阵阵风响，一招「摇头摆尾」向$n的$l攻去",
	"force" : 370,
        "attack": 87,
	"dodge" : 25,
	"parry" : 45,
	"damage": 88,
	"skill_name" : "摇头摆尾",
	"damage_type": "挫伤"
]),
([	"action": "$N举起$w，居高临下使一招「灵蛇下涧」砸向$n的$l",
	"force" : 365,
        "attack": 80,
	"dodge" : 35,
	"parry" : 43,
	"damage": 80,
	"skill_name" : "灵蛇下涧",
	"damage_type": "挫伤"
]),
([	"action": "$N一招「灵蛇挺身」，手中$w猛烈扫向$n的$l",
	"force" : 410,
        "attack": 85,
	"dodge" : 35,
	"parry" : 40,
	"damage": 100,
	"skill_name" : "灵蛇挺身",
	"damage_type": "挫伤"
]),
([	"action": "$N使出一招「蛇游蟒走」，$w左右迂回向$n的$l扫去",
	"force" : 350,
        "attack": 89,
	"dodge" : 35,
	"parry" : 50,
	"damage": 95,
	"skill_name" : "蛇游蟒走",
	"damage_type": "挫伤"
]),
([	"action": "$N手中$w一挥，使出一招「蛇缠左右」，忽左忽右扫向$n的$l",
	"force" : 340,
        "attack": 90,
	"dodge" : 45,
	"parry" : 35,
	"damage": 110,
	"skill_name" : "蛇缠左右",
	"damage_type": "挫伤"
]),
([	"action": "$N使出一招「巨蟒下山」，高举手中$w，劈头砸向$n的$l",
	"force" : 390,
        "attack": 97,
	"dodge" : 40,
	"parry" : 45,
	"damage": 115,
	"skill_name" : "巨蟒下山",
	"damage_type": "挫伤"
]),
([	"action": "$N使出一招「灵蛇出洞」，手中$w猛一探，直扫$n的$l",
	"force" : 410,
        "attack": 105,
	"dodge" : 45,
	"parry" : 45,
	"damage": 135,
	"skill_name" : "灵蛇出洞",
	"damage_type": "挫伤"
]),
});

string query_skill_name(int level)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int valid_enable(string usage) { return (usage == "staff") || (usage == "parry"); }

int valid_learn(object me)
{
	if ((int)me->query("max_neili") < 1000)
		return notify_fail("你的内力不够。\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("staff", 1) < 100)
                return notify_fail("你的基本杖法还不到家，不能学习灵蛇杖法。\n");

        if ((int)me->query_skill("staff", 1) < me->query_skil("lingshe-zhangfa", 1))
                return notify_fail("你的基本杖法水平不够，无法领会更高深的灵蛇杖法。\n");

	return 1;
}

int practice_skill(object me)
{
	object weapon;

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "staff")
		return notify_fail("你使用的武器不对。\n");

	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力不够练灵蛇杖法。\n");

	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够练灵蛇杖法。\n");

	me->receive_damage("qi", 60);
        me->add("neili", -69);
	return 1;
}

string perform_action_file(string action)
{
        return __DIR__"lingshe-zhangfa/" + action;
}
