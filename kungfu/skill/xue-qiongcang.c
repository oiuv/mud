// huntian-baojian.c 浑天宝鉴 血穹苍
// modified by Vin 2000

#include <ansi.h>

inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xue-qiongcang", 1);
        return lvl * lvl * 15 * 20 / 100 / 200;
}

int valid_force(string force)
{
        return 1;
}

mapping *action = ({
([  "action" : "$N施展" HIR "血穹苍" NOR "心法之「" HIR "血雾迷踪" NOR "」，"
               "顿时浮现出一层血气，身法变换无定，全身化作一道血光攻向$n",
    "dodge"  : 41,
    "attack" : 21,
    "parry"  : 9,
    "force"  : 261,
    "damage" : 33,
    "lvl"    : 0,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "震伤"
]),
([  "action" : "$N陡然使出" HIR "血穹苍" NOR "之「" HIR "苍穹无崖" NOR "」，双掌"
               "高举过顶，一声闷喝，千万掌锋澎湃涌出，铺天盖地席卷$n",
    "dodge"  : -61,
    "attack" : 103,
    "parry"  : -41,
    "force"  : 373,
    "damage" : 191,
    "lvl"    : 150,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N施出一招" HIR "血穹苍" NOR "之「" HIR "血阳撕天" NOR "」，凌空"
               "飞跃，双爪携着天穹之劲幻出两道血光袭出，直攻$n$l",
    "dodge"  : -72,
    "attack" : 139,
    "parry"  : -54,
    "force"  : 424,
    "damage" : 253,
    "lvl"    : 200,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "刺伤"
]),
([  "action" : "$N站立不动，一声暴喝，施出" HIR "血穹苍" NOR "之「" HIR "苍穹无悔"
               NOR "」，顿时滔天血浪至九天而降，血气顿时笼罩$n的四面八方",
    "dodge"  : -67,
    "attack" : 198,
    "parry"  : -54,
    "force"  : 484,
    "damage" : 239,
    "lvl"    : 200,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "内伤"
]),
});

//string main_skill() { return "huntian-baojian"; }

int valid_enable(string usage) { return usage=="unarmed" ||  usage=="parry" ||  usage=="force"; }  

int valid_learn(object me)
{
        if (me->query_skill("huntian-baojian", 1) > 0)
                return notify_fail("你已经将浑天宝鉴神功合一，不必再单独学习。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("修行" HIR "血穹苍" NOR "心法必须空手。\n");

        if ((int)me->query("con") < 35)
                return notify_fail("你身子骨太弱，无法练习浑天宝鉴神功。\n");

        if ((int)me->query_skill("unarmed", 1) < 240)
                return notify_fail("你的拳脚火候无法学习" HIR "血穹苍" NOR "心法。\n");

        if ((int)me->query_skill("force", 1) < 240)
                return notify_fail("你的内功火候无法学习" HIR "血穹苍" NOR "心法。\n");

        if ((int)me->query("max_neili") < 7000)
                return notify_fail("你的内力修为太差，无法学习" HIR "血穹苍" NOR "心法。\n");

        if ((int)me->query_skill("jin-chenxi", 1) - 10 < (int)me->query_skill("xue-qiongcang", 1))
                return notify_fail("你必须先提高你的" HIY "金晨曦" NOR "心法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
    return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        return notify_fail( HIR "血穹苍" NOR "心法只能通过阅读" HIR "血穹苍" NOR "天晶" NOR "来提高。\n");
}


string perform_action_file(string action)
{
        return __DIR__"xue-qiongcang/perform/" + action;
}
string exert_function_file(string action)
{
        return __DIR__"xue-qiongcang/exert/" + action;
}
