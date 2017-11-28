inherit SKILL;

mapping *action=({
([	"action" : "$N双掌一错，使出「乾字决」，双拳一上一下对准$n的$l连拍三招",
        "force" : 60,
        "attack": 20,
        "dodge" : 40,
        "parry" : 5,
        "damage": 4,
        "lvl"   : 0,
	"skill_name" : "乾字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N绕着$n一转，满场游走，拳出如风，连绵不绝地击向$n，正是八卦拳中的「坤字决」",
        "force" : 80,
        "attack": 25,
        "dodge" : 43,
        "parry" : 6,
        "damage": 7,
        "lvl"   : 20,
	"skill_name" : "坤字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N使出一招「巽字决」，左拳虚击$n的前胸，一错身，右拳迅速横扫$n的太阳穴",
        "force" : 100,
        "attack": 28,
        "dodge" : 45,
        "parry" : 8,
        "damage": 10,
        "lvl"   : 40,
	"skill_name" : "巽字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N使一招「坎字决」左拳击出，不等招式使老，右拳已从左拳之底穿出，对准$n的$l「呼」地一拳",
        "force" : 120,
        "attack": 35,
        "dodge" : 47,
        "parry" : 11,
        "damage": 17,
        "lvl"   : 60,
	"skill_name" : "坎字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N使出一招「震字决」，身形一低，左手护顶，右手已迅雷不及掩耳的一拳击向$n的裆部",
        "force" : 140,
        "attack": 40,
        "dodge" : 49,
        "parry" : 13,
        "damage": 20,
        "lvl"   : 90,
	"skill_name" : "震字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N左拳突然张开，拳开变掌，直击化为横扫，一招「兑字决」便往$n的$l招呼过去",
        "force" : 200,
        "attack": 48,
        "dodge" : 54,
        "parry" : 18,
        "damage": 28,
        "lvl"   : 120,
	"skill_name" : "兑字决",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N一招「离字决」，顿时幻出重重拳影，气势如虹，铺天盖地袭向$n全身",
        "force" : 280,
        "attack": 60,
        "dodge" : 63,
        "parry" : 23,
        "damage": 37,
        "lvl"   : 150,
	"skill_name" : "离字决",
	"damage_type" : "内伤"
]),
([	"action" : "$N微微一笑，手捏「艮字决」，飞身跃起，半空中一脚踢向$n面门，却是个虚招。\n"
	           "说时迟那时快，只见$N一个倒翻，双拳已到了$n的$l",
        "force" : 290,
        "attack": 62,
        "dodge" : 65,
        "parry" : 25,
        "damage": 40,
        "lvl"   : 180,
	"skill_name" : "艮字决",
	"damage_type" : "内伤"
]),
});

int valid_enable(string usage)
{
	return usage == "cuff" || usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "bagua-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练八卦拳必须空手。\n");

        if (me->query("max_neili") < 150)
                return notify_fail("你的内力不够，无法练习八卦拳。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("bagua-quan", 1))
                return notify_fail("你的基本拳法火候有限，无法领会更高深的八卦拳。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("bagua-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"bagua-quan/" + action;
}
