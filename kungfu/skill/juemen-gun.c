// juemen-gun.c 绝门棍
// Modified by Venus Oct.1997

inherit SKILL;

string *dodge_msg = ({
    "$n右脚轻轻一点跃开躲过了$N的攻击。\n",
    "$n向旁边扑出，顺势一滚，闪到一边。\n",
    "$n斜里冲前一步，身法诡异，$N这一招落到空处。\n",
    "$n忽然直身飞入半空，很久也不见人影，半响后竟闪到了$N的背后。\n",
    "$n突然一个急转身，$N的这一招滑到了一边。\n",
});

mapping *action = ({
([  "action" : "$N斜里冲前一步，身法诡异，手中$w横扫$n的$l",
    "force" : 220,
    "damage": 40,
    "dodge" : 50,
    "damage_type" : "挫伤"
]),
([  "action" : "$N忽然直身飞入半空，很久也不见人影，$n正搜寻间，$N已"
               "飞身扑下，$w攻向$n的$l",
    "force" : 210,
    "damage": 45,
    "dodge" : 55,
    "damage_type" : "挫伤"
]),
([  "action" : "$N原地一个后滚翻，却在落地的一刹那，身体向$n平飞过"
               "去，手中$w指向$n的$l",
    "force" : 210,
    "damage": 35,
    "dodge" : 60,
    "damage_type" : "挫伤"
]),
([  "action" : "$N突然一个急转身，$w横扫一圈后挟着猛烈的劲道打向$n的$l",    
    "force" : 200,
    "damage": 45,
    "dodge" : 65,
    "damage_type" : "挫伤"
]),
([  "action" : "$N向前扑出，顺势一滚，接着翻身跳起，手里$w斜向上击向$n的$l",
    "force" : 220,
    "damage": 30,
    "dodge" : 55,
    "damage_type" : "挫伤"
])
});

int valid_enable(string usage)
{
        return usage=="staff" ||
               usage=="parry" ||
               usage=="dodge";
}

int valid_learn(object me)
{
    if ((int)me->query("max_neili") < 200)
        return notify_fail("你的内力太弱，无法练绝门棍。\n");

    if ((int)me->query_dex() < 23)
        return notify_fail("你的身法不够灵活，无法练绝门棍。\n");

    return 1;
}

mapping query_action(object me, object weapon)
{
    return action[random(sizeof(action))];
}

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 60)
        return notify_fail("你的体力太低了。\n");

    if ((int)me->query("neili") < 50)
        return notify_fail("你的内力不够练绝门棍。\n");

    me->receive_damage("qi", 45);
    me->add("neili", -38);
    return 1;
}
