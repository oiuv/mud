// lingshe-quan 灵蛇拳

inherit SKILL;

mapping *action = ({
([	"action": "$N一式「灵蛇出洞」，右手虚晃，左手扬起，突然拍向$n的背后二穴",
	"force" : 60,
        "attack": 40,
        "dodge" : 30,
	"lvl"   : 0,
	"skill_name" : "灵蛇出洞",
	"damage_type" : "瘀伤"
]),
([	"action": "$N侧身一晃，一式「虎头蛇尾」，左手拿向$n的肩头，右拳打向$n的胸口",
	"force" : 100,
        "attack": 45,
        "dodge" : 35,
	"lvl"   : 30,
	"skill_name" : "虎头蛇尾",
        "damage_type" : "瘀伤"
]),
([	"action": "$N一式「画蛇添足」，右手环拢成爪，一出手就向扣$n的咽喉要害",
	"force" : 130,
        "attack": 50,
        "dodge" : 40,
	"damage": 5,
	"lvl"   : 50,
	"skill_name" : "画蛇添足",
        "damage_type" : "瘀伤"
]),
([	"action": "$N左手虚招，右掌直立，一式「杯弓蛇影」，错步飘出，疾拍$n的面门",
	"force" : 160,
        "attack": 55,
        "dodge" : 50,
	"damage": 10,
	"lvl"   : 70,
	"skill_name" : "杯弓蛇影",
        "damage_type" : "瘀伤"
]),
([	"action": "$N使一式「蛇行鼠窜」，左拳上格，右手探底突出，抓向$n的裆部",
	"force" : 210,
        "attack": 60,
        "dodge" : 65,
	"damage": 15,
	"lvl"   : 90,
	"skill_name" : "蛇行鼠窜",
        "damage_type" : "瘀伤"
]),
([	"action": "$N一式「蛇磐青竹」，十指伸缩，虚虚实实地袭向$n的全身要穴",
	"force" : 250,
        "attack": 70,
        "dodge" : 75,
	"damage": 25,
	"lvl"   : 120,
	"skill_name" : "蛇磐青竹",
        "damage_type" : "内伤"
]),
([	"action" : "$N双手抱拳，一式「万蛇汹涌」，掌影翻飞，同时向$n施出九九八十一招",
	"force" : 280,
        "attack": 80,
        "dodge" : 75,
	"damage": 30,
	"lvl"   : 140,
	"skill_name" : "万蛇汹涌",
        "damage_type" : "内伤"
]),
([	"action" : "$N一式「白蛇吐信」，拳招若隐若现，若有若无，急急地拍向$n的丹田",
	"force" : 300,
        "attack": 90,
        "dodge" : 80,
	"damage": 40,
	"lvl"   : 160,
	"skill_name" : "白蛇吐信",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage=="cuff" || usage=="parry"; }

int valid_combine(string combo) { return combo=="shedu-qiqiao"; }

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练灵蛇拳必须空手。\n");

        if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够，无法学灵蛇拳。\n");

	if ((int)me->query("max_neili") < 500)
		return notify_fail("你的内力太弱，无法练灵蛇拳。\n");

	if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("lingshe-quan", 1))
		return notify_fail("你的基本拳法水平有限，无法领会更高深的灵蛇拳法。\n");

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
	level   = (int) me->query_skill("lingshe-quan", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 60)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 60)
		return notify_fail("你的内力不够练灵蛇拳。\n");

	me->receive_damage("qi", 55);
	me->add("neili", -55);
	return 1;
}

string perform_action_file(string action)
{
        return __DIR__"lingshe-quan/" + action;
}
