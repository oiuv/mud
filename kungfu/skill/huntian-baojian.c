#include <ansi.h>

inherit FORCE;

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("huntian-baojian", 1);
        return lvl * lvl * 15 * 50 / 100 / 200;
}

mapping *action = ({
([  "action" : "$N施出一招" HIB "靛沧海" NOR "之「" HIB "浪涛势" NOR "」，一"
               "拳猛然攻出，气势恢弘，气流澎湃，直打$n的$l",
    "dodge"  : 137,
    "attack" : 161,
    "parry"  : 114,
    "force"  : 481,
    "damage" : 131,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N错步上前，一招" HIB "靛沧海" NOR "之「" HIB "深渊势" NOR
               "」，双掌猛然卷一股滔天寒流，席卷$n全身",
    "dodge"  : 138,
    "attack" : 180,
    "parry"  : 121,
    "force"  : 485,
    "damage" : 137,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N陡然使出" HIB "靛沧海" NOR "「" HIB "鲸吞势" NOR "」，双掌"
               "上下交错，缤纷贯出，铺天掌影顿时笼罩$n",
    "dodge"  : 121,
    "attack" : 193,
    "parry"  : 113,
    "force"  : 451,
    "damage" : 241,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N一声巨喝，贯出" HIB "靛沧海" NOR "心法之「" HIB "滔天势" NOR
               "」，双掌掀起翻天巨浪，一股凛冽寒流从九天而降，笼罩$n",
    "dodge"  : 121,
    "attack" : 193,
    "parry"  : 113,
    "force"  : 451,
    "damage" : 241,
    "weapon" : HIB "靛沧海气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N施展" HIR "血穹苍" NOR "心法之「" HIR "血雾迷踪" NOR "」，"
               "顿时浮现出一层血气，身法变换无定，全身化作一道血光攻向$n",
    "dodge"  : 241,
    "attack" : 221,
    "parry"  : 209,
    "force"  : 261,
    "damage" : 233,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N陡然使出" HIR "血穹苍" NOR "之「" HIR "苍穹无崖" NOR "」，双掌"
               "高举过顶，一声闷喝，千万掌锋澎湃涌出，铺天盖地席卷$n",
    "dodge"  : 261,
    "attack" : 103,
    "parry"  : 241,
    "force"  : 373,
    "damage" : 391,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "割伤"
]),
([  "action" : "$N施出一招" HIR "血穹苍" NOR "之「" HIR "血阳撕天" NOR "」，凌空"
               "飞跃，双爪携着天穹之劲幻出两道血光袭出，直攻$n$l",
    "dodge"  : 272,
    "attack" : 239,
    "parry"  : 254,
    "force"  : 424,
    "damage" : 353,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "刺伤"
]),
([  "action" : "$N站立不动，一声暴喝，施出" HIR "血穹苍" NOR "之「" HIR "苍穹无悔"
               NOR "」，顿时滔天血浪至九天而降，血气顿时笼罩$n的四面八方",
    "dodge"  : 267,
    "attack" : 298,
    "parry"  : 254,
    "force"  : 484,
    "damage" : 339,
    "weapon" : HIR "血穹苍气劲" NOR,
    "damage_type": "刺伤"
]),
([  "action" : "$N施展" HIY "金晨曦" NOR "心法之「" HIY "金乌融雪" NOR "」，"
               "一拳击到$n面门，陡然便爪，幻出一道金光射向$n$l",
    "dodge"  : 329,
    "attack" : 251,
    "parry"  : 304,
    "force"  : 884,
    "damage" : 358,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "刺伤"
]),
([  "action" : "$N陡然使出" HIY "金晨曦" NOR "之「" HIY "十阳归一" NOR "」，双掌"
               "连环使出，铺天盖地的攻向$n",
    "dodge"  : 321,
    "attack" : 393,
    "parry"  : 513,
    "force"  : 703,
    "damage" : 461,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "刺伤"
]),
([  "action" : "$N施出一招" HIY "金晨曦" NOR "之「" HIY "金阳破岭" NOR "」，双手"
               "作锥，携带着无比凌厉的内劲猛然贯出，直钻$n的$l",
    "dodge"  : 312,
    "attack" : 398,
    "parry"  : 454,
    "force"  : 884,
    "damage" : 433,
    "weapon" : HIY "金晨曦气劲" NOR,
    "damage_type": "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage == "force" || usage == "unarmed" || usage == "parry";
}

int valid_force(string force) { return 1; }

int double_attack() { return 1; }

mapping query_action(object me)
{
        return action[random(sizeof(action))];
}

int valid_learn(object me)
{
        return notify_fail("%……—（%￥·！·！·*#—\n");
}

int practice_skill(object me)
{
        return notify_fail("%……—（%￥·！·！·*#—\n");
}

int difficult_level()
{
        return 9000;
}

string perform_action_file(string action)
{
        return __DIR__"huntian-baojian/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"huntian-baojian/exert/" + action;
}
