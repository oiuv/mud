inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「落叶飘飞」，身形斜飞，手中$w轻轻点向$n的$l",
        "force"  : 75,
        "dodge"  : 28,
        "damage" : 12,
        "lvl"    : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N长跃而起，「流云经天」，$w猛然下刺",
        "force"  : 70,
        "dodge"  : 15,
        "damage" : 15,
        "lvl"    : 10,
        "damage_type" : "刺伤"
]),
([      "action" : "$N使出「浪迹天涯」，挥剑直劈，威不可当",
        "force"  : 90,
        "dodge"  : 25,
        "damage" : 20,
        "lvl"    : 20,
        "damage_type" : "内伤"
]),
([      "action" : "$N使「手揽星空」一招自上而下搏击，模拟冰轮横空、清光铺地的光景",
        "force"  : 110,
        "dodge"  : 24,
        "damage" : 27,
        "lvl"    : 30,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w颤动，如鲜花招展来回挥削，只幌得$n眼花撩乱，浑不知从何攻来",
        "force"  : 130,
        "dodge"  : 25,
        "damage" : 32,
        "lvl"    : 45,
        "damage_type" : "内伤"
]),
([      "action" : "$N使出「浪迹天涯」剑柄提起，剑尖下指，有如提壶斟酒，直挥$n的$l",
        "force"  : 150,
        "dodge"  : 32,
        "damage" : 40,
        "lvl"    : 60,
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w由内自外一刺，左手如斟茶壶，使出「抚琴按萧」来",
        "force"  : 170,
        "dodge"  : 42,
        "damage" : 48,
        "lvl"    : 75,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) 
{ 
        return usage == "sword" || usage == "parry"; 
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query_skill("sword", 1) < 15)
                return notify_fail("你的基本剑法水平太低，无法学习玉女剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("suxin-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的玉女剑法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;  
        level = (int) me->query_skill("yunv-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 35)
                return notify_fail("你的体力不够练玉女剑法。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的内力不足以练玉女剑法。\n");

        me->receive_damage("qi", 25);
        me->add("neili", -20);

        return 1;
}
string perform_action_file(string action)
{
        return __DIR__"yunv-jian/" + action;
}
