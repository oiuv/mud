inherit SKILL;

mapping *action = ({
([      "action": "$N向前斜跨一步，一招「剑气封喉」，手中$w直刺$n的喉部",
        "force" : 126,
        "parry" : 3,
        "dodge" : 5,
        "damage": 21,
        "lvl"   : 0,
        "skill_name" : "剑气封喉",
        "damage_type":  "刺伤"
]),
([      "action": "$N错步上前，一招「明月千里」，剑意若有若无，$w淡淡地向$n的$l挥去",
        "force" : 149,
        "parry" : 13,
        "dodge" : 10,
        "damage": 25,
        "lvl"   : 30,
        "skill_name" : "明月千里",
        "damage_type":  "割伤"
]),
([      "action": "$N一式「怀中抱月」，纵身飘开数尺，运发剑气，手中$w遥摇指向$n的$l",
        "force" : 167,
        "parry" : 12,
        "dodge" : 15,
        "damage": 31,
        "lvl"   : 50,
        "skill_name" : "怀中抱月",
        "damage_type":  "刺伤"
]),
([      "action": "$N纵身轻轻跃起，一式「大风起兮」，剑光如水，一泻千里，洒向$n全身",
        "force" : 187,
        "parry" : 23,
        "dodge" : 19,
        "damage": 45,
        "lvl"   : 70,
        "skill_name" : "大风起兮",
        "damage_type":  "割伤"
]),
([      "action":"$N错步上前，一招「明月千里」，剑意若有若无，$w淡淡地向$n的$l挥去",
        "force" : 197,
        "parry" : 31,
        "dodge" : 27,
        "damage": 56,
        "lvl"   : 90,
        "skill_name" : "明月千里",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w中宫直进，一式「定天一针」，无声无息地对准$n的$l刺出一剑",
        "force" : 218,
        "parry" : 49,
        "dodge" : 35,
        "damage": 63,
        "lvl"   : 110,
        "skill_name" : "定天一针",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w一沉，一式「星归月向」，无声无息地滑向$n的$l",
        "force" : 239,
        "parry" : 52,
        "dodge" : 45,
        "damage": 72,
        "lvl"   : 130,
        "skill_name" : "星归月向",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w斜指苍天，剑芒吞吐，一式「映月无声」，对准$n的$l斜斜击出",
        "force" : 257,
        "parry" : 55,
        "dodge" : 51,
        "damage": 88,
        "lvl"   : 150,
        "skill_name" : "映月无声",
        "damage_type":  "刺伤"
]),
([      "action":"$N左指凌空虚点，右手$w逼出丈许雪亮剑芒，一式「情连航慈」刺向$n的咽喉",
        "force" : 282,
        "parry" : 63,
        "dodge" : 55,
        "damage": 105,
        "lvl"   : 170,
        "skill_name" : "情连航慈",
        "damage_type":  "刺伤"
]),
([      "action":"$N合掌跌坐，一式「影玉徵辉」，$w自怀中跃出，如疾电般射向$n的胸口",
        "force" : 331,
        "parry" : 76,
        "dodge" : 65,
        "damage": 122,
        "lvl"   : 190,
        "skill_name" : "影玉徵辉",
        "damage_type":  "刺伤"
])
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，不能学习流月剑舞。\n");

        if (me->query_skill("sword", 1) < 80)
                return notify_fail("你的基本剑法火候不够，不能学习流月剑舞。\n");

        if (me->query("max_neili") < 1000)
                return notify_fail("你的内力不够，不能学习流月剑舞。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("liuyue-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的流月剑舞。\n");

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
        level = (int) me->query_skill("liuyue-jian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练流月剑舞。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练流月剑舞。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -60);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"liuyue-jian/" + action;
}
