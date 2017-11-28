// pixie-sword.c
// modified by Venus Oct.1997
#include <ansi.h>
inherit SKILL;

mapping *action = ({
    ([  "name":    "群邪辟易",
        "action":  "$N使一招「群邪辟易」，手中$w圈起，倏地刺出，银星点点，剑尖直向$n的$l刺去",
        "dodge":   5,
        "damage":  0,
        "damage_type":  "刺伤"
    ]),
    ([  "name":    "钟馗抉目",
        "action":  "$N一招「钟馗抉目」，剑随身转，围着$n身围疾刺，剑光霍霍罩向$n的$l",
        "dodge":   0,
        "damage":  5,
        "damage_type":  "刺伤"
    ]),
    ([  "name":    "花开见佛",
        "action":  "$N舞动$w，一招「花开见佛」挟著无数剑光刺向$n的$l",
        "dodge":   10,
        "damage":  10,
        "damage_type":  "刺伤"
    ]),
    ([  "name":    "流星赶月",
        "action":  "$N手中$w一声清啸，祭出「流星赶月」剑锋闪烁不定，银光飞舞，猛地里一剑挺出，直刺$n$l",
        "dodge":   5,
        "damage":  5,
        "damage_type":  "刺伤"
    ]),
    ([  "name":    "飞燕穿柳",
        "action":  "$N手中$w剑光暴长，一招「飞燕穿柳」往$n$l刺去",
        "dodge":   10,
        "damage":  10,
        "damage_type":  "刺伤"
    ]),
    ([  "name":    "江上弄笛",
        "action":  "$N手中$w化成一道光弧，直指$n$l，一招「江上弄笛」发出虎哮龙吟刺去",
        "dodge":   5,
        "damage":  15,
        "damage_type":  "刺伤"
    ]),
});

int valid_learn(object me)
{
//  object ob;

    if ((int)me->query("max_neili") < 50)
        return notify_fail("你的内力不够，没有办法练辟邪剑法。\n");

    if ((int)me->query_skill("sword", 1) < (int)me->query_skill("pixie-sword", 1))
	return notify_fail("你的基本剑法水平有限，无法领会更高深的辟邪剑法。\n");

    return 1;
}

int valid_enable(string usage)
{
    return usage=="sword" || usage=="parry";
}

mapping query_action(object me, object weapon)
{
    return action[random(sizeof(action))];
}

int practice_skill(object me)
{
    object ob;

    if (! (ob = me->query_temp("weapon")) ||
       (string)ob->query("skill_type") != "sword")
        return notify_fail("你必须先找一把剑才能练剑法。\n");

    if ((int)me->query("qi") < 30)
       return notify_fail("你的体力太低了，没有办法练习辟邪剑法！\n");
        
    if ((int)me->query("neili") < 5)
       return notify_fail("你的内力不够，没有办法练习辟邪剑法！\n");

    me->receive_damage("qi", 25);
    me->add("neili", -2);
    return 1;
}