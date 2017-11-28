inherit SKILL;

mapping *action = ({
([      "action" : "$N双手虚晃，左脚猛地飞起，一式「开山腿」，踢向$n的$l",
        "force" : 80,
        "attack": 10,
        "dodge" : 15,
        "parry" : 15,
        "damage": 10,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "开山腿"
]),
([      "action" : "$N左脚顿地，身形猛转，右脚一式「劈碑腿」，猛踹$n的$l",
        "force" : 100,
        "attack": 20,
        "dodge" : 20,
        "parry" : 20,
        "damage": 15,
        "lvl"   : 30,
        "damage_type" : "瘀伤",
        "skill_name"  : "劈碑腿"
]),
([      "action" : "$N右脚飞一般踹出，既猛且准，一式「碎石腿」，踢向的$n",
        "force" : 140,
        "attack": 30,
        "dodge" : 25,
        "parry" : 25,
        "damage": 18,
        "lvl"   : 60,
        "damage_type" : "瘀伤",
        "skill_name"  : "碎石腿"
]),
([      "action" : "$N双足连环圈转，一式「裂地腿」，足带风尘，攻向$n的全身",
        "force" : 160,
        "attack": 35,
        "dodge" : 30,
        "parry" : 30,
        "damage": 20,
        "lvl"   : 90,
        "damage_type" : "瘀伤",
        "skill_name"  : "裂地腿"
]),
([      "action" : "$N双脚交叉踢起，一式「钻天腿」，脚脚不离$n的面门左右",
        "force" : 180,
        "attack": 35,
        "dodge" : 40,
        "parry" : 40,
        "damage": 25,
        "lvl"   : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "钻天腿"
]),
});

int valid_enable(string usage) { return usage=="unarmed" ||  usage=="parry"; } 

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练破碑腿必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学破碑腿。\n");

        if ((int)me->query_skill("unarmed", 1) < 20)
                return notify_fail("你的基本拳脚火候不够，无法学破碑腿。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("pobei-tui", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的破碑腿。\n");

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
        level = (int)me->query_skill("pobei-tui", 1);
        for(i = sizeof(action); i > 0; i--)
            if(level > action[i-1]["lvl"])
                return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
               return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
               return notify_fail("你的内力不够练破碑腿。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -60);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"pobei-tui/" + action;
}
