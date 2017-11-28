// yunlongshou.c -云龙手

inherit SKILL;

mapping *action = ({
([	"action" : "$N一式「草木皆兵」，十指伸缩，虚虚实实地袭向$n的全身要穴",
	"force" : 80,
        "dodge" : 30,
	"damage": 15,
	"lvl" : 0,
	"skill_name" : "草木皆兵",
        "damage_type" : "抓伤"
]),
([	"action" : "在呼呼风声中，$N使一招「捕风捉影」，双手如钩如戢，插向$n的$l",
	"force" : 100,
	"dodge" : 35,
	"damage": 20,
	"lvl"   : 30,
	"skill_name" : "捕风捉影" ,		
	"damage_type" : "刺伤"
]),
([	"action" : "$N双拳挥舞，一式「浮云去来」，两手环扣，拢成圈状，猛击$n的下颌",
	"force" : 120,
        "dodge" : 30,
	"damage": 25,
	"lvl" : 60,
	"skill_name" : "浮云去来",
        "damage_type" : "内伤"
]),
([	"action" : "$N双手平伸，十指微微上下抖动，一招「十指乾坤」打向$n的$l",
	"force" : 140,
	"dodge" : 35,
	"damage": 30,
	"lvl"   : 80,
	"skill_name" : "十指乾坤" ,		
	"damage_type" : "内伤"
]),
([	"action" : "$N左手护胸，腋下含空，右手五指如钩，一招「抱残守缺」插向$n的顶门",
	"force" : 160,
	"dodge" : 40,
	"damage": 30,
	"lvl"   : 100,
	"skill_name" : "抱残守缺" ,		
	"damage_type" : "内伤"
]),
([	"action" : "$N右腿斜插$n二腿之间，一招「掏虚抢珠」，上手取目，下手反勾$n的裆部",
	"force" : 180,
	"dodge" : 35,
	"damage": 40,
	"lvl"   : 120,
	"skill_name" : "掏虚抢珠" ,		
	"damage_type" : "内伤"
]),
([	"action" : "$N一手虚指$n的剑诀，一招「空手入刃」，劈空抓向$n手中的兵刃",
	"force" : 210,
	"dodge" : 35,
	"damage": 45,
	"lvl"   : 130,
	"skill_name" : "空手入刃" ,		
	"damage_type" : "抓伤"
]),
([	"action" : "$N左手指向$n胸前的五道大穴，右手斜指太阳穴，一招「降龙伏虎」使$n进退两难",
	"force" : 230,
	"dodge" : 40,
	"damage": 50,
	"lvl"   : 140,
	"skill_name" : "降龙伏虎" ,		
	"damage_type" : "内伤"
]),
([	"action" : "$N一手顶天成爪，一手指地，一招「拨云见日」,劲气笼罩$n的全身",
	"force" : 250,
	"dodge" : 50,
	"damage": 55,
	"lvl"   : 150,
	"skill_name" : "拨云见日" ,		
	"damage_type" : "内伤"
]),
([	"action" : "$N一式「如烟往事」，拳招若隐若现，若有若无，缓缓地拍向$n的丹田",
	"force" : 270,
        "dodge" : 60,
	"damage": 60,
	"lvl" : 160,
	"skill_name" : "如烟往事",
        "damage_type" : "内伤"
]),
([	"action" : "$N随意挥洒，使一式「我心依旧」，掌心微红,徐徐拍向$n的$l",
	"force" : 290,
        "dodge" : 60,
        "parry" : 60,
	"damage": 70,
	"lvl" : 170,
	"skills_name" : "我心依旧",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage=="hand" ||  usage=="parry"; }

int valid_combine(string combo) { return combo=="yunlong-zhua"; }

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练云龙手必须空手。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的云龙神功火候不够，无法学云龙手。\n");

	if ((int)me->query("max_neili") < 700)
		return notify_fail("你的内力太弱，无法练云龙手。\n");

	if ((int)me->query_skill("hand",1) < 100)
		return notify_fail("你的基本手法火候不够，无法学云龙手。\n");

	if ((int)me->query_skill("hand",1) < (int)me->query_skill("yunlong-shou",1))
		return notify_fail("你的基本手法水平有限，无法继续学云龙手。\n");

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
	level   = (int) me->query_skill("yunlong-shou",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
			return action[NewRandom(i, 20, level/5)];

}


int practice_skill(object me)
{
	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够练云龙手。\n");

	me->receive_damage("qi", 62);
	me->add("neili", -59);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"yunlong-shou/" + action;
}
