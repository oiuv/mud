inherit SKILL;

mapping *action = ({
([      "action" : "$N单腿微曲，忽的向前扑出，一式「仙猴摘桃」，二爪直出，抓向$n的双眼",
        "force"  : 180,
        "attack" : 41,
        "parry"  : 35,
        "dodge"  : 35,
        "damage" : 28,
        "lvl"    : 0,
        "damage_type" : "抓伤",
        "skill_name"  : "仙猴摘桃"
]),
([      "action" : "$N左手虚晃，一式「灵猴攀枝」，右手直击，反扣$n的肩井大穴",
        "force"  : 260,
        "attack" : 53,
        "parry"  : 45,
        "dodge"  : 45,
        "damage" : 36,
        "lvl"    : 30,
        "damage_type" : "瘀伤",
        "skill_name"  : "灵猴攀枝"
]),
([      "action" : "$N一臂前伸，一臂后指，一式「猿臂轻舒」，攻向$n的两肋",
        "force"  : 310,
        "attack" : 64,
        "parry"  : 53,
        "dodge"  : 53,
        "damage" : 42,
        "lvl"    : 60,
        "damage_type" : "瘀伤",
        "skill_name"  : "猿臂轻舒"
]),
([      "action" : "$N忽然缩成一团，使一式「八方幻影」，双掌无形无定，一爪抓向$n的胸口",
        "force"  : 360,
        "attack" : 75,
        "parry"  : 61,
        "dodge"  : 61,
        "damage" : 52,
        "lvl"    : 90,
        "damage_type" : "内伤",
        "skill_name"  : "八方幻影"
]),
([      "action" : "$N猛吸一口气，一弯腰，使一式「水中揽月」，双爪疾扣向$n的小腹",
        "force"  : 430,
        "attack" : 84,
        "parry"  : 65,
        "dodge"  : 65,
        "damage" : 58,
        "lvl"    : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "水中揽月"
]),
([      "action" : "$N猛的向上高高跃起，一式「落地摘星」，居高临下，一爪罩向$n的头骨",
        "force"  : 460,
        "attack" : 91,
        "parry"  : 69,
        "dodge"  : 67,
        "damage" : 65,
        "lvl"    : 150,
        "damage_type" : "抓伤",
        "skill_name"  : "落地摘星"
]),
});

int valid_enable(string usage)
{
	return usage == "cuff" ||  usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练迷踪猴拳必须空手。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为太弱，无法练迷踪猴拳。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功火候不够，无法练迷踪猴拳。\n");

        if ((int)me->query_skill("cuff", 1) < 100)
                return notify_fail("你的基本拳法火候不够，无法练迷踪猴拳。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("mizong-houquan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的迷踪猴拳。\n");

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
        level = (int)me->query_skill("mizong-houquan", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够练迷踪猴拳。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -78);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"mizong-houquan/" + action;
}
