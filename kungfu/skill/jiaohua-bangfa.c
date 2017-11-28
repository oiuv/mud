inherit SKILL;

mapping *action = ({
([      "action" : "$N斜里冲前一步，身法诡异，手中$w急速横扫$n的$l",
        "force"  : 220,
        "damage" : 40,
        "dodge"  : 50,
        "damage_type" : "挫伤"
]),
([      "action" : "$N忽然直身飞入半空，又忽的飞身扑下，$w攻向$n的$l",
        "force"  : 210,
        "damage" : 45,
        "dodge"  : 55,
        "damage_type" : "挫伤"
]),
([      "action" : "$N原地一个后滚翻，身体向$n平飞过去，手中$w指向$n的$l",
        "force"  : 210,
        "damage" : 35,
        "dodge"  : 60,
        "damage_type" : "挫伤"
]),
([      "action" : "$N突然一个急转身，$w横扫一圈后挟着猛烈的劲道打向$n而去",
        "force"  : 200,
        "damage" : 45,
        "dodge"  : 65,
        "damage_type" : "挫伤"
]),
([      "action" : "$N向前顺势一滚，接着翻身跳起，手里$w斜向上击向$n的$l",
        "force"  : 220,
        "damage" : 30,
        "dodge"  : 55,
        "damage_type" : "挫伤"
])
});

int valid_enable(string usage)
{
        return usage == "staff" || usage == "parry" ;
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力修为太弱，无法练叫花棒法。\n");

        if ((int)me->query_dex() < 24)
                return notify_fail("你的身法不够灵活，无法练叫花棒法。\n");

        if ((int)me->query_skill("staff", 1) < (int)me->query_skill("jiaohua-bangfa", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的叫花棒法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练叫花棒法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -38);
        return 1;
}

