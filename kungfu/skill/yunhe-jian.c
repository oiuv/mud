inherit SKILL;

mapping *action = ({
([	"action": "$N剑尖向右，绕身一周，一式「百鹤鸣晓」，$w突然向$n的$l刺去，",
	"force" : 35,
        "dodge" : -40,
        "parry" : -40,
        "attack": 2,
	"damage": 3,
	"lvl"   : 0,
	"skill_name" : "百鹤鸣晓",
	"damage_type":"刺伤"
]),
([	"action": "$N使出一式「仙鹤西来」，身体凌空侧翻，一剑从身下刺出",
	"force" : 59,
        "dodge" : -35,
        "parry" : -35,
        "attack": 3,
	"damage": 4,
	"lvl"   : 20,
	"skill_name" : "仙鹤西来",
	"damage_type":"刺伤"
]),
([	"action": "$N左手剑指血指，右手$w使出一招「乘鹤东归」，由上至下猛向$n的$l劈刺",
	"force" : 77,
        "dodge" : -23,
        "parry" : -23,
        "attack": 5,
	"damage": 7,
	"lvl"   : 40,
	"skill_name" : "乘鹤东归",
	"damage_type":"刺伤"
]),
([	"action": "$N撤步缩身，$w按藏于臂下，一招「一鹤冲宵」，快如闪电般刺向$n的$l",
	"force" : 83,
        "dodge" : -18,
        "parry" : -18,
        "attack": 9,
	"damage": 10,
	"lvl"   : 60,
	"skill_name" : "一鹤冲宵",
	"damage_type":"刺伤"
]),
([	"action": "$N踏步向前，一式「鹤贝相争」，手中长剑摆动，剑尖刺向$n的$l",
	"force" : 127,
        "dodge" : -9,
        "parry" : -9,
        "attack": 11,
	"damage": 12,
	"lvl"   : 80,
	"skill_name" : "鹤贝相争",
	"damage_type":"刺伤"
]),
([	"action": "$N一招「云鹤三舞」，身体背转，手中$w由右肩上方反手向下刺出",
	"force" : 179,
        "dodge" : -5,
        "parry" : -5,
        "attack": 31,
	"damage": 44,
	"lvl"   : 100,
	"skill_name" : "云鹤三舞",
	"damage_type":"劈伤"
]),
([	"action": "$N一式「云鹤七舞」，剑走中锋，气势威严，将$n笼罩于重重剑气之中",
	"force" : 217,
        "dodge" : 5,
        "parry" : 5,
        "attack": 35,
	"damage": 56,
	"lvl"   : 130,
	"skill_name" : "云鹤七舞",
	"damage_type":"劈伤"
]),
([	"action": "$N向前弯身，一招「云鹤九舞」，$w忽然从身下刺出，快如流星闪电",
	"force" : 260,
        "dodge" : 10,
        "parry" : 10,
        "attack": 48,
	"damage": 72,
	"lvl"   : 160,
	"skill_name" : "云鹤九舞",
	"damage_type":"刺伤"
]),
([	"action": "$N横握$w，左右晃动，一招「鹤舞十二天」，剑气直逼$n的腰部要害",
	"force" : 305,
        "dodge" : 14,
        "parry" : 14,
        "attack": 51,
	"damage": 84,
	"lvl"   : 200,
	"skill_name" : "鹤舞十二天",
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

        if ((int)me->query_skill("sword") < 30)
                return notify_fail("你的基本剑法火候太浅，无法修炼云鹤七剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("yunhe-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的云鹤七剑。\n");

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
        level = (int) me->query_skill("yunhe-jian", 1);
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
                return notify_fail("你的体力不够练云鹤七剑。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练云鹤七剑。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -45);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yunhe-jian/" + action;
}
