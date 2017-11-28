inherit SKILL;

mapping *action = ({
([      "action": "$N使一式「峭壁断云」，手中$w疾挥而下，幻出一道孤光刺向$n的$l",
        "force" : 90,
        "attack": 30,
        "dodge" : 10,
        "parry" : 25,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "峭壁断云",
        "damage_type": "刺伤"
]),
([      "action": "$N错步上前，一招「无声无色」，剑意若有若无，$w淡淡刺向$n的$l",
        "force" : 140,
        "attack": 60,
        "dodge" : 25,
        "parry" : 25,
        "damage": 40,
        "lvl"   : 40,
        "skill_name" : "无声无色",
        "damage_type": "刺伤"
]),
([      "action": "$N一式「西域秋色」，纵身飘开数尺，又猛地错步上前，手中$w疾刺$n的$l",
        "force" : 180,
        "attack": 60,
        "dodge" : 25,
        "parry" : 28,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "西域秋色",
        "damage_type": "刺伤"
]),
([      "action": "$N纵身轻轻跃起，一式「雪融昆仑」，剑光如雨点般的洒向$n",
        "force" : 220,
        "attack": 75,
        "dodge" : 20,
        "parry" : 35,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "雪融昆仑",
        "damage_type": "刺伤"
]),
([      "action": "$N手中$w剑芒吞吐，挥洒而出，一式「大漠驼铃」，对准$n的$l直直刺出",
        "force" : 260,
        "attack": 90,
        "dodge" : 25,
        "parry" : 50,
        "damage": 70,
        "lvl"   : 160,
        "skill_name" : "大漠驼铃",
        "damage_type": "刺伤"
]),
([      "action": "$N大喝一声，$w逼出丈许剑芒刺向$n，正是一式「群山叠影」，欲求与$n同亡",
        "force" : 285,
        "attack": 97,
        "dodge" : 31,
        "parry" : 48,
        "damage": 73,
        "lvl"   : 200,
        "skill_name" : "群山叠影",
        "damage_type": "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不够，无法学习昆仑剑法。\n");

        if ((int)me->query_skill("force", 1) < 60)
                return notify_fail("你的内功火候太浅，无法学习昆仑剑法。\n");

        if ((int)me->query_skill("sword", 1) < 60)
                return notify_fail("你的基本剑法火候太浅，无法学习昆仑剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("kunlun-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的昆仑剑法。\n");

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
        level = (int) me->query_skill("kunlun-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon")) ||        
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 120)
                return notify_fail("你的体力不够练昆仑剑法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练昆仑剑法。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -55);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"kunlun-jian/" + action;
}
