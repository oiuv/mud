inherit SKILL;

mapping *action = ({
([      "action" : "$N站立如松，一式「冲天」，两股拳风破气而发，击向$n的$l",
        "force"  : 40,
        "attack" : 8,
        "parry"  : 3,
        "dodge"  : 2,
        "damage" : 5,
        "lvl"    : 0,
        "skill_name"  : "冲天",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一式「破地」，左拳下击，右拳随后直冲，势如地裂",
        "force"  : 55,
        "attack" : 9,
        "parry"  : 1,
        "dodge"  : 2,
        "damage" : 7,
        "lvl"    : 10,
    	"skill_name"  : "破地",
    	"damage_type" : "瘀伤"
]),
([  	"action" : "$N腾空飞起，一式「腾风」，拳式变腿招踢出，$n急忙躲闪",    
        "force"  : 64,
        "attack" : 12,
        "parry"  : 5,
        "dodge"  : 3,
        "damage" : 9,
        "lvl"    : 30,
    	"skill_name"  : "腾风",
    	"damage_type" : "瘀伤"
]),
([  	"action" : "$N双拳划开，疾风突起，一式「劈海」，向$n发出",
        "force"  : 71,
        "attack" : 13,
        "parry"  : 4,
        "dodge"  : 6,
        "damage" : 11,
        "lvl"    : 50,
    	"skill_name"  : "劈海",
    	"damage_type" : "瘀伤"
]),
([  	"action" : "$N两臂后展，拳招变掌，一式「开山」，插向$n的掖下死穴",    
        "force"  : 84,
        "attack" : 18,
        "parry"  : 13,
        "dodge"  : 12,
        "damage" : 15,
        "lvl"    : 70,
    	"skill_name"  : "开山",
    	"damage_type" : "瘀伤"
]),
([  	"action" : "$N一式「袭火」，拳变指，点向$n的胸前死穴",
        "force"  : 93,
        "attack" : 21,
        "parry"  : 7,
        "dodge"  : 9,
        "damage" : 19,
        "lvl"    : 90,
    	"skill_name"  : "袭火",
    	"damage_type" : "瘀伤"
]),
([  	"action" : "$N出其不意，从上而下，一式「碎冰」，四周空气先凝集后突爆开",
        "force"  : 101,
        "attack" : 24,
        "parry"  : 8,
        "dodge"  : 12,
        "damage" : 25,
        "lvl"    : 120,
    	"skill_name"  : "碎冰",
   	"damage_type" : "瘀伤"
]),
([  	"action" : "$N眼眉一皱，双拳破气齐发，一式「凌霄总决」，击向$n的头额",
        "force"  : 140,
        "attack" : 28,
        "parry"  : 13,
        "dodge"  : 12,
        "damage" : 27,
        "lvl"    : 150,
    	"skill_name"  : "凌霄总决",
    	"damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return usage == "cuff" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "piaoxu-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练凌霄拳法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学凌霄拳法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练凌霄拳法。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("lingxiao-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的凌霄拳法。\n");

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
        level = (int) me->query_skill("lingxiao-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练凌霄拳法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -25);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"lingxiao-quan/" + action;
}
