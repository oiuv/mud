// panyun-shou.c 排云手

inherit SKILL;

mapping *action = ({
([	"action" : "$N跨开马步，右掌前出，十指伸缩，虚虚实实地袭向$n的全身要穴",
	"force" : 30,
        "dodge" : 1,
        "parry" : 4,
	"damage": 0,
	"lvl" : 0,
        "damage_type" : "抓伤"
]),
([	"action" : "$N退后一步，双掌一起排出，如钩如戢，插向$n的$l",
	"force" : 40,
	"dodge" : 15,
        "parry" : 5,
	"damage": 0,
	"lvl"   : 15,
	"damage_type" : "刺伤"
]),
([	"action" : "$N忽的一转身，两手环扣，拢成圈状，猛击$n的下颌",
	"force" : 60,
        "dodge" : 18,
        "parry" : 7,
	"damage": 10,
	"lvl" : 30,
        "damage_type" : "内伤"
]),
([	"action" : "$N双手平伸，十指微微上下抖动，戳向$n的$l",
	"force" : 80,
	"dodge" : 25,
        "parry" : 11,
	"damage": 12,
	"lvl"   : 40,
	"damage_type" : "内伤"
]),
([	"action" : "$N左手护胸，腋下含空，右手五指如钩，打向$n的要穴",
	"force" : 100,
	"dodge" : 30,
        "parry" : 14,
	"damage": 15,
	"lvl"   : 50,
	"damage_type" : "内伤"
]),
([	"action" : "$N右腿斜上，上手取目，下手反勾$n的裆部",
	"force" : 115,
	"dodge" : 35,
        "parry" : 17,
	"damage": 19,
	"lvl"   : 60,
	"damage_type" : "内伤"
]),
([	"action" : "$N一手虚指$n的剑诀，劈空抓向$n手中的兵刃",
	"force" : 130,
	"dodge" : 32,
        "parry" : 13,
	"damage": 21,
	"lvl"   : 70,
	"damage_type" : "抓伤"
]),
([	"action" : "$N左手指向$n胸前的五道大穴，右手斜指太阳穴，两面夹击$n",
	"force" : 150,
	"dodge" : 38,
        "parry" : 18,
	"damage": 24,
	"lvl"   : 80,
	"damage_type" : "内伤"
]),
([	"action" : "$N一手撑天，一手指地，劲气笼罩$n的全身",
	"force" : 170,
	"dodge" : 42,
        "parry" : 12,
	"damage": 27,
	"lvl"   : 90,
	"damage_type" : "内伤"
]),
([	"action" : "$N拳掌招若隐若现，若有若无，缓缓地拍向$n的丹田",
	"force" : 190,
        "dodge" : 50,
        "parry" : 15,
	"damage": 30,
	"lvl" : 100,
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage=="hand" ||  usage=="parry"; }

int valid_combine(string combo)
{
        return combo == "taiji-quan" || combo == "wudang-zhang";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练排云手必须空手。\n");

	if ((int)me->query_skill("force") < 40)
		return notify_fail("你的内功火候不够，无法学排云手。\n");

	if ((int)me->query("max_neili") < 250)
		return notify_fail("你的内力太弱，无法练排云手。\n");

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
	level   = (int) me->query_skill("paiyun-shou",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
			return action[NewRandom(i, 20, level/5)];
}


int practice_skill(object me)
{
	if ((int)me->query("qi") < 50)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 40)
		return notify_fail("你的内力不够练排云手。\n");

	me->receive_damage("qi", 37);
	me->add("neili", -25);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"paiyun-shou/" + action;
}
