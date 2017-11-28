// murong-sword 慕容剑法

inherit SKILL;

mapping *action = ({
([  "action" : "$N向前跨上一步，一招「横扫千军」，手中$w自左向右横斩$n的$l",
    "force"  : 120,
    "attack" : 55,
    "dodge"  : 70,
    "damage" : 70,
    "lvl"    : 0,
    "skill_name" : "横扫千军",
    "damage_type" : "刺伤"
]),
([  "action" : "$N左手剑诀，右手一抖，$w剑芒闪耀，一式「千钧一发」直劈$n的$l",
    "force"  : 180,
    "attack" : 69,
    "dodge"  : 85,
    "damage" : 115,
    "lvl"    : 40,
    "skill_name" : "千钧一发",
    "damage_type" : "刺伤"
]),
([  "action" : "$N一招「万马奔腾」，$w闪起无数道寒光，罩住$n的$l",
    "force"  : 210,
    "attack" : 97,
    "dodge"  : 100,
    "damage" : 150,
    "lvl"    : 60,
    "skill_name" : "万马奔腾",
    "damage_type" : "刺伤"
]),
([  "action" : "$N一招「气吞万里」，手中$w似扫似劈，琢磨不定的攻向$n的$l",
    "force"  : 250,
    "attack" : 145,
    "dodge"  : 125,
    "damage" : 170,
    "lvl"    : 80,
    "skill_name" : "气吞万里",
    "damage_type" : "刺伤"
]),
([  "action" : "$N使出「阳关三叠」，$w挽出三个剑花，源源不断划向$n的$l",
    "force"  : 260,
    "attack" : 152,
    "dodge"  : 120,
    "damage" : 180,
    "lvl"    : 110,
    "skill_name" : "阳关三叠",
    "damage_type" : "刺伤"
]),
([  "action" : "$N一招「一夫当关」，右手$w大开大合，自上而下如雷霆万钧般"
	       "直向$n的$l劈了下去",
    "force"  : 280,
    "attack" : 158,
    "dodge"  : 165,
    "damage" : 165,
    "lvl"    : 130,
    "skill_name" : "一夫当关",
    "damage_type" : "刺伤"
]),
([  "action" : "$N一招「沙场点兵」，手中的$w指指戳戳，剑光登时笼罩了$n",
    "force"  : 300,
    "attack" : 163,
    "dodge"  : 170,
    "damage" : 185,
    "lvl"    : 140,
    "skill_name" : "沙场点兵",
    "damage_type" : "刺伤"
]),
([  "action" : "$N身影急动, 一招「逐鹿中原」，手中的$w去势快得异常，疾刺$n的$l",
    "force"  : 330,
    "attack" : 220,
    "dodge"  : 185,
    "damage" : 189,
    "lvl"    : 160,
    "skill_name" : "逐鹿中原",
    "damage_type" : "刺伤"
]),
});


int valid_enable(string usage)
{
        return (usage == "sword") || (usage == "parry");
}

int valid_learn(object me)
{
    if ((int)me->query("max_neili") < 150)
        return notify_fail("你的内力不够。\n");

    return 1;
}

mapping query_action(object me, object weapon)
{
    int i, level;
    level   = (int) me->query_skill("murong-jian",1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    object weapon;

    if (!objectp(weapon = me->query_temp("weapon"))
       || (string)weapon->query("skill_type") != "sword")
        return notify_fail("你使用的武器不对。\n");

    if ((int)me->query("qi") < 50)
        return notify_fail("你的体力不够练慕容剑法。\n");

    if ((int)me->query("neili") < 50)
        return notify_fail("你的内力不够练慕容剑法。\n");

    me->receive_damage("qi", 38);
    me->add("neili", -33);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"murong-jian/" + action;
}
