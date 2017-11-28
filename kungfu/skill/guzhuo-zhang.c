inherit SKILL;

mapping *action = ({
([	"action" : "$N一声大喝，左掌叠于右掌之上，劈向$n",
	"force" : 100,
        "attack": 2,
	"dodge" : 30,
        "parry" : 1,
	"damage": 15,
	"lvl"   : 0,
	"damage_type" : "内伤"
]),
([	"action" : "$N面色凝重，双掌轻抖，飘忽不定地拍向$n",
	"force" : 130,
        "attack": 8,
	"dodge" : 25,
        "parry" : 3,
	"damage": 30,
	"lvl"   : 20,
	"damage_type" : "内伤"
]),
([	"action" : "$N气沉丹田，双掌幻化一片掌影，将$n笼罩于内。",
	"force" : 160,
        "attack": 12,
	"dodge" : 43,
        "parry" : 4,
	"damage": 35,
	"lvl"   : 40,
	"damage_type" : "内伤"
]),
([	"action" : "$N跨前一步，右掌中攻直进，向$n的$l连击三掌",
	"force" : 210,
        "attack": 15,
	"dodge" : 55,
        "parry" : 8,
	"damage": 50,
	"lvl"   : 60,
        "damage_type" : "内伤"
]),
([	"action" : "$N沉身顿气，贯出双掌，顿时只见一片掌影攻向$n",
	"force" : 250,
        "attack": 22,
	"dodge" : 52,
        "parry" : 0,
	"damage": 30,
	"lvl"   : 80,
	"damage_type" : "内伤"
]),
([	"action" : "$N双掌平挥，猛击向$n的$l，毫无半点花巧可言",
	"force" : 300,
        "attack": 23,
	"dodge" : 65,
        "parry" : 11,
	"damage": 50,
	"lvl"   : 100,
        "damage_type" : "内伤"
]),
([	"action" : "$N体内真气迸发，双掌缤纷拍出，顿时一片掌影笼罩$n",
	"force" : 310,
        "attack": 28,
	"dodge" : 63,
        "parry" : 5,
	"damage": 80,
	"lvl"   : 120,
	"damage_type" : "内伤"
]),
([	"action" : "$N左掌虚晃，右掌携着千钧之力猛然向$n的头部击落",
	"force" : 330,
        "attack": 25,
	"dodge" : 77,
	"damage": 90,
        "parry" : 12,
	"lvl"   : 140,
        "damage_type" : "内伤"
]),
([	"action" : "$N身子蓦的横移，右手横扫$n的$l，左手攻向$n的胸口",
	"force" : 360,
        "attack": 31,
	"dodge" : 80,
        "parry" : 15,
	"damage": 100,
	"lvl"   : 160,
        "damage_type" : "内伤"
]),
([	"action" : "$N陡然一声暴喝，真气迸发，双掌同时击向$n的$l",
	"force" : 400,
        "attack": 32,
	"dodge" : 81,
        "parry" : 10,
	"damage": 130,
	"lvl"   : 180,
        "damage_type" : "内伤"
])
});

int valid_enable(string usage)
{
	return usage == "parry" || usage == "strike";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练古拙掌法必须空手。\n");

        if (me->query("str") < 26)
                return notify_fail("你先天膂力不足，无法学习淳厚的古拙掌法。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法练古拙掌法。\n");

	if ((int)me->query("max_neili") < 1500)
		return notify_fail("你的内力太弱，无法练古拙掌法。\n");

        if ((int)me->query_skill("strike", 1) < 100)
                return notify_fail("你的基本掌法火候不够，无法练古拙掌法。\n");

	if ((int)me->query_skill("strike", 1) < (int)me->query_skill("guzhuo-zhang", 1))
		return notify_fail("你的基本掌法水平有限，无法领会更高深的古拙掌法。\n");

	return 1;
}

mapping query_action(object me, object weapon)
{
	int i, level;
	level = (int) me->query_skill("guzhuo-zhang",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
			return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 90)
		return notify_fail("你的体力太低了。\n");
	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够练古拙掌法。\n");

	me->receive_damage("qi", 81);
	me->add("neili", -73);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"guzhuo-zhang/" + action;
}
