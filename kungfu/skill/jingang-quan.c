// jingang-quan.c -大金刚拳
// Modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N盘膝而坐，二手合十，一式「莲花座」，双拳蓄势而发，击向$n的$l",
        "force" : 120,
        "dodge" : 10,
        "damage": 30,
        "lvl"   : 0,
        "skill_name" : "莲花座",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一式「烈火锥」，双掌轮流下击，拳势如焰，吡啪爆响",
        "force" : 170,
        "dodge" : 15,
        "damage": 45,
        "lvl"   : 40,
        "skill_name" : "烈火锥",
        "damage_type" : "瘀伤"
]),
([      "action": "$N腾空飞起，一式「八方雨」，双手双腿齐出，令$n无可躲藏",    
        "force" : 220,
        "dodge" : 25,
        "damage": 60,
        "lvl"   : 70,
        "skill_name" : "八方雨",
        "damage_type" : "瘀伤"
]),
([      "action": "$N双掌虚含，掌缘下沉，一式「掌心雷」，缓缓向$n推出",
        "force" : 270,
        "dodge" : 25,
        "damage": 70,
        "lvl"   : 100,
        "skill_name" : "掌心雷",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一臂前伸，一臂后指，一式「五指山」，攻向$n的身前身后",    
        "force" : 320,
        "dodge" : 30,
        "damage": 80,
        "lvl"   : 120,
        "skill_name" : "五指山",
        "damage_type" : "瘀伤"
]),
([      "action": "$N一式「观音渡」，两手十指虚点$n的全身三十六道要穴",
        "force" : 340,
        "dodge" : 35,
        "damage": 85,
        "lvl"   : 140,
        "skill_name" : "观音渡",
        "damage_type" : "瘀伤"
]),
([      "action": "$N两目内视，双手内笼，一式「天龙唱」，四面八方响起震人心魄的龙吟",
        "force" : 360,
        "dodge" : 35,
        "damage": 90,
        "lvl"   : 160,
        "skill_name" : "天龙唱",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N似笑非笑，双拳无形无定，一式「如来笑」，骤然击向$n的前胸",
        "force" : 395,
        "dodge" : 40,
        "damage": 100,
        "lvl"   : 180,
        "skill_name" : "如来笑",
        "damage_type" : "瘀伤"
])
});

int valid_enable(string usage) { return  usage == "cuff" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练大金刚拳必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学大金刚拳。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练大金刚拳。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("jingang-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的大金刚拳。\n");

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
        level = (int) me->query_skill("jingang-quan",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[random(i)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练大金刚拳。\n");

        me->receive_damage("qi", 59);
        me->add("neili", -58);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jingang-quan/" + action;
}
