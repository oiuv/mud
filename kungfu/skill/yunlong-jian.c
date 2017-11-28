// yunlong-jian.c 云龙剑

inherit SKILL;

mapping *action = ({
([	"action":"\n$N使一式「悠悠顺自然」，手中$w嗡嗡微振，幻成一条白光刺向$n的$l",
	"force" : 40,
        "dodge" : -10,
	"damage": 8,
	"lvl" : 0,
	"skill_name" : "悠悠顺自然",
	"damage_type":	"刺伤"
]),
([	"action":"\n$N错步上前，使出「来去若梦行」，剑意若有若无，$w淡淡地向$n的$l挥去",
	"force" : 50,
        "dodge" : -10,
	"damage": 10,
	"lvl" : 30,
	"skill_name" : "来去若梦行",
	"damage_type":	"割伤"
]),
([	"action":"\n$N一式「志当存高远」，纵身飘开数尺，运发剑气，手中$w遥摇指向$n的$l",
	"force" : 60,
        "dodge" : 5,
	"damage": 12,
	"lvl" : 60,
	"skill_name" : "志当存高远",
	"damage_type":	"刺伤"
]),
([	"action":"$N纵身轻轻跃起，一式「表里俱澄澈」，剑光如水，一泻千里，洒向$n全身",
	"force" : 80,
        "dodge" : 10,
	"damage": 15,
	"lvl" : 80,
	"skill_name" : "表里俱澄澈",
	"damage_type":	"割伤"
]),
([	"action":"$N手中$w中宫直进，一式「随风潜入夜」，无声无息地对准$n的$l刺出一剑",
	"force" : 100,
        "dodge" : 15,
	"damage": 18,
	"lvl" : 100,
	"skill_name" : "随风潜入夜",
	"damage_type":	"刺伤"
]),
([	"action":"$N手中$w一沉，一式「润物细无声」，无声无息地滑向$n的$l",
	"force" : 120,
        "dodge" : 15,
	"damage": 20,
	"lvl" : 120,
	"skill_name" : "润物细无声",
	"damage_type":	"割伤"
]),
([	"action":"\n$N手中$w斜指苍天，剑芒吞吐，一式「云龙听梵音」，对准$n的$l斜斜击出",
	"force" : 150,
        "dodge" : 25,
	"damage": 22,
	"lvl" : 140,
	"skill_name" : "云龙听梵音",
	"damage_type":	"刺伤"
]),
([	"action":"$N左指凌空虚点，右手$w逼出丈许雪亮剑芒，一式「万里一点红」刺向$n的咽喉",
	"force" : 180,
        "dodge" : 15,
	"damage": 25,
	"lvl" : 150,
	"skill_name" : "万里一点红",
	"damage_type":	"刺伤"
]),
([	"action":"$N合掌跌坐，一式「我心化云龙」，$w自怀中跃出，如疾电般射向$n的胸口",
	"force" : 200,
        "dodge" : 15,
	"damage": 30,
	"lvl" : 160,
	"skill_name" : "我心化云龙",
	"damage_type":	"刺伤"
]),
([	"action":"\n$N呼的一声拔地而起，一式「日月与同辉」，$w幻出万道光影，将$n团团围住",
	"force" : 220,
        "dodge" : 15,
	"damage": 35,
	"lvl" : 165,
	"skill_name" : "日月与同辉",
	"damage_type":	"内伤"
]),
([	"action":"$N随风轻轻飘落，一式「清风知我意」，手中$w平指，缓缓拍向$n脸颊",
	"force" : 250,
        "dodge" : 15,
	"damage": 40,
	"lvl" : 170,
	"skill_name" : "清风知我意",
	"damage_type":	"内伤"
]),
([	"action" : "$N剑尖微颤作龙吟，一招「高处不胜寒」，切骨剑气如飓风般裹向$n全身",
	"force" : 290,
        "dodge" : 15,
	"damage": 45,
	"lvl" : 175,
	"skill_name" : "高处不胜寒",
	"damage_type":	"内伤"
]),
([	"action" : "$N募的使一招「红叶舞秋山」，顿时剑光中几朵血花洒向$n全身",
	"force" : 310,
        "dodge" : 25,
	"damage": 50,
	"lvl" : 180,
	"skill_name" : "红叶舞秋山",
	"damage_type":	"内伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
	if ((int)me->query("max_neili") < 900)
		return notify_fail("你的内力不够。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候太浅。\n");

	if ((int)me->query_skill("sword", 1) < 100)
		return notify_fail("你的基本剑法火候太浅。\n");

	if ((int)me->query_skill("sword", 1) < (int)me->query_skill("yunlong-jian", 1))
		return notify_fail("你的基本剑法水平有限，无法领会更高深的云龙剑法。\n");

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
	level   = (int) me->query_skill("yunlong-jian",1);
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

	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力不够练云龙剑法。\n");

	if ((int)me->query("neili") < 80)
		return notify_fail("你的内力不够练云龙剑法。\n");

	me->receive_damage("qi", 55);
        me->add("neili", -67);
	return 1;
}
string perform_action_file(string action)
{
	return __DIR__"yunlong-jian/" + action;
}
