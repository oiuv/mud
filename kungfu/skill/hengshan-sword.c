// hengshan-sword.c
// Modified by Java Sep.1998
#include <ansi.h>

inherit SKILL;

mapping *action = ({
([
        "skill_name" : "星夜寒光",
        "action": "$N右手$w慢慢指出，突然间在空中一颤，发出嗡嗡之声，跟着便是"
                  "嗡嗡两剑，手中$w剑光暴长，向$n的$l刺去",
        "force" : 80,
        "dodge" : 50,
        "damage": 17,
        "lvl"   : 0,
        "damage_type":  "刺伤"
]),
([      "skill_name" : "云气初现",
        "action": "$N手中$w如鬼如魅，竟然已绕到了$n背后，$n急忙转身，耳边只听"
                  "得嗡嗡两声",
        "force" : 100,
        "dodge" : 70,
        "damage": 22,
        "lvl"   : 10,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "百变千幻",
        "action": "$N手中$w寒光陡闪，手中的$w，猛地反刺，直指$n胸口。这一下"
                  "出招快极，抑且如梦如幻，正是“百变千幻衡山云雾十三式”中的绝招",
        "force" : 110,
        "dodge" : 40,
        "damage": 29,
        "lvl"   : 20,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "泉鸣芙蓉",
        "action": "$N不理会对方攻势来路，手中$w刷的一剑「泉鸣芙蓉」，向$n小"
                  "腹刺去",
        "force" : 130,
        "dodge" : 40,
        "damage": 30,
        "lvl"   : 40,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "鹤翔紫盖",
        "action": "$N不理会对方攻势来路，手中$w刷的一剑「鹤翔紫盖」，向$n额"
                  "头刺去",
        "force" : 150,
        "dodge" : 40,
        "damage": 4,
        "lvl"   : 60,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "石廪书声",
        "action": "$N手中$w倏地刺出，剑势穿插迂回，如梦如幻，正是一招「石廪书声」，"
                  "向$n$l刺去",
        "force" : 160,
        "dodge" : 60,
        "damage": 40,
        "lvl"   : 80,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "天柱云气",
        "action": "$N手中$w倏地刺出，极尽诡奇之能事，动向无定，不可捉摸。正是"
                  "一招「天柱云气」，指向$n$l",
        "force" : 180,
        "dodge" : 60,
        "damage": 45,
        "lvl"   : 100,
        "damage_type":  "刺伤"
]),
([      "skill_name":    "雁回祝融",
        "action": "$N飞身跃起，『雁回祝融』！，$w发出一声龙吟从半空中洒向$n的$l",
        "force" : 210,
        "dodge" : 60,
        "damage": 50,
        "lvl"   : 120,
        "damage_type":  "刺伤"
]),
});

int valid_learn(object me)
{
    object ob;

    if ((int)me->query("max_neili") < 200)
        return notify_fail("你的内力不够，没有办法练衡山剑法。\n");

    if ((int)me->query_skill("force") < 40)
        return notify_fail("你的内功火候不够，没有办法练衡山剑法。\n");

    if( !(ob = me->query_temp("weapon"))
    ||      (string)ob->query("skill_type") != "sword" )
        return notify_fail("你必须先找一把剑才能练剑法。\n");

    return 1;
}

int valid_enable(string usage)
{
    return usage=="sword" || usage=="parry";
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
    level   = (int) me->query_skill("hengshan-sword",1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if( (int)me->query("qi") < 40)
        return notify_fail("你的内力或气不够，没有办法练习衡山剑法。\n");

    if( (int)me->query("neili") < 40)
        return notify_fail("你的内力或气不够，没有办法练习衡山剑法。\n");

    me->receive_damage("qi", 30);
    me->add("neili", -18);
    return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hengshan-sword/" + action;
}
