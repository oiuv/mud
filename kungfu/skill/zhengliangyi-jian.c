inherit SKILL;

mapping *action = ({
([	"action":"$N一式「顺水推舟」，$N手中$w指向自己左胸口，剑柄斜斜向右外，缓缓划向$n的$l",
	"force" : 85,
        "dodge" : 35,
        "parry" : 35,
        "attack": 31,
	"damage": 23,
	"lvl"   : 0,
	"skill_name" : "顺水推舟",
	"damage_type":"刺伤"
]),
([	"action":"$N身形微侧，左手后摆，右手$w一招「横扫千军」，直向$n的腰间挥去",
	"force" : 109,
        "dodge" : 41,
        "parry" : 43,
        "attack": 33,
	"damage": 24,
	"lvl"   : 20,
	"skill_name" : "横扫千军",
	"damage_type":"刺伤"
]),
([	"action":"$N纵身近前，$w斗然弯弯弹出，剑光爆长，一招「峭壁断云」，猛地刺向$n的胸口",
	"force" : 121,
        "dodge" : 43,
        "parry" : 45,
        "attack": 35,
	"damage": 27,
	"lvl"   : 40,
	"skill_name" : "峭壁断云",
	"damage_type":"刺伤"
]),
([	"action":"$N左手捏个剑决，平推而出，决指上仰，右手剑朝天不动，一招「仙人指路」，刺向$n",
	"force" : 135,
        "dodge" : 48,
        "parry" : 47,
        "attack": 37,
	"damage": 31,
	"lvl"   : 60,
	"skill_name" : "仙人指路",
	"damage_type":"刺伤"
]),
([	"action":"$N剑招忽变，使出一招「雨打飞花」，全走斜势，但七八招斜势中偶尔又挟着一招正势，教人极难捉摸",
	"force" : 143,
        "dodge" : 57,
        "parry" : 59,
        "attack": 41,
	"damage": 32,
	"lvl"   : 80,
	"skill_name" : "雨打飞花",
	"damage_type":"刺伤"
]),
([	"action":"$N手中$w剑刃竖起，锋口向下，一招「大漠平沙」，剑走刀势，劈向$n的$l",
	"force" : 153,
        "dodge" : 63,
        "parry" : 68,
        "attack": 43,
	"damage": 34,
	"lvl"   : 100,
	"skill_name" : "大漠平沙",
	"damage_type":"劈伤"
]),
([	"action":"$N一招「木叶萧萧」，$N横提$w，剑尖斜指向天，由上而下，劈向$n的$l",
	"force" : 167,
        "dodge" : 69,
        "parry" : 71,
        "attack": 45,
	"damage": 36,
	"lvl"   : 120,
	"skill_name" : "木叶萧萧",
	"damage_type":"劈伤"
]),
([	"action":"$N抢前一步，$w微微抖动，剑光点点，一招「江河不竭」，终而复始，绵绵不绝刺向$n",
	"force" : 185,
        "dodge" : 73,
        "parry" : 78,
        "attack": 48,
	"damage": 37,
	"lvl"   : 140,
	"skill_name" : "江河不竭",
	"damage_type":"刺伤"
]),
([	"action":"$N左手剑鞘一举，快逾电光石光，一招「高塔挂云」，用剑鞘套住$n手中兵器，$w直指$n的咽喉",
	"force" : 205,
        "dodge" : 78,
        "parry" : 85,
        "attack": 49,
	"damage": 38,
	"lvl"   : 160,
	"skill_name" : "高塔挂云",
	"damage_type":"刺伤"
]),
([	"action":"$N翻身回剑，剑诀斜引，一招「百丈飞瀑」，剑锋从半空中直泻下来，罩住$n上方",
	"force" : 243,
        "dodge" : 82,
        "parry" : 91,
        "attack": 51,
	"damage": 39,
	"lvl"   : 180,
	"skill_name" : "百丈飞瀑",
	"damage_type":"刺伤"
]),
([	"action":"$N一式「雪拥蓝桥」，$N手中剑花团团，一条白练疾风般向卷向$n",
	"force" : 271,
        "dodge" : 87,
        "parry" : 95,
        "attack": 53,
	"damage": 41,
	"lvl"   : 200,
	"skill_name" : "雪拥蓝桥",
	"damage_type":"刺伤"
]),
([	"action":"$N腾空而起，突然使出一招「悄然无声」，悄无声息地疾向$n的背部刺去",
	"force" : 285,
        "dodge" : 95,
        "parry" : 107,
        "attack": 57,
	"damage": 43,
	"lvl"   : 220,
	"skill_name" : "悄然无声",
	"damage_type":"刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force", 1) < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword") < 50)
                return notify_fail("你的基本剑法火候太浅，无法修炼正两仪剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("zhengliangyi-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的正两仪剑法。\n");

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
        level = (int) me->query_skill("zhengliangyi-jian", 1);
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

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练正两仪剑法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练正两仪剑法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -75);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhengliangyi-jian/" + action;
}
