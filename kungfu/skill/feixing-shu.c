// feixing-shu.c 飞星术
// modified by Venus Oct.1997

#include <ansi.h>
inherit SKILL;

string *dodge_msg = ({
        "$n左一点右一晃，随即回到原地，轻巧地躲过了$N这一招。\n",
        "$n腾身跃起一个空翻，并顺势闪到一边。\n",
        "$n轻轻往旁边一纵，就已离$N有了相当的距离，$N这一招自然失效。\n",
        "$n揉身而上，轻灵地跃过$N，闪到了$N的背后。\n",
        "$n身形急闪，斜向前一步，竟然已经躲开了$N的这一招。\n",
        "$N眼前一花，却见$n竟然已离自己有数丈之远，却没见$n如何躲过自己的攻击的?n",
        "$N一个不留神，$n已没了踪影。$N急转身，却见$n在那儿向自己招手。\n",
        "$N一招攻出，$n已然不见，$N茫然四顾，却不见$n的影子！\n",
});

int valid_enable(string usage)
{
	return usage == "throwing" ||
               usage == "dodge";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功心法火候不够，无法学飞星术。\n");

        if ((int)me->query_skill("dodge") < 40)
                return notify_fail("你的轻功火候不够，无法学习飞星术。\n");

        if ((int)me->query_skill("poison", 1) < 30)
                return notify_fail("你的毒功火候不够，无法领悟飞星术。\n");

        if ((int)me->query_dex() < 25)
                return notify_fail("你的身法不够灵巧，无法学习飞星术。\n");

        if ((int)me->query_skill("poison", 1) < (int)me->query_skill("feixing-shu", 1))
                return notify_fail("你的毒功水平有限，无法领悟更高深的飞星术。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("feixing-shu", 1))
                return notify_fail("你的基本暗器水平有限，无法领悟更高深的飞星术。\n");

        return 1;
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
//      object weapon;

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练飞星术。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -48);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"feixing-shu/" + action;
}