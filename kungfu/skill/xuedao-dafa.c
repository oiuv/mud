// 血刀大法 xuedao-dafa.c
// Editd By Vin On 1/9/2001

#include <ansi.h>
inherit FORCE;

int valid_force(string force)
{
        return force == "longxiang-gong" ||
               force == "xiaowuxiang" ||
               force == "mizong-neigong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xuedao-dafa", 1);
        return lvl * lvl * 15 * 15 / 100 / 200;
}

mapping *action = ({
([      "action" : "$N高举手中$w，使出一招「磨牙吮血」，一刀斜劈$n的$l",
        "force"  : 210,
        "attack" : 20,
        "dodge"  : 30,
        "parry"  : 25,
        "lvl"    : 0,
        "damage" : 100,
        "skill_name"  : "磨牙吮血",
        "damage_type" : "割伤",
]),
([      "action" : "$N就地一滚，使一招「刺血满地」，手中$w卷向$n的大腿",
        "force"  : 240,
        "attack" : 25,
        "dodge"  : 45,
        "parry"  : 35,
        "lvl"    : 140,
        "damage" : 120,
        "skill_name"  : "刺血满地",
        "damage_type" : "割伤",
]),
([      "action" : "$N足尖一点，使出「血海茫茫」，刀锋自上而下直插$n的$l",
        "force"  : 280,
        "attack" : 40,
        "dodge"  : 52,
        "parry"  : 40,
        "lvl"    : 160,
        "damage" : 130,
        "skill_name"  : "血海茫茫",
        "damage_type" : "割伤",
]),
([      "action" : "$N使出一招「呕心沥血」，将$w舞得如白雾一般压向$n",
        "force"  : 320,
        "attack" : 45,
        "dodge"  : 58,
        "parry"  : 42,
        "lvl"    : 180,
        "damage" : 140,
        "skill_name"  : "呕心沥血",
        "damage_type" : "割伤",
]),
([      "action" : "$N低吼一声，使出「血口喷人」，举$w直劈$n的$l",
        "force"  : 340,
        "attack" : 50,
        "dodge"  : 65,
        "parry"  : 45,
        "lvl"    : 200,
        "damage" : 150,
        "skill_name"  : "血口喷人",
        "damage_type" : "割伤",
]),
([      "action" : "$N使出「血迹斑斑」，飞身斜刺，忽然反手一刀横斩$n的腰部",
        "force"  : 360,
        "attack" : 55,
        "dodge"  : 70,
        "parry"  : 60,
        "lvl"    : 220,
        "damage" : 160,
        "skill_name"  : "血迹斑斑",
        "damage_type" : "割伤",
]),
([      "action" : "$N使一式「以血还血」，挥刀直指$n的胸口",
        "force"  : 390,
        "attack" : 60,
        "dodge"  : 80,
        "parry"  : 55,
        "lvl"    : 240,
        "damage" : 170,
        "skill_name"  : "以血还血",
        "damage_type" : "割伤",
]),
([      "action" : "$N刀锋虚点，使出一招「血流满面」，转身举$w横劈$n的面门",
        "force"  : 420,
        "attack" : 70,
        "dodge"  : 90,
        "parry"  : 60,
        "lvl"    : 260,
        "damage" : 185,
        "skill_name"  : "血流漫面",
        "damage_type" : "割伤",
]),
});

int valid_enable(string usage)
{ 
        int lvl;
        lvl = (int)this_player()->query_skill("xuedao-dafa", 1);

        if (lvl >= 120)
                return usage == "force" || usage == "blade" || usage == "parry";
        else
                return usage == "force";
       
}

int valid_learn(object me)
{
        if (me->query("character") == "光明磊落" ||
           me->query("character") == "狡黠多变")
                return notify_fail("你心中暗道：这血刀大法邪气太重，甚过诡异，莫"
                                   "不是专门设来害人的？\n");

        if ((int)me->query("str") < 28)
                return notify_fail("你先天膂力孱弱，无法修炼血刀大法。\n");

        if ((int)me->query("dex") < 26)
                return notify_fail("你先天身法太差，无法修炼血刀大法。\n");

        if ( me->query("gender") == "无性" && me->query("xuedao-dafa", 1) > 29)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的血刀大法。\n");

        if ((int)me->query_skill("force", 1) < 120)
                return notify_fail("你的基本内功火候不足，不能学血刀大法。\n");

        if ((int)me->query("max_neili", 1) < 1600)
                return notify_fail("你的内力修为不足，不能学血刀大法。\n");

        if (me->query_skill("force", 1) < me->query_skill("xuedao-dafa", 1))
                return notify_fail("你的基本内功水平不够，难以锻炼更深厚的血刀大法。\n");

        if (me->query_skill("xuedao-dafa", 1) > 120 &&
           me->query_skill("blade", 1) < me->query_skill("xuedao-dafa", 1))
                return notify_fail("你的基本刀法水平不够，难以锻炼更深厚的血刀大法。\n");

        return ::valid_learn(me);
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("xuedao-dafa", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 50, level)];
}

int practice_skill(object me)
{
        return notify_fail("血刀大法只能用学(learn)的来增加熟练度。\n");
}

int difficult_level()
{
        return 400;
}

string perform_action_file(string action)
{
        return __DIR__"xuedao-dafa/perform/" + action;
}

string exert_function_file(string action)
{
        return __DIR__"xuedao-dafa/exert/" + action;
}
