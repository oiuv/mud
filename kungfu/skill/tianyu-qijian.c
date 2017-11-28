// tianyu-qijian.c 天羽奇剑

inherit SKILL;

mapping *action = ({
([	"action":"$N使一式「海天一线」，手中$w嗡嗡微振，幻成一条疾光刺向$n的$l",
	"force" : 60,
        "dodge" : 0,
	"damage": 10,
	"lvl" : 0,
	"skill_name" : "海天一线",
	"damage_type":	"割伤"
]),
([	"action":"$N错步上前，使出「闪电惊虹」，手中$w划出一道剑光劈向$n的$l",
	"force" : 70,
        "dodge" : 10,
	"damage": 15,
	"lvl" : 30,
	"skill_name" : "闪电惊虹",
	"damage_type":	"割伤"
]),
([	"action":"$N手中$w一抖，一招「日在九天」，斜斜一剑反腕撩出，攻向$n的$l",
	"force" : 80,
        "dodge" : 5,
	"damage": 20,
	"lvl" : 40,
	"skill_name" : "日在九天",
	"damage_type":	"割伤"
]),
([	"action":"$N手中剑锵啷啷长吟一声，一式「咫尺天涯」，一道剑光飞向$n的$l",
	"force" : 90,
        "dodge" : 10,
	"damage": 25,
	"lvl" : 50,
	"skill_name" : "咫尺天涯",
	"damage_type":	"刺伤"
]),
([	"action":"$N一式「怒剑狂花」，手中$w舞出无数剑花，使$n难断虚实，无可躲避",
	"force" : 120,
        "dodge" : 15,
	"damage": 30,
	"lvl" : 60,
	"skill_name" : "怒剑狂花",
	"damage_type":	"刺伤"
]),
([	"action":"$N手中$w斜指苍天，剑芒吞吐，一式「九弧震日」，对准$n的$l斜斜击出",
	"force" : 140,
        "dodge" : 5,
	"damage": 35,
	"lvl" : 70,
	"skill_name" : "九弧震日",
	"damage_type":	"刺伤"
]),
([	"action":"$N一式「漫天风雪」，手腕急抖，挥洒出万点金光，刺向$n的$l",
	"force" : 160,
        "dodge" : 5,
	"damage": 40,
	"lvl" : 80,
	"skill_name" : "漫天风雪",
	"damage_type":	"刺伤"
]),
([	"action":"$N一式「天河倒泻」，$w飞斩盘旋，如疾电般射向$n的胸口",
	"force" : 190,
        "dodge" : 5,
	"damage": 45,
	"lvl" : 100,
	"skill_name" : "天河倒泻",
	"damage_type":	"刺伤"
]),
([	"action":"$N一式「天外飞仙」，$w突然从天而降，一片金光围掠$n全身",
	"force" : 210,
        "dodge" : 5,
	"damage": 50,
	"lvl" : 120,
	"skill_name" : "天外飞仙",
	"damage_type":	"刺伤"
])
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，不能学习天羽奇剑。\n");

        if (me->query("max_neili") < 200)
                return notify_fail("你的内力不够，不能学习天羽奇剑。\n");

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
	level = (int) me->query_skill("tianyu-qijian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	object weapon;

	if (!objectp(weapon = me->query_temp("weapon"))
	|| (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");

	if ((int)me->query("qi") < 50)
		return notify_fail("你的体力不够练天羽奇剑。\n");

        if ((int)me->query("neili") < 40)
		return notify_fail("你的内力不够练天羽奇剑。\n");

	me->receive_damage("qi", 40);
        me->add("neili", -25);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"tianyu-qijian/" + action;
}
