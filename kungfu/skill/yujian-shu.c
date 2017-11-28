#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N剑势忽缓而不疏，剑意有余而不尽，化数剑为一剑，向$n慢慢推去",
        "force" : 20,
        "attack": 65,
        "dodge" : 65,
        "parry" : 60,
        "damage": 25,
        "lvl" : 21,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑意突焕气象森严，便似千军万马奔驰而来，剑势击向$n",
        "force" : 20,
        "attack": 70,
        "dodge" : 60,
        "parry" : 65,
        "damage": 30,
        "lvl" : 28,
        "damage_type" : "刺伤"
]),
([      "action" : "$N满场游走，东刺一剑，西刺一剑，令$n莫明其妙，分不出$N剑法的虚实",
        "force" : 180,
        "attack": 100,
        "dodge" : 70,
        "parry" : 105,
        "damage": 130,
        "lvl" : 105,
        "damage_type" : "刺伤"
]),
([      "action" : "$N抱剑旋身，转到$n身后，杂乱无章地向$n刺出一剑，不知使的是什么剑法",
        "force" : 210,
        "attack": 110,
        "dodge" : 75,
        "parry" : 95,
        "damage": 140,
        "lvl" : 112,
        "damage_type" : "刺伤"
]),
([      "action" : "$N突然一剑点向$n的$l，虽一剑却暗藏无数后着，$n手足无措，不知如何是好",
        "force" : 230,
        "attack": 115,
        "dodge" : 90,
        "parry" : 95,
        "damage": 150,
        "lvl" : 119,
        "damage_type" : "刺伤"
]),
([      "action" : "$N剑挟刀势，大开大阖地乱砍一通，但招招皆击在$n攻势的破绽，迫得$n不得不守",
        "force" : 250,
        "attack": 120,
        "dodge" : 95,
        "parry" : 95,
        "damage": 160,
        "lvl" : 126,
        "damage_type" : "刺伤"
]),
([      "action" : "$N反手横剑刺向$n的$l，这似有招似无招的一剑，威力竟然奇大，$n难以看清剑招来势",
        "force" : 270,
        "attack": 125,
        "dodge" : 85,
        "parry" : 95,
        "damage": 170,
        "lvl" : 133,
        "damage_type" : "刺伤"
]),
([      "action" : "$N举剑狂挥，迅速无比地点向$n的$l，却令人看不出其所用是什么招式",
        "force" : 300,
        "attack": 130,
        "dodge" : 115,
        "parry" : 80,
        "damage": 180,
        "lvl" : 140,
        "damage_type" : "刺伤"
]),
([      "action" : "$N随手一剑指向$n，落点正是$n的破绽所在，端的是神妙无伦，不可思议",
        "force" : 330,
        "attack": 140,
        "dodge" : 95,
        "parry" : 100,
        "damage": 190,
        "lvl" : 147,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage=="sword" || usage=="parry";
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int valid_learn(object me)
{
        object ob;

        if( !(ob = me->query_temp("weapon"))
        ||   (string)ob->query("skill_type") != "sword" )
                return notify_fail("你必须先找一把剑才能练御剑术。\n");

        if (me->query("int") < 35)
                return notify_fail("你的天资不足，无法理解御剑术的剑意。\n");

        if (me->query_skill("sword", 1) < me->query_skill("yujian-shu", 1))
                return notify_fail("你的基本剑法造诣有限，无法理解更高深的御剑术。\n");

        return 1;
}

int practice_skill(object me)
{
        return notify_fail("御剑术无法通过简单的练习来提高。\n");
}

string perform_action_file(string action)
{
        return __DIR__"yujian-shu/" + action;
}

