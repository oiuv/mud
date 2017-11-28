// hannbing-mianzhang.c 寒冰绵掌
// modify by Rcwiz 2003

inherit SKILL;

mapping *action = ({
([	"action" : "$N一式「大江东去」，双掌大开大合，直向$n的$l击去",
	"force" : 100,
        "dodge" : 15,
        "parry" : 20,
	"damage": 10,
	"lvl"   : 0,
	"skill_name" : "大江东去",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N身形一变，一式「黄河九曲」，双掌似曲似直，拍向$n的$l",
	"force" : 130,
        "dodge" : 10,
        "parry" : 15,
	"damage": 20,
	"lvl"   : 30,
	"skill_name" : "黄河九曲",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N使一式「湖光山色」，左掌如微风拂面，右掌似细雨缠身，直取$n的$l",
	"force" : 160,
        "dodge" : 20,
        "parry" : 20,
	"damage": 25,
	"lvl"   : 60,
	"skill_name" : "湖光山色",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N两掌一分，一式「曾经沧海」，隐隐发出潮声，向$n横击过去",
	"force" : 180,
        "dodge" : 20,
        "parry" : 30,
	"damage": 30,
	"lvl"   : 80,
	"skill_name" : "曾经沧海",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N身形一转，使出一式「水光潋滟」，只见漫天掌影罩住了$n的全身",
	"force" : 210,
        "dodge" : 25,
        "parry" : 20,
	"damage": 35,
	"lvl"   : 100,
	"skill_name" : "水光潋滟",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N突然身形一缓，使出一式「小雨初晴」，左掌凝重，右掌轻盈，击往$n的$l",
	"force" : 250,
        "dodge" : 25,
        "parry" : 25,
	"damage": 40,
	"lvl"   : 120,
	"skill_name" : "小雨初晴",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N使一式「风雪江山」，双掌挟狂风暴雪之势，猛地劈向$n的$l",
	"force" : 280,
        "dodge" : 30,
        "parry" : 30,
	"damage": 50,
	"lvl"   : 140,
	"skill_name" : "风雪江山",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「霜华满地」，双掌带着萧瑟的秋气，拍向$n的$l",
	"force" : 300,
        "dodge" : 30,
        "parry" : 35,
	"damage": 60,
	"lvl"   : 150,
	"skill_name" : "霜华满地",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N身法陡然一变，使出一式「仙乡冰舸」，掌影千变万幻，令$n无法躲闪",
	"force" : 320,
        "dodge" : 40,
        "parry" : 45,
	"damage": 80,
	"lvl"   : 160,
	"skill_name" : "仙乡冰舸",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N清啸一声，一式「冰霜雪雨」，双掌挥舞，如同雪花随风而转，击向$n的$l",
	"force" : 330,
        "dodge" : 45,
        "parry" : 50,
	"damage": 100,
	"lvl"   : 180,
	"skill_name" : "冰霜雪雨",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage)
{
	return usage=="strike" || usage=="parry";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练寒冰绵掌必须空手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，无法练寒冰绵掌。\n");

	if ((int)me->query("max_neili") < 800)
		return notify_fail("你的内力太弱，无法练寒冰绵掌。\n");

        if ((int)me->query_skill("strike", 1) < 80)
		return notify_fail("你的基本掌法火候不够，无法练寒冰绵掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("hanbing-mianzhang", 1))
		return notify_fail("你的基本掌法水平有限，无法领会更高深的寒冰绵掌。\n");

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
	level   = (int) me->query_skill("hanbing-mianzhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 60)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 60)
		return notify_fail("你的内力不够练寒冰绵掌。\n");

	me->receive_damage("qi", 50);
	me->add("neili", -54);
	return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
	int lvl;
        int flvl;

	lvl  = me->query_skill("hanbing-mianzhang", 1);
        flvl = me->query("jiali");
	if (lvl < 80 || flvl < 10 || ! damage_bonus)
		return;

    	if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("ice_poison",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 50 + random(lvl / 20) ])))
        {
                return "$n忽然神色大变，一个寒战，退了几步。\n";
    	}
}

string perform_action_file(string action)
{
	return __DIR__"hanbing-mianzhang/" + action;
}
