// dongyang-dao 东洋刀法

inherit SKILL;

mapping *action = ({
([      "action": "$N大喝一声，手中$w直劈下来，带起一阵风",
        "force" : 40,
        "attack": 30,
        "dodge" : 32,
        "parry" : 5,
        "lvl"   : 0,
        "damage": 95,
        "damage_type" : "割伤"
]),
([      "action": "$N突然横切，划向$n的$l",
        "force" : 80,
        "attack": 35,
        "dodge" : 33,
        "parry" : 8,
        "damage": 110,
        "lvl"   : 10,
        "damage_type" : "割伤"
]),
([      "action": "$N手中的$w连续变换几个方向，最后突然直刺$n的$l",
        "force" : 110,
        "attack": 40,
        "dodge" : 37,
        "parry" : 12,
        "damage": 110,
        "lvl"   : 30,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中的$w猛然旋转，舞起一团刀影，直逼$n",
        "force" : 130,
        "attack": 45,
        "dodge" : 45,
        "parry" : 15,
        "damage": 125,
        "lvl"   : 50,
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，双手持刃拦腰反切，砍向$n的$l",
        "force" : 140,
        "attack": 40,
        "dodge" : 47,
        "parry" : 18,
        "damage": 125,
        "lvl"   : 80,
        "damage_type" : "割伤"
]),
([      "action": "$N长啸一声，手中的$w不住的晃动，宛若三把刀劈向$n",
        "force" : 180,
        "attack": 45,
        "dodge" : 55,
        "parry" : 25,
        "damage": 135,
        "lvl"   : 100,
        "damage_type" : "割伤"
]),
([      "action": "$N一转身，把背后全被卖给$n，突然双手一转，$w从$N腰侧刺了出来",
        "force" : 200,
        "attack": 45,
        "dodge" : 55,
        "parry" : 31,
        "damage": 140,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
([      "action": "$N猛然前袭，手中$w化作一道刀芒闪电般的刺向$n",
        "force" : 210,
        "attack": 50,
        "dodge" : 60,
        "parry" : 33,
        "damage": 160,
        "lvl"   : 150,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("dongyang-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的东洋刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("dongyang-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的东洋刀法。\n");

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
        level = (int) me->query_skill("dongyang-dao",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 75)
                return notify_fail("你的体力不够练东洋刀法。\n");

        if ((int)me->query("neili") < 55)
                return notify_fail("你的内力不够练东洋刀法。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -42);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"dongyang-dao/" + action;
}
