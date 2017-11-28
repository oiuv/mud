//
// yujiamu-quan.c 金刚瑜迦母拳
// Designed by secret(秘密)
//

inherit SKILL;

mapping *action = ({
([      "action" : "$N并举双拳，使出一招「灌顶」，当头砸向$n的$l  ",
        "skill_name" : "灌顶",
        "force" : 160,
        "dodge" : 5,
        "lvl" : 0,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「解苦」，身形一低，左手护顶，右手一拳击向$n的裆部  ",
        "skill_name" : "解苦",
        "force" : 200,
        "dodge" : -5,
        "lvl" : 30,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「颦眉」，左拳虚击$n的前胸，一错身，右拳横扫$n的太阳穴  ",
        "skill_name" : "颦眉",
        "force" : 220,
        "dodge" : 10,
        "lvl" : 60,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N神形怪异，使一招「嗔恚」，双拳上下击向$n的$l  ",
        "skill_name" : "嗔恚",
        "force" : 250,
        "dodge" : 5,
        "lvl" : 80,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「静寂」，双拳交错，缓缓击出，劲气直指$n的$l  ",
        "skill_name" : "静寂",
        "force" : 270,
        "dodge" : -5,
        "lvl" : 100,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N微微一笑，使出一式「妙音」，双拳前后击出，直取$n的左胸  ",
        "skill_name" : "妙音",
        "force" : 300,
        "dodge" : 10,
        "lvl" : 120,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「明心」，全身疾转，双拳横扫$n的$l  ",
        "skill_name" : "明心",
        "force" : 310,
        "dodge" : 20,
        "lvl" : 140,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N飞身一跃，使出一招「制胜」，一拳猛击$n咽喉  ",
        "skill_name" : "制胜",
        "force" : 330,
        "dodge" : 5,
        "lvl" : 160,
        "damage_type" : "瘀伤",
]),
});

int valid_enable(string usage) { return usage == "cuff" || usage == "parry"; }

int valid_combine(string combo)
{
	return combo=="dashou-yin" ||
	       combo=="huoyan-dao";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练金刚瑜迦母拳必须空手。\n");

	if ((int)me->query("max_neili") < 600)
		return notify_fail("你的内力不够。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("yujiamu-quan",1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的金刚瑜迦母拳。\n");

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
	level   = (int) me->query_skill("yujiamu-quan",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
//	object weapon;

	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
		return notify_fail("练金刚瑜迦母拳必须空手。\n");

	if ((int)me->query("qi") < 60)
		return notify_fail("你的体力不够，练不了金刚瑜迦母拳。\n");

        if ((int)me->query("neili") < 70)
		return notify_fail("你的内力不够，练不了金刚瑜迦母拳。\n");

	me->receive_damage("qi", 50);
        me->add("neili", -61);
	return 1;
}

string perform_action_file(string action)
{
       return __DIR__"yujiamu-quan/" + action;
}