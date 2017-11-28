// 逍遥剑法
#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「落叶飘飘」，$w似幻作无数道银索，四面八方的罩向$n",
        "force"  : 110,
        "attack" : 35,
        "dodge"  : -20,
        "parry"  : -25,
        "damage" : 43,
        "lvl"    : 0,
        "skill_name" : "落叶飘飘",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「水中浮萍」，剑锋乱指，攻向$n，$n根本不能分辩$w的来路",
        "force"  : 155,
        "attack" : 43,
        "dodge"  : -25,
        "parry"  : -34,
        "damage" : 51,
        "lvl"    : 20,
        "skill_name" : "中浮萍",
        "damage_type" : "刺伤"
]),
([      "action" : "$N使出「飘然直去」，$w幻一条飞练，带着一股寒气划向$n的$l",
        "force"  : 178,
        "attack" : 48,
        "dodge"  : -28,
        "parry"  : -24,
        "damage" : 62,
        "lvl"    : 40,
        "skill_name" : "飘然直去",
        "damage_type" : "刺伤"
]),
([      "action" : "$N身子向上弹起，左手下指，一招「千里不留行」，右手$w带着一团剑花，逼向$n的$l",
        "force"  : 211,
        "attack" : 53,
        "dodge"  : -22,
        "parry"  : -24,
        "damage" : 84,
        "lvl"    : 60,
        "skill_name" : "千里不留行",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「拂衣抹剑」，左脚跃步落地，右手$w幻成一条雪白的瀑布，扫向$n的$l",
        "force"  : 238,
        "attack" : 69,
        "dodge"  : -28,
        "parry"  : -35,
        "damage" : 95,
        "lvl"    : 80,
        "skill_name" : "拂衣抹剑",
        "damage_type" : "刺伤"
]),
([      "action" : "$N右腿半屈般蹲，$w平指，一招「仙人何去」，剑尖无声无色的慢慢的刺向$n的$l",
        "force"  : 268,
        "attack" : 73,
        "dodge"  : -38,
        "parry"  : -15,
        "damage" : 110,
        "lvl"    : 100,
        "skill_name" : "仙人何去",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「梦里看剑」，剑锋乱指，攻向$n，$n根本不能分辩$w的来路",
        "force"  : 255,
        "attack" : 71,
        "dodge"  : -25,
        "parry"  : -24,
        "damage" : 108,
        "lvl"    : 120,
        "skill_name" : "梦里看剑",
        "damage_type" : "刺伤"
]),
([      "action" : "$N使出「深山空谷」，$w幻一条飞练，带着一股寒气划向$n的$l",
        "force"  : 270,
        "attack" : 78,
        "dodge"  : -18,
        "parry"  : -19,
        "damage" : 123,
        "lvl"    : 140,
        "skill_name" : "深山空谷",
        "damage_type" : "刺伤"
]),
([      "action" : "$N身子向上弹起，左手下指，一招「群仙聚会」，右手$w带着一团剑花，逼向$n的$l",
        "force"  : 291,
        "attack" : 103,
        "dodge"  : -23,
        "parry"  : -28,
        "damage" : 141,
        "lvl"    : 160,
        "skill_name" : "群仙聚会",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「飘飘不定」，左脚跃步落地，右手$w幻成一条雪白的瀑布，扫向$n的$l",
        "force"  : 283,
        "attack" : 91,
        "dodge"  : -22,
        "parry"  : -25,
        "damage" : 155,
        "lvl"    : 180,
        "skill_name" : "飘飘不定",
        "damage_type" : "刺伤"
]),
([      "action" : "$N右腿半屈般蹲，$w平指，一招「千山万水」，剑尖无声无色的慢慢的刺向$n的$l",
        "force"  : 300,
        "attack" : 97,
        "dodge"  : -28,
        "parry"  : -37,
        "damage" : 158,
        "lvl"    : 200,
        "skill_name" : "千山万水",
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「去留人间」，$w在$n的周身飞舞，令$n眼花缭乱，剑身在半空中突然停住刺向$n的$l",
        "force"  : 328,
        "attack" : 118,
        "dodge"  : -25,
        "parry"  : -27,
        "damage" : 170,
        "lvl"    : 220,
        "skill_name" : "去留人间",
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) {return usage == "sword" || usage == "parry";}

int valid_learn(object me)
{
        if (me->query("int") < 30)
                return notify_fail("你先天悟性不足，无法领悟逍遥剑法。\n");
 
        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力修为不够，无法学习逍遥剑法。\n");

        if ((int)me->query_skill("force", 1) < 120)
                return notify_fail("你的基本内功火候太浅，无法学习逍遥剑法。\n");

        if ((int)me->query_skill("dodge", 1) < 120)
                return notify_fail("你的基本内功火候太浅，无法学习逍遥剑法。\n");

        if ((int)me->query_skill("sword", 1) < 120)
                return notify_fail("你的基本剑法火候不够，无法学习逍遥剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("xiaoyao-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的逍遥剑法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        object weapon;

        int lvl = me->query_skill("xiaoyao-jian", 1);
        weapon = me->query_temp("weapon");      

        if (lvl < 130 || lvl / 2 + random(lvl) < (int)victim->query_skill("dodge", 1) ||
            me->query("neili") < 150 ||
            me->query_skill("dodge", 1) < 180 ||
            me->query_skill("force", 1) < 150 ||             
            victim->is_busy() )
                 return 0;

        message_vision(HIW "\n$N" HIW "右手" + weapon->name() + HIW "猛然旋转，剑光突"
                       "现，刹那间已将$n" HIW "退路全部封死。\n" NOR, me, victim); 

        me->add("neili", -80);
        victim->start_busy(2 + random(lvl / 30));

        return 1;                         
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("xiaoyao-jian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力目前没有办法练习逍遥剑法。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够，无法练习逍遥剑法。\n");
        
        me->add("qi", -50);
        me->add("neili", -82);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xiaoyao-jian/" + action;
}

