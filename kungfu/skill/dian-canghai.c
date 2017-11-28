// huntian-baojian.c 浑天宝鉴 靛沧海
// modified by Vin 2000

#include <ansi.h>

inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("dian-canghai", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_force(string force)
{
        return 1;
}

mapping *action = ({
([  "action" : "$N施出一招" HIB "靛沧海" NOR "之「" HIB "浪涛势" NOR "」，一"
               "拳猛然攻出，气势恢弘，气流澎湃，直打$n的$l",
    "dodge"  : -37,
    "attack" : 61,
    "parry"  : 14,
    "force"  : 381,
    "damage" : 31,
    "lvl"    : 0,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "瘀伤"
]),
([  "action" : "$N错步上前，一招" HIB "靛沧海" NOR "之「" HIB "深渊势" NOR
               "」，双掌猛然卷一股滔天寒流，席卷$n全身",
    "dodge"  : -38,
    "attack" : 80,
    "parry"  : 21,
    "force"  : 485,
    "damage" : 137,
    "lvl"    : 150,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N陡然使出" HIB "靛沧海" NOR "「" HIB "鲸吞势" NOR "」，双掌"
               "上下交错，缤纷贯出，铺天掌影顿时笼罩$n",
    "dodge"  : -21,
    "attack" : 93,
    "parry"  : 13,
    "force"  : 451,
    "damage" : 141,
    "lvl"    : 150,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N一声巨喝，贯出" HIB "靛沧海" NOR "心法之「" HIB "滔天势" NOR
               "」，双掌掀起翻天巨浪，一股凛冽寒流从九天而降，笼罩$n",
    "dodge"  : -21,
    "attack" : 93,
    "parry"  : 13,
    "force"  : 451,
    "damage" : 141,
    "lvl"    : 200,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
});

//string main_skill() { return "huntian-baojian"; }

int valid_enable(string usage) { return usage=="unarmed" ||  usage=="parry" ||  usage=="force"; }  

int valid_learn(object me)
{
        if (me->query_skill("huntian-baojian", 1) > 0)
                return notify_fail("你已经将浑天宝鉴神功合一，不必再单独学习。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("修行" HIB "靛沧海" NOR "心法必须空手。\n");

        if ((int)me->query("con") < 35)
                return notify_fail("你身子骨太弱，无法练习浑天宝鉴神功。\n");

        if ((int)me->query_skill("unarmed", 1) < 200)
                return notify_fail("你的拳脚火候无法学习" HIB "靛沧海" NOR "心法。\n");

        if ((int)me->query_skill("force", 1) < 200)
                return notify_fail("你的内功火候无法学习" HIB "靛沧海" NOR "心法。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力修为太差，无法学习" HIB "靛沧海" NOR "心法。\n");

        if ((int)me->query_skill("xuan-huntun", 1) - 10 < (int)me->query_skill("dian-canghai", 1))
                return notify_fail("你必须先提高你的" WHT "玄馄饨" NOR "心法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
    return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        return notify_fail( HIB "靛沧海" NOR "心法只能通过阅读" HIB "靛沧海天晶" NOR "来提高。\n");
}


string perform_action_file(string action)
{
        return __DIR__"dian-canghai/perform/" + action;
}
string exert_function_file(string action)
{
        return __DIR__"dian-canghai/exert/" + action;
}
