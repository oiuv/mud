inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N一式「穿云势」，剑锋平指，剑势如风，一气呵成横扫$n的腰间",
        "force" : 90,
        "attack": 15,
        "dodge" : -10,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "穿云势",
        "damage_type" : "刺伤"
]),
([      "action": "$N向前跃上一步，左手剑诀，右手$w使出一式「破雾势」直刺$n的$l",
        "force" : 130,
        "attack": 30,
        "dodge" : -10,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "破雾势",
        "damage_type" : "刺伤"
]),
([      "action": "$N拔步挺腰，一式「推山势」，手中$w沉滞无比，缓缓挥剑撞向$n的$l",
        "force" : 170,
        "attack": 40,
        "dodge" : 5,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 60,
        "skill_name" : "推山势",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「搅海势」，$w自左而右划出一个大弧，平平地向$n的$l挥去",
        "force" : 190,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "搅海势",
        "damage_type" : "刺伤"
]),
([      "action": "$N回身拧腰，右手虚抱成圆，一式「开天势」，$w中宫直进，刺向$n的胸口",
        "force" : 240,
        "attack": 60,
        "dodge" : 10,
        "parry" : 45,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "开天势",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「劈地势」，$w从上至下猛劈，剑锋直出，挟爆裂之声骤然斩"
                  "向$n的$l",
        "force" : 260,
        "attack": 65,
        "dodge" : 5,
        "parry" : 50,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "劈地势",
        "damage_type" : "刺伤"
]),
([      "action": "$N运气施出「雷针势」，$w剑尖逼出一道青芒，闪电般破空射向$n的$l",
        "force" : 280,
        "attack": 70,
        "dodge" : 5,
        "parry" : 52,
        "damage": 75,
        "lvl"   : 140,
        "skill_name" : "雷针势",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双腿半屈半蹲，一式「龙吞势」，剑尖划出无数圆圈，狂风骤起，"
                   "笼罩天地",
        "force" : 310,
        "attack": 75,
        "dodge" : 5,
        "parry" : 64,
        "damage": 90,
        "lvl"   : 150,
        "skill_name" : "龙吞势",
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage) { return (usage == "sword") || (usage == "parry"); }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("fumo-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的伏摩剑法。\n");

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

        level = (int) me->query_skill("fumo-jian", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你必须有把剑才能够练习伏摩剑。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练伏魔剑。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练伏魔剑。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fumo-jian/" + action;
}
