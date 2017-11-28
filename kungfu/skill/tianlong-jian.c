inherit SKILL;

mapping *action = ({
([      "action": "$N向前斜跨一步，一招「鲤跃龙门」，手中$w直刺$n的喉部",
        "force" : 126,
        "parry" : 3,
        "dodge" : 5,
        "damage": 21,
        "lvl"   : 0,
        "skill_name" : "鲤跃龙门",
        "damage_type":  "刺伤"
]),
([      "action": "$N错步上前，一招「神蛟初现」，剑意若有若无，$w淡淡地向$n的$l挥去",
        "force" : 149,
        "parry" : 13,
        "dodge" : 10,
        "damage": 25,
        "lvl"   : 20,
        "skill_name" : "神蛟初现",
        "damage_type":  "割伤"
]),
([      "action": "$N一式「电破长空」，纵身飘开数尺，运发剑气，手中$w遥摇指向$n的$l",
        "force" : 167,
        "parry" : 12,
        "dodge" : 15,
        "damage": 31,
        "lvl"   : 40,
        "skill_name" : "电破长空",
        "damage_type":  "刺伤"
]),
([      "action": "$N纵身轻轻跃起，一式「天龙探爪」，剑光如水，一泻千里，洒向$n全身",
        "force" : 187,
        "parry" : 23,
        "dodge" : 19,
        "damage": 45,
        "lvl"   : 60,
        "skill_name" : "天龙探爪",
        "damage_type":  "割伤"
]),
([      "action":"$N错步上前，一招「飞龙横空」，剑意若有若无，$w淡淡地向$n的$l挥去",
        "force" : 197,
        "parry" : 31,
        "dodge" : 27,
        "damage": 56,
        "lvl"   : 90,
        "skill_name" : "飞龙横空",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w中宫直进，一式「龙翔凤舞」，无声无息地对准$n的$l刺出一剑",
        "force" : 218,
        "parry" : 49,
        "dodge" : 35,
        "damage": 63,
        "lvl"   : 120,
        "skill_name" : "龙翔凤舞",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w一沉，一式「天外游龙」，剑势顿时无声无息地滑向$n$l而去",
        "force" : 239,
        "parry" : 52,
        "dodge" : 45,
        "damage": 72,
        "lvl"   : 150,
        "skill_name" : "天外游龙",
        "damage_type":  "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_skill("force") < 70)
                return notify_fail("你的内功火候不够，不能学习天龙剑法。\n");

        if (me->query_skill("sword", 1) < 40)
                return notify_fail("你的基本剑法火候不够，不能学习天龙剑法。\n");

        if (me->query("max_neili") < 500)
                return notify_fail("你的内力不够，不能学习天龙剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("tianlong-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的天龙剑法。\n");

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
        level = (int) me->query_skill("tianlong-jian",1);
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

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练天龙剑法。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练天龙剑法。\n");

        me->receive_damage("qi", 52);
        me->add("neili", -53);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianlong-jian/" + action;
}
