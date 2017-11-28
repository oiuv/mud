// huntian-baojian.c 浑天宝鉴 金晨曦
// modified by Vin 2000

#include <ansi.h>

inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("jin-chenxi", 1);
        return lvl * lvl * 15 * 20 / 100 / 200;
}

int valid_force(string force)
{
        return 1;
}

mapping *action = ({
([  "action" : "$N施展" HIY "金晨曦" NOR "心法之「" HIY "金乌融雪" NOR "」，"
               "一拳击到$n面门，陡然便爪，幻出一道金光射向$n$l",
    "dodge"  : -29,
    "attack" : 51,
    "parry"  : 4,
    "force"  : 284,
    "damage" : 58,
    "lvl"    : 0,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "抓伤"
]),
([  "action" : "$N陡然使出" HIY "金晨曦" NOR "之「" HIY "十阳归一" NOR "」，双掌"
               "连环使出，铺天盖地的攻向$n",
    "dodge"  : -21,
    "attack" : 93,
    "parry"  : 13,
    "force"  : 303,
    "damage" : 161,
    "lvl"    : 150,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "内伤"
]),
([  "action" : "$N施出一招" HIY "金晨曦" NOR "之「" HIY "金阳破岭" NOR "」，双手"
               "作锥，携带着无比凌厉的内劲猛然贯出，直钻$n的$l",
    "dodge"  : -12,
    "attack" : 98,
    "parry"  : 54,
    "force"  : 384,
    "damage" : 233,
    "lvl"    : 200,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "刺伤"
]),
});

//string main_skill() { return "huntian-baojian"; }

int valid_enable(string usage) { return usage=="unarmed" ||  usage=="parry" ||  usage=="force"; }  

int valid_learn(object me)
{
        if (me->query_skill("huntian-baojian", 1) > 0)
                return notify_fail("你已经将浑天宝鉴神功合一，不必再单独学习。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("修行" HIY "金晨曦" NOR "心法必须空手。\n");

        if ((int)me->query("con") < 35)
                return notify_fail("你身子骨太弱，无法练习浑天宝鉴神功。\n");

        if ((int)me->query_skill("unarmed", 1) < 220)
                return notify_fail("你的拳脚火候无法学习" HIY "金晨曦" NOR "心法。\n");

        if ((int)me->query_skill("force", 1) < 220)
                return notify_fail("你的内功火候无法学习" HIY "金晨曦" NOR "心法。\n");

        if ((int)me->query("max_neili") < 6000)
                return notify_fail("你的内力修为太差，无法学习" HIY "金晨曦" NOR "心法。\n");

        if ((int)me->query_skill("dian-canghai", 1) - 10 < (int)me->query_skill("jin-chenxi", 1))
                return notify_fail("你必须先提高你的" HIB "靛沧海" NOR "心法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
    return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        return notify_fail( HIY "金晨曦" NOR "心法只能通过阅读" HIY "金晨曦天晶" NOR "来提高。\n");
}


string perform_action_file(string action)
{
        return __DIR__"jin-chenxi/perform/" + action;
}
string exert_function_file(string action)
{
        return __DIR__"jin-chenxi/exert/" + action;
}
