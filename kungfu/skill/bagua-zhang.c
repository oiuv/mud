inherit SKILL;

mapping *action=({
([	"action" : "$N左肩低，右肩高，左手斜，右手正，一式「怀中抱月」，双掌疾推向$n的肩头",
        "force" : 60,
        "attack": 5,
        "dodge" : 40,
        "parry" : 5,
        "damage": 2,
        "lvl"   : 0,
	"skill_name" : "怀中抱月",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N先退又进，使招「猛虎伏桩」，左掌切向$n的$l，跟着右掌变拳，直击他前胸",
        "force" : 80,
        "attack": 11,
        "dodge" : 43,
        "parry" : 6,
        "damage": 7,
        "lvl"   : 20,
	"skill_name" : "猛虎伏桩",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N身法陡然一变，使出一式「沉肘擒拿」，掌影千变万幻，令$n无法躲闪",
        "force" : 100,
        "attack": 8,
        "dodge" : 45,
        "parry" : 8,
        "damage": 6,
        "lvl"   : 40,
	"skill_name" : "沉肘擒拿",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N左掌向外一穿，右掌「游空探爪」斜劈，对准$n的$l拍出一排掌影，隐隐带着风声",
        "force" : 120,
        "attack": 15,
        "dodge" : 47,
        "parry" : 11,
        "damage": 11,
        "lvl"   : 60,
	"skill_name" : "游空探爪",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N左掌画了个圈圈，暗藏诸多变化，右掌推出，一招「金龙抓爪」直取$n的$l",
        "force" : 140,
        "attack": 24,
        "dodge" : 49,
        "parry" : 13,
        "damage": 15,
        "lvl"   : 90,
	"skill_name" : "金龙抓爪",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N左掌突然张开，变掌为爪，直击化为横扫，一招「遁甲擒踪」便往$n的$l招呼过去",
        "force" : 160,
        "attack": 28,
        "dodge" : 54,
        "parry" : 18,
        "damage": 18,
        "lvl"   : 120,
	"skill_name" : "遁甲擒踪",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N使出「劈雷坠地」，身形凌空飞起，从空中当头向$n的$l出掌攻击",
        "force" : 190,
        "attack": 31,
        "dodge" : 53,
        "parry" : 23,
        "damage": 15,
        "lvl"   : 150,
	"skill_name" : "劈雷坠地",
	"damage_type" : "内伤"
]),
([	"action" : "$N前腿踢出，后腿脚尖点地，一式「双打奇门」，二掌直出，双双攻向$n的上中下三路",
        "force" : 210,
        "attack": 33,
        "dodge" : 55,
        "parry" : 25,
        "damage": 13,
        "lvl"   : 180,
	"skill_name" : "双打奇门",
	"damage_type" : "内伤"
]),
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
	return combo == "bagua-quan";
}

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练八卦掌必须空手。\n");

        if (me->query("max_neili") < 150)
                return notify_fail("你的内力不够，无法练习八卦掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("bagua-zhang", 1))
                return notify_fail("你的基本掌法火候有限，无法领会更高深的八卦掌。\n");

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
        level = (int)me->query_skill("bagua-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 100 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if( (int)me->query("neili") < 80 )
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -50);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"bagua-zhang/" + action;
}
