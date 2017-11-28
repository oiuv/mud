
inherit SKILL;

mapping *action = ({
([      "action":"$N一招「惊空式」，手中$w疾点向$n的期门穴",
        "force" : 90,
        "attack": 15,
        "dodge" : -10,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "惊空式",
        "damage_type" : "刺伤"
]),
([      "action":"$N吐气开声一招「皓月式」，$w如灵蛇吞吐，向$n白海穴戳去",
        "force" : 110,
        "attack": 30,
        "dodge" : 10,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "皓月式",
        "damage_type" : "刺伤"
]),
([      "action":"$N向前跨上一步，手中$w使出「穿云式」，疾点$n的地仓穴",
        "force" : 130,
        "attack": 40,
        "dodge" : 5,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 60,
        "skill_name" : "穿云式",
        "damage_type" : "刺伤"
]),
([      "action":"$N手中的$w自左而右地一晃，使出「飞雪式」带着呼呼风声横打$n的章门穴",
        "force" : 150,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "飞雪式",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身跃起，一式「金光式」，卷起漫天笔影，$w向$n电射而去",
        "force" : 170,
        "attack": 60,
        "dodge" : 10,
        "parry" : 45,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "金光式",
        "damage_type" : "刺伤"
]),
([      "action":"$N凝气守中，$w逼出尺许雪亮笔锋，挥出「天灵式」，一笔快似一笔地攻向$n",
        "force" : 180,
        "attack": 65,
        "dodge" : 5,
        "parry" : 50,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "天灵式",
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage) { return (usage == "dagger") || (usage == "parry"); }

int valid_learn(object me)
{
        object ob;

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力修为不够。\n");

        if (! (ob = me->query_temp("weapon"))
        ||  (string)ob->query("skill_type") != "dagger" )
                return notify_fail("你必须先找一把相应的武器才能学习惊月笔法。\n");

        if ((int)me->query_skill("dagger", 1) < (int)me->query_skill("jingyue-bifa", 1))
                return notify_fail("你的基本短兵水平有限，无法领会更高深的惊月笔法。\n");

    return 1;
}

string query_skill_name(int level)
{
        int i;

        for(i = sizeof(action) - 1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;

        level = (int) me->query_skill("jingyue-bifa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习惊月笔法。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练惊月笔法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练惊月笔法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -42);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jingyue-bifa/" + action;
}
