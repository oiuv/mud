// shedao-qigong  蛇岛奇功
inherit SKILL;

mapping *action = ({
([	"action" : "$N使一招「仙鹤梳翎」手中$w一提，插向$n的$l",
	"damage" : 25,
	"parry": 40,
	"force": 90,
	"damage_type" : "挫伤",
	"skill_name" : "仙鹤梳翎"
]),
([	"action": "$N使出「灵蛇出洞」，身形微弓，手中$w倏的向$n的$l戳去",
	"damage" : 30,
	"dodge": 20,
	"parry": 10,
	"force": 140,
        "lvl"  : 30,
	"damage_type": "刺伤",
	"skill_name" : "灵蛇出洞"
]),
([	"action": "$N身子微曲，左足反踢，乘势转身，使一招「贵妃回眸」，右手$w已戳向$n$l",
	"damage" : 40,
	"dodge": 30,
	"parry": 20,
	"force": 190,
        "lvl"  : 70,
	"damage_type": "刺伤",
	"skill_name" : "贵妃回眸"
]),
([	"action" : "$N使一式「飞燕回翔」，背对着$n，右足一勾，顺势在$w上一点，$w陡然向自己咽喉疾射，接着$N身子往下一缩，$w掠过其咽喉，急奔$n急射而来",
	"damage" : 50,
	"force" : 230,
        "dodge" : 45,
	"lvl" : 40,
        "lvl"  : 100,
        "damage_type" : "刺伤",
	"skill_name" : "飞燕回翔"
]),
([	"action": "$N忽的在地上一个筋斗，使一招「小怜横陈」，从$n胯下钻过，手中$w直击$n",
	"damage" : 55,
	"dodge": 40,
	"parry": 30,
	"force": 270,
        "lvl"  : 120,
	"damage_type": "刺伤",
	"skill_name" : "小怜横陈"
]),
([	"action": "$N大吼一声，使一招「子胥举鼎」，反手擒拿$n极泉要穴，欲将$n摔倒在地",
	"dodge": 45,
	"parry": -10,
	"damage" : 60,
	"force": 330,
        "lvl"  : 140,
	"damage_type": "内伤",
	"skill_name" : "子胥举鼎"
]),
([	"action": "$N双腿一缩，似欲跪拜，一招「鲁达拨柳」左手抓向$n右脚足踝，右手$w直击$n小腹",
	"dodge": 50,
	"damage" : 65,
	"parry": -10,
	"force": 370,
        "lvl"  : 160,
	"damage_type": "内伤",
	"skill_name" : "鲁达拨柳"
]),
([	"action": "$N突然一个倒翻筋斗，一招「狄青降龙」，双腿一分，跨在肩头，双掌直击$n",
	"dodge": 70,
	"damage" : 75,
	"parry": 30,
	"force": 400,
        "lvl"  : 180,
	"damage_type": "内伤",
	"skill_name" : "狄青降龙"
]),
});

int valid_enable(string usage)
{
        return usage == "unarmed" ||
               usage == "sword"||
               usage == "staff"||
               usage == "parry";
}

int valid_learn(object me)
{
	if ((int)me->query_skill("force") < 150)
		return notify_fail("你的内功火候不够，无法学蛇岛奇功.\n");

	if ((int)me->query_skill("shenlong-bashi", 1) < 100)
		return notify_fail("你的神龙八式火候不够，无法学蛇岛奇功。\n");

	if ((int)me->query("max_neili") < 1000)
		return notify_fail("你的内力太弱，无法学蛇岛奇功。\n");

	if ((int)me->query_skill("shenlong-bashi", 1) < (int)me->query_skill("shedao-qigong", 1))
		return notify_fail("你的神龙八式水平有限，无法继续学蛇岛奇功。\n");

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

        level = (int) me->query_skill("shedao-qigong", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够练蛇岛奇功。\n");

	me->receive_damage("qi", 55);
	me->add("neili", -67);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"shedao-qigong/" + action;
}
