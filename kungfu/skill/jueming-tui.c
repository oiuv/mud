inherit SKILL;

mapping *action = ({
([      "action" : "$N左脚猛地飞起，一式「盘古开天」，脚尖踢向$n的$l",
        "force"  : 80,
        "damage" : 20,
        "dodge"  : 15,
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "盘古开天"
]),
([      "action" : "$N左脚顿地，右脚一式「流星赶月」，猛踹$n的$l",
        "force"  : 120,
        "damage" : 25,
        "dodge"  : 10,
        "lvl"    : 15,
        "damage_type" : "瘀伤",
        "skill_name"  : "流星赶月"
]),
([      "action" : "$N两臂舒张，右脚横踢，既猛且准，一式「横扫千军」踢向$n",
        "force"  : 150,
        "damage" : 30,
        "dodge"  : 15,
        "lvl"    : 30,
        "damage_type" : "瘀伤",
        "skill_name"  : "横扫千军"
]),
([      "action" : "$N突然跃起，双足连环圈转，一式「百步穿杨」，攻向$n的全身",
        "force"  : 190,
        "damage" : 35,
        "dodge"  : 15,
        "lvl"    : 50,
        "damage_type" : "瘀伤",
        "skill_name"  : "百步穿杨"
]),
([      "action" : "$N双脚交叉踢起，一式「川流不息」，脚脚不离$n的面门左右",
        "force"  : 220,
        "damage" : 40,
        "dodge"  : 20,
        "lvl"    : 70,
        "damage_type" : "瘀伤",
        "skill_name"  : "川流不息"
]),
([      "action" : "$N一个侧身，右脚自上而下「独踹华山」，照$n的面门直劈下来",
        "force"  : 260,
        "damage" : 45,
        "dodge"  : 35,
        "lvl"    : 90,
        "damage_type" : "瘀伤",
        "skill_name"  : "独踹华山"
]),
([      "action" : "$N使一式「夸父追日」，双足忽前忽后，迅猛无及踹向$n的胸口",
        "force"  : 300,
        "damage" : 50,
        "dodge"  : 30,
        "lvl"    : 100,
        "damage_type" : "瘀伤",
        "skill_name"  : "夸父追日"
]),
([      "action" : "$N开声吐气，大喝一声，一式「惊天动地」，双脚猛地踢向$n的$l",
        "force"  : 330,
        "damage" : 60,
        "dodge"  : 35,
        "lvl"    : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "惊天动地"
]),
});

int valid_enable(string usage)
{
        return usage == "unarmed" ||  usage == "parry";
} 

int valid_combine(string combo)
{
        return combo == "tongchui-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("学习绝命腿必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学绝命腿。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力太弱，无法练绝命腿。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("jueming-tui", 1))
                return notify_fail("你的基本拳脚火候不够，无法领会更高深的绝命腿法。\n");

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

        level = (int)me->query_skill("jueming-tui", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练绝命腿。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -51);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jueming-tui/" + action;
}
