//jingzhong-bafa 井中八法

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N横立不动，手中$w横推，一招「不攻」，由上至下向$nl慢慢推去",
        "force"  : 232,
        "attack" : 157,
        "dodge"  : 123,
        "parry"  : 221,
        "damage" : 389,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「沙鸥掠波」，刀锋自下而上划了个半弧，$w一提一收，平刃挥向$n的颈部",
        "force"  : 285,
        "attack" : 183,
        "dodge"  : 123,
        "parry"  : 221,
        "damage" : 421,
        "damage_type" : "割伤",
]),
([      "action" : "$N使出一招「天设牢笼」，将$w舞得如白雾一般压向$n",
        "force"  : 297,
        "attack" : 179,
        "dodge"  : 123,
        "parry"  : 221,
        "damage" : 435,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「闭门铁扇」，$w缓缓的斜着向$n推去",
        "force"  : 334,
        "attack" : 191,
        "dodge"  : 123,
        "parry"  : 221,
        "damage" : 451,
        "damage_type" : "割伤",
]),
([      "action" : "$N手拖$w，转身跃起，一招「翼德闯帐」，一道白光射向$n的胸口",
        "force"  : 382,
        "attack" : 207,
        "dodge"  : 121,
        "parry"  : 211,
        "damage" : 479,
        "damage_type" : "割伤",
]),
([      "action" : "$N挥舞$w，使出一招「白鹤舒翅」，上劈下撩，左挡右开，齐齐罩向$n",
        "force"  : 397,
        "attack" : 223,
        "dodge"  : 123,
        "parry"  : 221,
        "damage" : 483,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「春风送暖」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force"  : 421,
        "attack" : 257,
        "dodge"  : 133,
        "parry"  : 213,
        "damage" : 534,
        "damage_type" : "割伤",
]),
([      "action" : "$N蓦的使一招「八方藏刀」，顿时剑光中无数朵刀花从四面八方涌向$n全身",
        "force"  : 423,
        "attack" : 271,
        "dodge"  : 173,
        "parry"  : 221,
        "damage" : 589,
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query("character") != "狡黠多变")
                return notify_fail("你心中暗想：哼，这种刀法没半点章法，练来何用？\n");

        if (me->query("int") < 36)
                return notify_fail("你觉得井中八法过于艰深，难以理解。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 300)
                return notify_fail("你的武学修养没有办法理解井中八法的精神奥义。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力不足，没有办法练井中八法，多练些内力再来吧。\n");

        if ((int)me->query_skill("blade", 1) < 250)
                return notify_fail("你的基本刀法火候太浅，没有办法练井中八法。\n");

        if ((int)me->query_skill("force") < 350)
                return notify_fail("你的内功火候太浅，没有办法练井中八法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("jingzhong-bafa", 1))
                return notify_fail("你的基本刀法水平还不够，无法领会更高深的井中八法。\n");

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
        level   = (int) me->query_skill("jingzhong-bafa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 500)
                return notify_fail("你的体力不够，练不了井中八法。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的内力不够，练不了井中八法。\n");

        me->receive_damage("qi", 300);
        me->add("neili", -300);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jingzhong-bafa/" + action;
}

