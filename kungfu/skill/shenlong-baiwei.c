#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N左掌护胸，右掌使一招「神龙摆尾」晃动着击向$n的$l",     
        "dodge"  : 45,
        "parry"  : 45,
        "force"  : 220,
        "damage" : 70,
        "damage_type": "震伤"
]),
});

string main_skill()
{
        return "xianglong-zhang";
}

int valid_enable(string usage)
{
        return usage == "strike";
}

int valid_learn(object me)
{
        if (me->query_skill("xianglong-zhang", 1) > 0)
                return notify_fail("你已经学全十八掌了，不必再单独学习。\n");

        if (me->query("character") == "阴险奸诈")
                return notify_fail("你心中暗想：这武功难练得紧，学它做甚？\n");

        if ((int)me->query("str") < 36)
                return notify_fail("你的先天膂力孱弱，难以修炼降龙十八掌。\n");

        if ((int)me->query("con") < 32)
                return notify_fail("你的先天根骨孱弱，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候不够，难以修炼降龙十八掌。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不足，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("strike", 1) < 180)
                return notify_fail("你的基本掌法火候不够，难以修炼降龙十八掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("shenlong-baiwei", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的降龙十八掌。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        // 因为涉及升袋，使固定NPC黎生施展时威力增强
        if (! userp(me))
                return ([ "action" : WHT "$N" WHT "左掌护胸，右掌猛然使一招「"
                                     HIY "神龙摆尾" NOR + WHT "」上下晃动着击"
                                     "向$n" WHT "的$l" WHT,
                          "attack" : 300,
                          "dodge"  : 300,
                          "parry"  : 300,
                          "damage" : 300,
                          "force"  : 500,
                          "damage_type": "内伤" ]);

        return action[random(sizeof(action))];
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        // 为何如此设定？原因同上
        if (userp(me) || damage_bonus < 150)
                return 0;

        victim->receive_wound("qi", (damage_bonus - 80) / 2, me);

        return random(2) ? HIR "只听$n" HIR "前胸「咔嚓」一声脆响，竟像是"
                           "肋骨断折的声音。\n" NOR:

                           HIR "$n" HIR "一声惨叫，胸前「咔嚓咔嚓」几声脆"
                           "响，口中鲜血狂喷。\n" NOR;
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 120)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练降龙十八掌。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -40);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shenlong-baiwei/" + action;
}
