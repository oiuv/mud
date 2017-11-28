inherit SKILL;

mapping *action = ({
([      "action" : "$N左脚猛地飞起，一式「一步三环」，脚尖踢向$n的$l",
        "force"  : 80,
        "damage" : 20,
        "dodge" : 15,
        "lvl" : 0,
        "damage_type" : "瘀伤",
        "skill_name" : "一步三环"
]),
([      "action" : "$N左脚顿地，右脚一式「三步九转」，猛地踹向$n的$l",
        "force"  : 120,
        "damage" : 25,
        "dodge" : 10,
        "lvl" : 10,
        "damage_type" : "瘀伤",
        "skill_name" : "三步九转"
]),
([      "action" : "$N两臂舒张，右脚横踢，既猛且准，一式「十二连环」踢向$n",
        "force"  : 150,
        "damage" : 30,
        "dodge" : 15,
        "lvl" : 20,
        "damage_type" : "瘀伤",
        "skill_name" : "十二连环"
]),
([      "action" : "$N突然跃起，双足连环圈转，一式「双打奇门」，攻向$n的全身",
        "force"  : 190,
        "damage" : 35,
        "dodge" : 15,
        "lvl" : 40,
        "damage_type" : "瘀伤",
        "skill_name" : "双打奇门"
]),
([      "action" : "$N双脚交叉踢起，一式「环变中盘」，脚脚不离$n的面门左右",
        "force"  : 220,
        "damage" : 40,
        "dodge" : 20,
        "lvl" : 60,
        "damage_type" : "瘀伤",
        "skill_name" : "环变中盘"
]),
([      "action" : "$N一个侧身，右脚自上而下「绳挂一条鞭」，照$n的面门直劈下来",
        "force"  : 260,
        "damage" : 45,
        "dodge" : 35,
        "lvl" : 80,
        "damage_type" : "瘀伤",
        "skill_name" : "绳挂一条鞭"
]),
([      "action" : "$N使一式「十字绕三尖」，双足忽前忽后，迅猛无及踹向$n的胸口",
        "force"  : 300,
        "damage" : 50,
        "dodge" : 30,
        "lvl" : 100,
        "damage_type" : "瘀伤",
        "skill_name" : "十字绕三尖"
]),
([      "action" : "$N开声吐气，大喝一声，一式「犀牛望月转回还」，双脚猛踢$n",
        "force"  : 330,
        "damage" : 60,
        "dodge" : 35,
        "lvl" : 120,
        "damage_type" : "瘀伤",
        "skill_name" : "犀牛望月转回还"
]),
});

int valid_enable(string usage) { return usage == "unarmed" ||  usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("学习十二路潭腿必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学十二路潭腿。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力太弱，无法练十二路潭腿。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("tan-tui", 1))
                return notify_fail("你基本拳脚火候不够，无法领会更高深的十二路潭腿。\n");

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

        level = (int)me->query_skill("tan-tui", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练十二路潭腿。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -51);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tan-tui/" + action;
}
