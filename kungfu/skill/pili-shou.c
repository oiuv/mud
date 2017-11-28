// pili-shou.c 混元霹雳手
// create by rcwiz 2003

inherit SKILL;

mapping *action = ({
([	"action" : "$N一式「五指连心」，右掌直取$n的$l",
	"force" : 100,
        "dodge" : 15,
        "parry" : 20,
	"damage": 10,
	"lvl"   : 0,
	"skill_name" : "五指连心",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N大喝一声，一式「火上心头」，双掌掌力雄浑无比，连连拍向$n的$l",
	"force" : 130,
        "dodge" : 10,
        "parry" : 15,
	"damage": 20,
	"lvl"   : 30,
	"skill_name" : "火上心头",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N使一式「混元无际」，左掌虚出，右掌猛然跟进，直取$n的$l",
	"force" : 160,
        "dodge" : 20,
        "parry" : 20,
	"damage": 25,
	"lvl"   : 60,
	"skill_name" : "混元无际",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N两掌一分，一式「晴空霹雳」，隐隐带有风雷之势，向$n劈去",
	"force" : 180,
        "dodge" : 20,
        "parry" : 30,
	"damage": 30,
	"lvl"   : 80,
	"skill_name" : "晴空霹雳",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N身形一转，使出一式「混元刀」，但见$N右掌犹如一把利刀直下，劈向$n",
	"force" : 210,
        "dodge" : 25,
        "parry" : 20,
	"damage": 35,
	"lvl"   : 100,
	"skill_name" : "混元刀",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N突然飞身而起，使出一式「霹雳雨」，双掌连连而出，犹如暴雨般拍向$n全身",
	"force" : 250,
        "dodge" : 25,
        "parry" : 25,
	"damage": 40,
	"lvl"   : 120,
	"skill_name" : "霹雳雨",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N使一式「晴空万里」，双掌一分，猛地劈向$n的$l",
	"force" : 290,
        "dodge" : 30,
        "parry" : 30,
	"damage": 55,
	"lvl"   : 140,
	"skill_name" : "晴空万里",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「烈炎飞空」，双掌带着萧瑟的烈炎之气，拍向$n的$l",
	"force" : 330,
        "dodge" : 30,
        "parry" : 35,
	"damage": 70,
	"lvl"   : 150,
	"skill_name" : "烈炎飞空",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N身法陡然一变，使出一式「混阳式」，掌影千变万幻，令$n无法躲闪",
	"force" : 350,
        "dodge" : 40,
        "parry" : 45,
	"damage": 80,
	"lvl"   : 160,
	"skill_name" : "混阳式",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N清啸一声，一式「雄心万里」，双掌挥舞，气势非凡，击向$n的$l",
	"force" : 380,
        "dodge" : 45,
        "parry" : 50,
	"damage": 130,
	"lvl"   : 180,
	"skill_name" : "雄心万里",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage)
{
	return usage=="hand" || usage=="parry";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练混元霹雳手必须空手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，无法练混元霹雳手。\n");

	if ((int)me->query("max_neili") < 900)
		return notify_fail("你的内力太弱，无法练混元霹雳手。\n");

        if ((int)me->query_skill("hand", 1) < 80)
		return notify_fail("你的基本手法火候不够，无法练混元霹雳手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("pili-shou", 1))
		return notify_fail("你的基本手法水平有限，无法领会更高深的混元霹雳手。\n");

	return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
	level   = (int) me->query_skill("pili-shou",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 80)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够练混元霹雳手。\n");

	me->receive_damage("qi", 6);
	me->add("neili", -64);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"pili-shou/" + action;
}
