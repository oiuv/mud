#include <ansi.h>
inherit SKILL;

mapping *action = ({
([     "action" : "$N左爪前伸，带着丝丝蓝阴鬼气，一式「元神出窍」，猛得向$n的顶门插下",
       "force" : 150,
       "damage" : 30,
       "dodge" : 5,
       "lvl" : 0,
       "weapon" : "五指",
       "damage_type" : "抓伤"
]),
([     "action" : "$N双掌连拍，筑起一道气墙推向$n，忽然一爪「鬼魅穿心」冲破气墙直插$n的$l",
       "force" : 160,
       "dodge" : 10,
       "damage": 30,
       "lvl" : 0,
       "weapon" : "指尖",
       "damage_type" : "刺伤"
]),
([     "action" : "$N使出「血鬼锁」双爪游向$n扣住$l，气劲激发往左右两下一拉，便要将$n割成碎片",
       "force" : 170,
       "dodge" : 0,
       "damage": 40,
       "lvl" : 20,
       "weapon" : "指甲",
       "damage_type" : "割伤"
]),
([     "action" : "$N双爪拢住$n，使一式「炼狱鬼嚎」，阴毒内功随爪尖透入$n体内，直袭各大关节",
       "force" : 180,
       "dodge" : 5,
       "damage": 60,
       "lvl" : 30,
       "damage_type" : "内伤"
]),
([     "action" : "$N力透指尖，向$n虚虚实实连抓十五爪，「妖风袭体」带动无数阴气缠住$n",
       "force" : 200,
       "dodge" : 15,
       "damage": 60,
       "weapon" : "阴风",
       "lvl" : 40,
       "damage_type" : "拉伤"
]),
([     "action" : "$N一式「索命妖手」，左爪上下翻动形成无数爪影，右臂一伸，鬼魅般抓向$n的$l",
       "force" : 240,
       "dodge" : 5,
       "damage": 67,
       "weapon" : "右抓",
       "lvl" : 50,
       "damage_type" : "抓伤"
]),
([     "action" : "$N探手上前，顺着$n的手臂攀缘直上，变手为爪，一招「孤魂驭魔」抓向$n的$l",
       "force" : 260,
       "dodge" : 5,
       "damage": 70,
       "lvl"   : 70,
       "weapon": "五爪",
       "damage_type" : "抓伤"
]),
});

int valid_enable(string usage)
{
	return usage == "claw" ||  usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "tianchan-zhang";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
            return notify_fail("练五圣毒爪必须空手。\n");

        if ((int)me->query("max_neili") < 200)
            return notify_fail("你的内力太弱，无法练五圣毒爪。\n");

	if ((int)me->query_skill("claw", 1) < (int)me->query_skill("wusheng-zhao", 1))
	    return notify_fail("你的基本爪法水平有限，无法领会更高深的五圣毒爪。\n");

	return 1;
}

string query_skill_name(int level)
{
	int i;
	for(i = sizeof(action); i > 0; i--)
		if(level >= action[i-1]["lvl"])
			return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
	int i, level;
	level = (int) me->query_skill("wusheng-zhao",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 5, level/5)];

}

int practice_skill(object me)
{
//	object* ob;
	int /*i,*/skill/*,damage*/;

	skill = me->query_skill("wusheng-zhao",1);
	if ((int)me->query("qi") < 40)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 40)
		return notify_fail("你的内力不够练五圣毒爪。\n");

	me->receive_damage("qi", 30);
        me->add("neili", -31);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"wusheng-zhao/" + action;
}