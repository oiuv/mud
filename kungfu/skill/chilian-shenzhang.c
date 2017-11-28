inherit SKILL;

mapping *action = ({
([	"action" : "$N一招「赤色落阳」，掌力化成弧形，罩向$n的$l",
	"force" : 60,
        "attack": 2,
        "parry" : 1,
	"damage": 2,
	"lvl"   : 0,
	"skill_name" : "赤色落阳",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N一招「七彩流金」，身体高高跃起，扑向$n的$l就"
                   "是一记重掌",
	"force" : 80,
        "attack": 8,
        "parry" : 3,
	"damage": 4,
	"lvl"   : 20,
	"skill_name" : "七彩流金",
	"damage_type" : "内伤"
]),
([	"action" : "$N一招「赤蝶迎晚霞」，忽然袖中双掌咋现，分别从"
                   "左右两边齐齐攻向$n",
	"force" : 100,
        "attack": 12,
	"dodge" : 43,
	"damage": 6,
	"lvl"   : 30,
	"skill_name" : "赤蝶迎晚霞",
	"damage_type" : "瘀伤"
]),

([	"action" : "$N一招「群山遮落日」,头缓缓低下，似乎显得没精打"
                   "采，一记云掌软绵绵的拍向$n",
	"force" : 130,
        "attack": 15,
	"dodge" : 55,
	"damage": 8,
	"lvl"   : 40,
	"skill_name" : "群山遮落日",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「幽幽谷中叙」，突然纵起丈余，犹如一只在空"
                   "中盘旋的飞龙，一掌拍向$n",
	"force" : 150,
        "attack": 22,
	"dodge" : 52,
	"damage": 14,
	"lvl"   : 60,
	"skill_name" : "幽幽谷中叙",
	"damage_type" : "瘀伤"
]),

([	"action" : "$N双掌平挥，一招「冥冥道中聚」身如陀螺急转，忽然"
                   "飞身而起，一掌拍向$n的$l",
	"force" : 180,
        "attack": 23,
	"dodge" : 65,
	"damage": 25,
	"lvl"   : 80,
	"skill_name" : "冥冥道中聚",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一招「高堂明镜」，犹如一只展翅翱翔的大鹏，运掌"
                   "如风般袭向$n",
	"force" : 210,
        "attack": 20,
	"dodge" : 63,
	"damage": 40,
	"lvl"   : 100,
	"skill_name" : "高堂明镜",
	"damage_type" : "内伤"
]),

([	"action" : "$N左掌虚晃，右掌一记「天上人间」猛地插往$n的$l",
	"force" : 240,
        "attack": 18,
	"dodge" : 77,
	"damage": 50,
	"lvl"   : 120,
	"skill_name" : "天上人间",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N施出「金石为开」，双掌不断反转，忽地并拢，笔直"
                   "地向$n的$l袭去",
	"force" : 260,
        "attack": 21,
	"dodge" : 80,
	"damage": 60,
	"lvl"   : 140,
	"skill_name" : "金石为开",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N施出「万众归心」，双掌翻腾不息，龙吟般的卷向$n",
	"force" : 280,
        "attack": 25,
	"dodge" : 81,
	"damage": 80,
	"lvl"   : 160,
	"skill_name" : "万众归心",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage)
{
	return usage == "parry" || usage == "strike";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练赤练神掌必须空手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，无法练赤练神掌。\n");

	if ((int)me->query("max_neili") < 1000)
		return notify_fail("你的内力太弱，无法练赤练神掌。\n");

        if ((int)me->query_skill("strike", 1) < 80)
                return notify_fail("你的基本掌法火候不够，无法练赤练神掌。\n");

	if ((int)me->query_skill("strike", 1) < (int)me->query_skill("chilian-shenzhang", 1))
		return notify_fail("你的基本掌法水平有限，无法领会更高深的赤练神掌。\n");

	return 1;
}

mapping query_action(object me, object weapon)
{
	int i, level;
	level = (int) me->query_skill("chilian-shenzhang",1);
	for(i = sizeof(action); i > 0; i--)
		if(level > action[i-1]["lvl"])
			return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 70)
		return notify_fail("你的体力太低了。\n");
	if ((int)me->query("neili") < 60)
		return notify_fail("你的内力不够练赤练神掌。\n");

	me->receive_damage("qi", 61);
	me->add("neili", -53);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"chilian-shenzhang/" + action;
}
