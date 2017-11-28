inherit SKILL;

mapping *action = ({
([	"action" : "$N手掌交错，身行前探，一招「虚式分金」，掌风直劈向$n的$l",
        "force" : 120,
        "attack": 10,
        "dodge" : 5,
        "parry" : 5,
        "damage": 35,
        "lvl"   : 0,
	"skill_name" : "虚式分金",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N身行斗转，一招「月落西山」，左手护肘，右手直击$n前胸",
        "force" : 140,
        "attack": 15,
        "dodge" : 7,
        "parry" : 7,
        "damage": 38,
        "lvl"   : 20,
	"skill_name" : "月落西山",
	"damage_type" : "抓伤"
]),
([	"action" : "$N轻喝一声，一招「顺水推舟」，身行不变，将右手迅间化掌，斜击$n的后腰。",
        "force" : 170,
        "attack": 21,
        "dodge" : 11,
        "parry" : 11,
        "damage": 43,
        "lvl"   : 40,
	"skill_name" : "顺水推舟",
	"damage_type" : "瘀伤",
]),
([	"action" : "$N双手自外向内拗入，一招「铁锁横江」，去势奇快，向$n的$l劈去，",
        "force" : 190,
        "attack": 25,
        "dodge" : 13,
        "parry" : 13,
        "damage": 45,
        "lvl"   : 70,
	"skill_name" : "铁锁横江",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N衣袖轻摆,右手上封，左手下压，连削带打奔向$n的$l",
        "force" : 220,
        "attack": 35,
        "dodge" : 15,
        "parry" : 15,
        "damage": 51,
        "lvl"   : 100,
	"skill_name" : "轻罗小扇",
	"damage_type" : "内伤"
]),
([	"action" : "$N一招「黑沼灵狐」，左脚向前一个偷步，右手化掌向前划出,左手顺势反拍$n的面门",
        "force" : 240,
        "attack": 55,
        "dodge" : 18,
        "parry" : 18,
        "damage": 55,
        "lvl"   : 130,
	"skill_name" : "黑沼灵狐",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N脚踩奇门，猛然跃到$n的身旁,一招「生死茫茫」，挥手打向$n的$l",
        "force" : 270,
        "attack": 61,
        "dodge" : 25,
        "parry" : 25,
        "damage": 58,
        "lvl"   : 160,
	"skill_name" : "生死茫茫",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N手指微微作响，一招「高山流水」，掌影犹如飞瀑般将$n笼罩了起来",
        "force" : 310,
        "attack": 75,
        "dodge" : 25,
        "parry" : 25,
        "damage": 65,
        "lvl"   : 200,
	"skill_name" : "高山流水",
	"damage_type" : "瘀伤"
]),
([	"action" : "$N突然愁眉紧缩，神态间散发万种风情，$n猛一惊讶，忽然感到一股排山倒海的掌风袭来",
        "force" : 340,
        "attack": 85,
        "dodge" : 30,
        "parry" : 30,
        "damage": 71,
        "lvl"   : 250,
	"skill_name" : "伊人消魂",
	"damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage=="hand" ||  usage=="parry"; }

int valid_combine(string combo) { return combo == "jinding-zhang" || combo == "tiangang-zhi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练截手九式必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学截手九式。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力太弱，无法练截手九式。\n");

        if (me->query_skill("hand", 1) < me->query_skill("jieshou-jiushi", 1))
                return notify_fail("你的基本手法太差，无法领会更高深的截手九式。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("jieshou-jiushi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练截手九式。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练截手九式。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
	return __DIR__"jieshou-jiushi/" + action;
}
