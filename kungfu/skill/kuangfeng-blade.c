//kuangfeng-blade 狂风刀法
// Made by deaner
#include <ansi.h>
inherit SKILL;

mapping *action = ({
([  "action" : "$N手中$w轻挥，一招"+HIW"「风平浪静」"NOR+"，看似平缓实则迅速地向"
               "$n的$l撩去",
    "force" : 60,
    "dodge" : 20,
    "lvl"   : 0,
    "skill_name" : "风平浪静",
    "damage_type" : "割伤"
]),
([  "action" : "$N一招"+HIW"「风起云涌」"NOR+"，右脚一点，$w寒光闪闪，快速涌$n的$l",
    "force"  : 80,
    "dodge"  : 35,
    "damage" : 20,
    "lvl"    : 10,
    "skill_name" : "风起云涌",
    "damage_type" : "割伤"
]),
([  "action" : "$N一招"+HIY"「风卷残云」"NOR+"，手臂一抡，刀锋一卷，自上而下斩向$n",
    "force"  : 100,
    "dodge"  : 35,
    "damage" : 25,
    "lvl"    : 20,
    "skill_name" : "风卷残云",
    "damage_type" : "割伤"
]),
([  "action" : "$N一招"+HIC"「风流云散」"NOR+"，侧身而退，$w却在胸前划出一道圆弧"
               "，横劈$n的$l",
    "force"  : 120,
    "dodge"  : 45,
    "damage" : 35,
    "lvl"    : 30,
    "skill_name" : "风流云散",
    "damage_type" : "割伤"
]),
([  "action" : "$N侧身滑步而上，一招"+HIW"「风声鹤唳」"NOR+"，欺至$n身前，$w猛砍$n的$l",
    "force"  : 140,
    "dodge"  : 50,
    "damage" : 25,
    "lvl"    : 45,
    "skill_name" : "风声鹤唳",
    "damage_type" : "割伤"
]),
([  "action" : "$N快速挥舞$w，使出一招"+RED"「风中残烛」"NOR+"，幻起一片刀花罩向$n的$l",
    "force"  : 150,
    "dodge"  : 65,
    "damage" : 30,
    "lvl"    : 60,
    "skill_name" : "风中残烛",
    "damage_type" : "割伤"
]),
([  "action" : "$N一招"+HIC"「风刀霜剑」"NOR+"，只见漫天刀光闪烁，重重刀影向$n的全身涌去",
    "force"  : 160,
    "dodge"  : 70,
    "damage" : 35,
    "lvl"    : 70,
    "skill_name" : "风刀霜剑",
    "damage_type" : "割伤"
]),
([  "action" : "$N使一招"+HIW"「风驰电掣」"NOR+"，$w舞出阵阵光影向$n的$l涌去",  
    "force"  : 170,
    "dodge"  : 75,
    "damage" : 45,
    "lvl"    : 85,
    "skill_name" : "风驰电掣",
    "damage_type" : "割伤"
]),
([  "action" : "$N一招"+HIB"「风雨飘摇」"NOR+"，$w刀光闪烁不定，似幻似真地逼$n的$l",
    "force"  : 180,
    "dodge"  : 80,
    "damage" : 55,
    "lvl"    : 100,
    "skill_name" : "风雨飘摇",
    "damage_type" : "割伤"
]),
([  "action" : "$N挪步小退，一招"+HIC"「风花雪月」"NOR+"，手中$w轻描淡写地挥出一"
               "刀，随即又“唰唰”连劈出两刀，后发先至，洒向$n的$l",
    "force"  : 190,
    "dodge"  : 100,
    "damage" : 60,
    "lvl"    : 120,
    "skill_name" : "风花雪月",
    "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; } 

int valid_learn(object me)
{
    if ((int)me->query("max_neili") < 250)
        return notify_fail("你的内力不够。\n");

    if ((int)me->query_skill("force") < 80)
        return notify_fail("你的内功心法火候太浅。\n");

    if ((int)me->query_skill("dodge") < 80)
        return notify_fail("你的轻功火候太浅。\n");

    if ((int)me->query_dex() < 25)
        return notify_fail("你的身法还不够灵活。\n");

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
    level   = (int) me->query_skill("kuangfeng-blade",1);
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

    if ((int)me->query("qi") < 50)
        return notify_fail("你的体力不够练狂风刀法。\n");

    if ((int)me->query("neili") < 30)
        return notify_fail("你的内力不够练狂风刀法。\n");

    me->receive_damage("qi", 45);
    me->add("neili", -15);

    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"kuangfeng-blade/" + action;
}
