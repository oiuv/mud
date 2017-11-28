
inherit SKILL;

mapping *action = ({
([      "action":"$N一招「飞鸿展翅」，手中$w猛然点向$n小腹",
        "force" : 120,
        "attack": 24,
        "dodge" : 10,
        "parry" : 20,
        "damage": 45,
        "lvl"   : 0,
        "skill_name" : "飞鸿展翅",
        "damage_type" : "刺伤"
]),
([      "action":"$N不退反进，一招「兰花抚穴式」，手中$w点向$n天池穴",
        "force" : 150,
        "attack": 40,
        "dodge" : 14,
        "parry" : 30,
        "damage": 60,
        "lvl"   : 40,
        "skill_name" : "兰花抚穴式",
        "damage_type" : "刺伤"
]),
([      "action":"$N手中$w猛然旋转，使出「云开日出」，疾点$n的天门穴",
        "force" : 180,
        "attack": 60,
        "dodge" : 25,
        "parry" : 32,
        "damage": 75,
        "lvl"   : 60,
        "skill_name" : "云开日出",
        "damage_type" : "刺伤"
]),
([      "action":"$N手中$w呼呼做响，使出「天旋地转」，$w直打$n的区门穴",
        "force" : 220,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 70,
        "lvl"   : 80,
        "skill_name" : "天旋地转",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身跃起，一式「漫天金光」，手中$w犹如万千光点向$n飞击而去",
        "force" : 260,
        "attack": 70,
        "dodge" : 10,
        "parry" : 45,
        "damage": 80,
        "lvl"   : 100,
        "skill_name" : "漫天金光",
        "damage_type" : "刺伤"
]),
([      "action":"$N招式陡然变慢，一招「金羽飞箭」，手中$w如离弦之箭直袭$w要穴",
        "force" : 300,
        "attack": 100,
        "dodge" : 51,
        "parry" : 50,
        "damage": 110,
        "lvl"   : 120,
        "skill_name" : "金羽飞箭",
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage) { return (usage == "dagger") || (usage == "parry"); }

int valid_learn(object me)
{
        object ob;

        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力修为不够。\n");

        if (! (ob = me->query_temp("weapon"))
        ||  (string)ob->query("skill_type") != "dagger" )
                return notify_fail("你必须先找一把相应的武器才能学习鹤形笔法。\n");

        if ((int)me->query_skill("dagger", 1) < (int)me->query_skill("hexing-bifa", 1))
                return notify_fail("你的基本短兵水平有限，无法领会更高深的鹤形笔法。\n");

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

        level = (int) me->query_skill("hexing-bifa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习鹤形笔法。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练鹤形笔法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练鹤形笔法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -52);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hexing-bifa/" + action;
}
