inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「正掌还经」，单掌平势缓推而出，陡然拍向$n的$l",
        "force"  : 33,
        "dodge"  : 5,
        "parry"  : 2,
        "attack" : 2,
        "damage" : 1,
        "lvl"    : 0,
        "skill_name" : "正掌还经",
        "damage_type": "瘀伤"
]),
([      "action" : "$N使一招「合掌擎天」，右手划了一个圈子，左手挥出，劈向$n的$l",
        "force"  : 45,
        "dodge"  : 18,
        "parry"  : 17,
        "attack" : 6,
        "damage" : 4,
        "lvl"    : 20,
        "skill_name" : "合掌擎天",
        "damage_type": "瘀伤"
]),
([      "action" : "$N右手由钩变掌，使一招「切掌现影」，单掌登时横扫$n的$l",
        "force"  : 51,
        "dodge"  : 16,
        "parry"  : 19,
        "attack" : 11,
        "damage" : 7,
        "lvl"    : 40,
        "skill_name" : "切掌现影",
        "damage_type": "瘀伤"
]),
([      "action" : "$N双手划弧，右手向上，左手向下，使一招「翻掌劈山」砍向$n的面门",
        "force"  : 62,
        "dodge"  : 24,
        "parry"  : 21,
        "attack" : 15,
        "damage" : 9,
        "lvl"    : 60,
        "skill_name" : "翻掌劈山",
        "damage_type": "瘀伤"
]),
([      "action" : "$N左手划了一个大圈，使一招「穿掌行柳」，击向$n的$l",
        "force"  : 75,
        "dodge"  : 24,
        "parry"  : 28,
        "attack" : 19,
        "damage" : 11,
        "lvl"    : 80,
        "skill_name" : "穿掌行柳",
        "damage_type": "瘀伤"
]),
([      "action" : "$N双手合掌，使一招「引掌开峰」，双掌分别向$n的$l打去",
        "force"  : 90,
        "dodge"  : 28,
        "parry"  : 30,
        "attack" : 21,
        "damage" : 14,
        "lvl"    : 100,
        "skill_name" : "引掌开峰",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练六合掌法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学六合掌法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练六合掌法。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("liuhe-zhang", 1))
                return notify_fail("你的基本掌法火候不足，无法领会更高深的六合掌法。\n");

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
        level = (int) me->query_skill("liuhe-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 60 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if( (int)me->query("neili") < 50 )
                return notify_fail("你的内力不够练六合掌法。\n");

        me->receive_damage("qi", 48);
        me->add("neili", -42);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"liuhe-zhang/" + action;
}
