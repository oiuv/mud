// yunlong-zhua.c -云龙爪

inherit SKILL;

mapping *action = ({
([	"action" : "$N全身拔地而起，半空中一个筋斗，一式「凶鹰袭兔」，迅猛地抓向$n的$l",
	"force" : 70,
        "dodge" : 15,
        "parry" : 10,
	"damage": 10,
	"lvl" : 0,
	"skills_name" : "凶鹰袭兔",
	"damage_type" : "抓伤"
]),
([	"action" : "$N单腿直立，双臂平伸，一式「雄鹰展翅」，双爪一前一后拢向$n的$l",
	"force" : 90,
        "dodge" : 20,
        "parry" : 15,
	"damage": 15,
	"lvl" : 30,
	"skills_name" : "雄鹰展翅",
        "damage_type" : "抓伤"
]),
([	"action" : "$N一式「拔翅鹰飞」，全身向斜里平飞，右腿一绷，双爪搭向$n的肩头",
	"force" : 100,
        "dodge" : 20,
        "parry" : 20,
	"damage": 20,
	"lvl" : 40,
	"skills_name" : "拔翅鹰飞",
        "damage_type" : "内伤"
]),
([	"action" : "$N双爪交错上举，使一式「迎风振翼」，一拔身，分别袭向$n左右腋空门",
	"force" : 120,
        "dodge" : 25,
        "parry" : 20,
	"damage": 30,
	"lvl" : 60,
	"skills_name" : "迎风振翼",
        "damage_type" : "内伤"
]),
([	"action" : "$N全身滚动上前，一式「飞龙献爪」，右爪突出，鬼魅般抓向$n的胸口",
	"force" : 140,
        "dodge" : 30,
        "parry" : 25,
	"damage": 40,
	"lvl" : 80,
	"skills_name" : "飞龙献爪",
        "damage_type" : "内伤"
]),
([	"action" : "$N伏地滑行，一式「顶天立地」，上手袭向膻中大穴，下手反抓$n的裆部",
	"force" : 150,
        "dodge" : 35,
        "parry" : 25,
	"damage": 50,
	"lvl" : 100,
	"skills_name" : "顶天立地",
        "damage_type" : "内伤"
]),
([	"action" : "$N左右手掌爪互逆，一式「搏击长空」，无数道劲气破空而出，迅疾无比地击向$n",
	"force" : 180,
        "dodge" : 55,
        "parry" : 55,
	"damage": 65,
	"lvl" : 120,
	"skills_name" : "搏击长空",
        "damage_type" : "内伤"
]),
([	"action" : "$N腾空高飞三丈，一式「鹰扬万里」，天空中顿时显出一个巨灵爪影，缓缓罩向$n",
	"force" : 230,
        "dodge" : 40,
        "parry" : 40,
	"damage": 60,
	"lvl" : 140,
	"skills_name" : "鹰扬万里",
        "damage_type" : "内伤"
]),
([	"action" : "$N忽的拨地而起，使一式「苍龙出水」，身形化作一道闪电射向$n",
	"force" : 270,
        "dodge" : 50,
        "parry" : 50,
	"damage": 80,
	"lvl" : 160,
	"skills_name" : "苍龙出水",
        "damage_type" : "内伤"
]),
([	"action" : "$N微微一笑，使一式「万佛朝宗」，双手幻出万道金光,直射向$n的$l",
	"force" : 310,
        "dodge" : 60,
        "parry" : 60,
	"damage": 100,
	"lvl" : 180,
	"skills_name" : "万佛朝宗",
        "damage_type" : "内伤"
])
});

int valid_enable(string usage) { return usage=="claw" || usage=="unarmed"; }

int valid_combine(string combo) { return combo=="yunlong-shou"; }

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练云龙爪必须空手。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的云龙神功火候不够，无法学云龙爪。\n");

	if ((int)me->query("max_neili") < 800)
		return notify_fail("你的内力太弱，无法练云龙爪。\n");

	if ((int)me->query_skill("claw",1) < 100)
		return notify_fail("你的基本爪法火候不够，无法学云龙爪。\n");

	if ((int)me->query_skill("claw",1) < (int)me->query_skill("yunlong-zhua",1))
		return notify_fail("你的基本爪法水平有限，无法继续学云龙爪。\n");

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
	level   = (int) me->query_skill("yunlong-zhua",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够练云龙爪。\n");

	me->receive_damage("qi", 55);
	me->add("neili", -62);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"yunlong-zhua/" + action;
}
