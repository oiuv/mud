// shenlong-bashi 神龙八式
inherit SKILL;

mapping *action = ({
([	"action": "$N使一招「疏影横斜」，左手轻轻一抹，向$n的$l拍去",
	"force" : 100,
	"parry" : 10,
	"damage": 20,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
	"skill_name" : "疏影横斜"
]),
([	"action": "$N鼓气大喝，双掌使一招「五丁开山」，推向$n的$l",
	"force" : 150,
        "attack": 5,
	"parry" : 30,
	"damage": 30,
        "lvl"   : 60,
	"damage_type" : "瘀伤",
	"skill_name" : "五丁开山"
]),
([	"action": "$N顺势使一招「风行草偃」，移肩转身，左掌护面，右掌直击$n",
	"force" : 200,
        "attack": 15,
	"dodge" : 80,
	"parry" : 20,
	"damage": 40,
        "lvl"   : 80,
	"damage_type": "瘀伤",
	"skill_name" : "风行草偃"
]),
([	"action": "$N退后几步，突然反手一掌，一招「神龙摆尾」，无比怪异地击向$n",
	"force" : 250,
        "attack": 21,
	"dodge" : 80,
	"parry" : 20,
	"damage": 50,
        "lvl"   : 100,
	"damage_type": "瘀伤",
	"skill_name" : "神龙摆尾"
]),
([	"action": "$N使一式「风卷残云」，全身飞速旋转，双掌一前一后，猛地拍向$n的胸口",
	"force" : 300,
        "attack": 32,
        "dodge" : 10,
	"parry" : 52,
	"damage": 50,
	"lvl"   : 30,
        "lvl"   : 140,
        "damage_type" : "瘀伤",
	"skill_name" : "风卷残云"
]),
([	"action": "$N忽的使出「乾坤倒旋」，以手支地，双腿翻飞踢向$n",
	"force" : 350,
        "attack": 35,
	"dodge" : 60,
	"parry" : 32,
	"damage": 60,
        "lvl"   : 160,
	"damage_type": "瘀伤",
	"skill_name" : "乾坤倒旋"
]),
([	"action": "$N大吼一声，使出「同归于尽」，不顾一切般扑向$n",
	"force" : 380,
        "attack": 45,
	"dodge" : 45,
	"parry" : 30,
	"damage": 60,
        "lvl"   : 180,
	"damage_type": "内伤",
	"skill_name" : "同归于尽"
]),
([	"action": "$N深吸一口气，身体涨成球状，猛然流星赶月般直撞向$n",
	"force" : 400,
        "attack": 52,
	"dodge" : 80,
	"parry" : 15,
	"damage": 70,
        "lvl"   : 200,
	"damage_type": "内伤",
	"skill_name" : "流星赶月"
]),
});

int valid_enable(string usage) { return usage=="hand" || usage=="parry"; }

int valid_combine(string combo) { return combo == "huagu-mianzhang"; }

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练神龙八式必须空手。\n");

	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功火候不够，无法学神龙八式.\n");

	if ((int)me->query("max_neili") < 750)
		return notify_fail("你的内力太弱，无法练神龙八式。\n");

        if ((int)me->query_skill("hand", 1) < 80)
                return notify_fail("你的基本手法火候不够，无法学习神龙八式。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("shenlong-bashi", 1))
                return notify_fail("你的基本手法水平有限，无法学习更高深的神龙八式。\n");

	return 1;
}

mapping query_action(object me, object weapon)
{
	return action[random(sizeof(action))];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够练神龙八式。\n");

	me->receive_damage("qi", 61);
	me->add("neili", -62);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"shenlong-bashi/" + action;
}
