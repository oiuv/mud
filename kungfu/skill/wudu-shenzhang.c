inherit SKILL;

mapping *action = ({
([	"action" : "$N一招「斜阳照路」，左掌叠于右掌之上，劈向$n",
	"force" : 80,
        "attack": 2,
	"dodge" : 30,
        "parry" : 1,
	"damage": 5,
	"lvl"   : 0,
	"skill_name" : "斜阳照路",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N一招「千山鸟飞绝」，面色凝重，双掌轻飘飘地拍向$n",
	"force" : 100,
        "attack": 8,
	"dodge" : 25,
        "parry" : 3,
	"damage": 30,
	"lvl"   : 20,
	"skill_name" : "千山鸟飞绝",
	"damage_type" : "内伤"
]),
([	"action" : "$N一招「长空明净」，双掌幻化一片掌影，将$n笼罩于内。",
	"force" : 130,
        "attack": 12,
	"dodge" : 43,
        "parry" : 4,
	"damage": 35,
	"lvl"   : 30,
	"skill_name" : "长空明净",
	"damage_type" : "瘀伤"
]),

([	"action" : "$N一招「万水千山」，向$n的$l连击数掌",
	"force" : 150,
        "attack": 15,
	"dodge" : 55,
        "parry" : 8,
	"damage": 50,
	"lvl"   : 40,
	"skill_name" : "万水千山",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「万径人踪灭」，只见一片掌影攻向$n",
	"force" : 180,
        "attack": 22,
	"dodge" : 52,
        "parry" : 0,
	"damage": 30,
	"lvl"   : 60,
	"skill_name" : "万径人踪灭",
	"damage_type" : "瘀伤"
]),

([	"action" : "$N双掌平挥，一招「过关斩将」击向$n",
	"force" : 230,
        "attack": 23,
	"dodge" : 65,
        "parry" : 11,
	"damage": 50,
	"lvl"   : 80,
	"skill_name" : "过关斩将",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「彩云遮月」，只见一片掌影攻向$n",
	"force" : 260,
        "attack": 28,
	"dodge" : 63,
        "parry" : 5,
	"damage": 80,
	"lvl"   : 100,
	"skill_name" : "彩云遮月",
	"damage_type" : "内伤"
]),

([	"action" : "$N施出「高山流水」，右手横扫$n的$l，左手攻向$n的胸口",
	"force" : 280,
        "attack": 25,
	"dodge" : 77,
	"damage": 90,
        "parry" : 12,
	"lvl"   : 120,
	"skill_name" : "高山流水",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N左掌虚晃，右掌一记「夕阳西下」击向$n的头部",
	"force" : 320,
        "attack": 31,
	"dodge" : 80,
        "parry" : 15,
	"damage": 100,
	"lvl"   : 140,
	"skill_name" : "夕阳西下",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N施出「万毒噬体」，双掌同时击向$n的$l",
	"force" : 360,
        "attack": 32,
	"dodge" : 81,
        "parry" : 10,
	"damage": 130,
	"lvl"   : 160,
	"skill_name" : "万毒噬体",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage)
{
	return usage == "parry" || usage == "strike";
}

int valid_learn(object me)
{
       if (me->query("character") != "心狠手辣" && me->query("character") != "国士无双") 
                return notify_fail("练五毒神掌必须要心狠手辣，我看你这点做得还不够。\n"); 

	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练五毒神掌必须空手。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法练五毒神掌。\n");

	if ((int)me->query("max_neili") < 1200)
		return notify_fail("你的内力太弱，无法练五毒神掌。\n");

        if ((int)me->query_skill("strike", 1) < 120)
                return notify_fail("你的基本掌法火候不够，无法练五毒神掌。\n");

	if ((int)me->query_skill("strike", 1) < (int)me->query_skill("wudu-shenzhang", 1))
		return notify_fail("你的基本掌法水平有限，无法领会更高深的五毒神掌。\n");

	return 1;
}

mapping query_action(object me, object weapon)
{
	int i, level;
	level = (int) me->query_skill("wudu-shenzhang",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
			return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 90)
		return notify_fail("你的体力太低了。\n");
	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够练五毒神掌。\n");

	me->receive_damage("qi", 81);
	me->add("neili", -73);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"wudu-shenzhang/" + action;
}
