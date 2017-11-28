inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「白虹贯日」，手中$w轻飘飘地向$n的$l刺去！",
        "force"  : 120,
        "dodge"  : 20,
        "parry"  : 14,
        "damage" : 25,
        "lvl"    : 0,
        "skill_name" : "白虹贯日",
        "damage_type": "刺伤"
]),
([      "action" : "$N金刃劈风，$w随著一招「腾蛟起风」由下而上撩往$n的$l",
        "force"  : 140,
        "dodge"  : 20,
        "parry"  : 15,
        "damage" : 20,
        "lvl"    : 20,
        "skill_name" : "腾蛟起风",
        "damage_type": "刺伤"
]),
([      "action" : "$N身形一转，一招「春风杨柳」$w剑光闪烁不定，刺向$n的$l",
        "force"  : 155,
        "dodge"  : 15,
        "parry"  : 16,
        "damage" : 25,
        "lvl"    : 40,
        "skill_name" : "春风杨柳",
        "damage_type": "刺伤"
]),
([      "action" : "$N舞动$w，一招「心驰神遥」迅捷无伦地射向$n的$l",
        "force"  : 167,
        "dodge"  : 15,
        "parry"  : 18,
        "damage" : 35,
        "lvl"    : 60,
        "skill_name" : "心驰神遥",
        "damage_type": "刺伤"
]),
([      "action" : "$N手中$w一晃，一招「青山依旧」往$n的$l斜斜刺出一剑",
        "force"  : 170,
        "dodge"  : 25,
        "parry"  : 21,
        "damage" : 25,
        "lvl"    : 80,
        "skill_name" : "青山依旧",
        "damage_type": "刺伤"
]),
([      "action" : "$N提剑过肩，蓄劲发力，一招「玉龙倒悬」直劈$n$l",
        "force"  : 174,
        "dodge"  : 25,
        "parry"  : 22,
        "damage" : 25,
        "lvl"    : 100,
        "skill_name" : "玉龙倒悬",
        "damage_type": "刺伤"
]),
([      "action" : "$N手中$w向外一分，一招「柳暗花明」反手对准$n$l一剑刺去",
        "force"  : 189,
        "dodge"  : 15,
        "parry"  : 35,
        "damage" : 38,
        "lvl"    : 120,
        "skill_name" : "柳暗花明",
        "damage_type": "刺伤"
]),
([      "action" : "$N移步侧身，使一招「漫山遍野」剑光霍霍完全笼罩$n的$l",
        "force"  : 215,
        "dodge"  : 35,
        "parry" :  45,
        "damage" : 43,
        "lvl"    : 150,
        "skill_name" : "漫山遍野",
        "damage_type": "刺伤"
]),
});


int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("pomopima-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的泼墨披麻剑。\n");

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
        level = (int) me->query_skill("pomopima-jian", 1);
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

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练泼墨披麻剑。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练泼墨披麻剑。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -55);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"pomopima-jian/" + action;
}
