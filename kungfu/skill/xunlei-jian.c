inherit SKILL;

mapping *action = ({
([	"action": "$N剑尖向右，绕身一周，一式「仙人指路」，$w突然向$n的$l刺去，",
	"force" : 35,
        "dodge" : -40,
        "parry" : -40,
        "attack": 2,
	"damage": 3,
	"lvl"   : 0,
	"skill_name" : "仙人指路",
	"damage_type":"刺伤"
]),
([	"action": "$N使出一式「鹞子翻身」，身体凌空侧翻，一剑从身下刺出",
	"force" : 49,
        "dodge" : -35,
        "parry" : -35,
        "attack": 3,
	"damage": 4,
	"lvl"   : 10,
	"skill_name" : "鹞子翻身",
	"damage_type":"刺伤"
]),
([	"action": "$N左手剑指血指，右手$w使出一招「海底寻针」，由上至下猛向$n的$l劈刺",
	"force" : 57,
        "dodge" : -23,
        "parry" : -23,
        "attack": 5,
	"damage": 7,
	"lvl"   : 20,
	"skill_name" : "海底寻针",
	"damage_type":"刺伤"
]),
([	"action": "$N撤步缩身，$w按藏于臂下，一招「灵猿探洞」，快如闪电般刺向$n的$l",
	"force" : 63,
        "dodge" : -18,
        "parry" : -18,
        "attack": 9,
	"damage": 10,
	"lvl"   : 30,
	"skill_name" : "灵猿探洞",
	"damage_type":"刺伤"
]),
([	"action": "$N踏步向前，一式「拨草寻蛇」，手中长剑摆动，剑尖刺向$n的$l",
	"force" : 67,
        "dodge" : -9,
        "parry" : -9,
        "attack": 11,
	"damage": 12,
	"lvl"   : 40,
	"skill_name" : "拨草寻蛇",
	"damage_type":"刺伤"
]),
([	"action": "$N一招「斜插神枝」，身体背转，手中$w由右肩上方反手向下刺出",
	"force" : 79,
        "dodge" : -5,
        "parry" : -5,
        "attack": 13,
	"damage": 14,
	"lvl"   : 50,
	"skill_name" : "斜插神枝",
	"damage_type":"劈伤"
]),
([	"action": "$N一式「电闪雷动」，剑走中锋，气势威严，将$n笼罩于重重剑气之中",
	"force" : 87,
        "dodge" : 5,
        "parry" : 5,
        "attack": 15,
	"damage": 16,
	"lvl"   : 60,
	"skill_name" : "电闪雷动",
	"damage_type":"劈伤"
]),
([	"action": "$N向前弯身，一招「夫子揖手」，$w忽然从身下刺出，快如流星闪电",
	"force" : 90,
        "dodge" : 10,
        "parry" : 10,
        "attack": 18,
	"damage": 20,
	"lvl"   : 70,
	"skill_name" : "夫子揖手",
	"damage_type":"刺伤"
]),
([	"action": "$N横握$w，左右晃动，一招「玉带缠腰」，剑气直逼$n的腰部要害",
	"force" : 105,
        "dodge" : 14,
        "parry" : 14,
        "attack": 20,
	"damage": 24,
	"lvl"   : 80,
	"skill_name" : "玉带缠腰",
	"damage_type":"刺伤"
]),
([	"action": "$N双手持剑，将$w当做刀使，一招「举火烧天」，由身后向$n的前上方劈去",
	"force" : 110,
        "dodge" : 18,
        "parry" : 18,
        "attack": 24,
	"damage": 28,
	"lvl"   : 90,
	"skill_name" : "举火烧天",
	"damage_type":"刺伤"
]),
([	"action": "$N侧身向$n，使出一招「败马斩蹄」，挥动手中$w，直劈$n的下三路",
	"force" : 120,
        "dodge" : 20,
        "parry" : 20,
        "attack": 26,
	"damage": 30,
	"lvl"   : 100,
	"skill_name" : "败马斩蹄",
	"damage_type":"刺伤"
]),
([	"action": "$N手中$w由右自左，一招「玉女穿针」，$w突然反手刺向$n的$l",
	"force" : 135,
        "dodge" : 24,
        "parry" : 24,
        "attack": 30,
	"damage": 35,
	"lvl"   : 110,
	"skill_name" : "玉女穿针",
	"damage_type":"刺伤"
]),
([	"action": "$N跳步向前，剑尖上指，一招「灵猿登枝」，$w挑向$n的头部要害",
	"force" : 140,
        "dodge" : 26,
        "parry" : 26,
        "attack": 31,
	"damage": 36,
	"lvl"   : 120,
	"skill_name" : "灵猿登枝",
	"damage_type":"刺伤"
]),
([	"action": "$N一招「苏武挥鞭」，$w随身走，犹如一条白龙，将$n全身上下笼罩",
	"force" : 145,
        "dodge" : 28,
        "parry" : 28,
        "attack": 33,
	"damage": 38,
	"lvl"   : 130,
	"skill_name" : "苏武挥鞭",
	"damage_type":"刺伤"
]),
([	"action": "$N剑尖向下，一招「挑灯看剑」，$w忽然急转直上，剑气将$n的上身要害团团围住",
	"force" : 150,
        "dodge" : 30,
        "parry" : 30,
        "attack": 35,
	"damage": 40,
	"lvl"   : 140,
	"skill_name" : "挑灯看剑",
	"damage_type":"刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword") < 10)
                return notify_fail("你的基本剑法火候太浅，无法修炼迅雷剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("xunlei-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的迅雷剑法。\n");

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
        level = (int) me->query_skill("xunlei-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练迅雷剑法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练迅雷剑法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -45);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xunlei-jian/" + action;
}
