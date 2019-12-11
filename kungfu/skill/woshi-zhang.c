inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action" : "$N马步一立，身子微曲，暗喝一声，一招「望月拜天」，一掌直劈$n的$l",
        "force" : 110,
        "dodge" : 10,
        "parry" : 10,
        "attack": 30,
        "damage": 40,
        "lvl" : 10,
        "skill_name" : "望月拜天",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N“哈哈”一笑，左掌由下至上，右掌平平击出，一招「跨日向天」，交替打向$n",
        "force" : 130,
        "dodge" : 20,
        "parry" : 30,
        "attack": 30,
        "damage": 50,
        "lvl" : 30,
        "skill_name" : "跨日向天",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N对$n一声大喝，使一招「长虹经天」，左掌击出，随即右掌跟上，两重力道打向$n的$l",
        "force" : 140,
        "dodge" : 27,
        "parry" : 43,
        "attack": 40,
        "damage": 60,
        "lvl" : 60,
        "skill_name" : "长虹经天",
        "damage_type" : "震伤"
]),
([      "action" : "$N闷喝一声，双掌向上分开，一记「举火烧天」，掌划弧线，左右同时击向$n的$l",
        "force" : 160,
        "dodge" : 37,
        "parry" : 33,
        "attack": 54,
        "damage": 78,
        "lvl" : 80,
        "skill_name" : "举火烧天",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N施出「一臂擎天」，一声大吼，一掌凌空劈出，掌风直逼$n的$l",
        "force" : 180,
        "dodge" : 42,
        "parry" : 23,
        "attack": 64,
        "damage": 89,
        "lvl" : 110,
        "skill_name" : "一臂擎天",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一声长啸，双掌交错击出，一招「石破天惊」，掌风密布$n的前后左右",
        "force" : 190,
        "dodge" : 46,
        "parry" : 33,
        "attack": 54,
        "damage": 93,
        "lvl" : 140,
        "skill_name" : "石破天惊",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N怒吼一声，凌空飞起，一式「天崩地裂」，双掌居高临下，齐齐拍向$n",
        "force" : 200,
        "dodge" : 43,
        "parry" : 43,
        "attack": 55,
        "damage": 103,
        "lvl" : 170,
        "skill_name" : "天崩地裂",
        "damage_type" : "内伤"
]),
([      "action" : "$N仰天大笑，势若疯狂，衣袍飞舞，一招「无法无天」，掌风凌厉，如雨点般向$n",
        "force" : 210,
        "dodge" : 33,
        "parry" : 53,
        "attack": 58,
        "damage": 105,
        "lvl" : 190,
        "skill_name" : "无法无天",
        "damage_type" : "内伤"
])
});
int valid_enable(string usage) { return usage=="strike" || usage=="parry"; }

int valid_learn(object me)
{
        // object weapon; 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练「握石掌」必须空手。\n");
        if (me->query_skill("sanhua-zhang", 1) < 80 && me->query_skill("banruo-zhang", 1) < 80)
                return notify_fail("你得必须先精通散花掌、般若掌中的一种才能继续学习高深的掌法。\n");

        if ((int)me->query_skill("force", 1) < 80)
                return notify_fail("你的基本内功火候不够，还无法研习握石掌。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法修炼握石掌。\n");
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

        level   = (int) me->query_skill("woshi-zhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太差，没法继续练习握石掌。\n");
        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力太差，无法继续练习握石掌。\n");
        me->add("qi", -55);
        me->add("neili", -50);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"woshi-zhang/" + action;
}
