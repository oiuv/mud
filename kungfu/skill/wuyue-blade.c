// wuyue-blade.c 巫月刀法 (jacki于1997/7/24)
// modified by Venus Oct.1997

inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w轻挥，一招「冬去春来」，身形一转，一刀向$n的$l撩去",
    "force" : 120,
    "dodge" : 10,
    "lvl" : 0,
    "skill_name" : "冬去春来",
    "damage_type" : "割伤"
]),
([      "action" : "$N一招「月上西楼」，左脚虚点，$w一收一推，平刃挥向$n的脸部",
    "force" : 160,
    "dodge" : 10,
    "damage" : 8,
    "lvl" : 10,
    "skill_name" : "月上西楼",
    "damage_type" : "割伤"
]),
([      "action" : "$N虚步侧身，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
    "force" : 200,
    "dodge" : 15,
    "damage" : 20,
    "lvl" : 20,
    "skill_name" : "推窗望月",
    "damage_type" : "割伤"
]),
([      "action" : "$N一招「梦断巫山」，$w自上而下划出一个大弧，笔直劈向$n",    
    "force" : 240,
    "dodge" : 25,
    "damage" : 35,
    "lvl" : 34,
    "skill_name" : "梦断巫山",
    "damage_type" : "割伤"
]),
([      "action" : "$N侧步拧身，一招「似是而非」，拦腰反切，$w砍向$n的胸口",    
    "force" : 270,
    "dodge" : 30,
    "damage" : 50,
    "lvl" : 45,
    "skill_name" : "似是而非",
    "damage_type" : "割伤"
]),
([      "action" : "$N挥舞$w，使出一招「月挂中天」，幻起片片刀影，齐齐罩向$n",
    "force" : 300,
    "dodge" : 35,
    "damage" : 60,
    "lvl" : 59,
    "skill_name" : "月挂中天",
    "damage_type" : "割伤"
]),
([      "action" : "$N一招「日月交辉」，只见漫天刀光闪烁，重重刀影向$n的全身涌去",
    "force" : 330,
    "dodge" : 40,
    "damage" : 90,
    "lvl" : 80,
    "skill_name" : "日月交辉",
    "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; } 

int valid_learn(object me)
{
    if ((int)me->query("max_neili") < 600)
        return notify_fail("你的内力不够。\n");

    if ((int)me->query_skill("force") < 120)
        return notify_fail("你的内功火候太浅。\n");

    if ((int)me->query_skill("blade", 1) < 80)
        return notify_fail("你的基本刀法火候不够。\n");

    if ((int)me->query_skill("blade", 1) < (int)me->query_skill("wuyue-blade", 1))
        return notify_fail("你的刀法水平有限，无法领会更高深的巫月刀法。\n");

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
    level = (int) me->query_skill("wuyue-blade",1);
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
        return notify_fail("你的体力不够练巫月刀法。\n");

    if ((int)me->query("neili") < 70)
        return notify_fail("你的体力不够练巫月刀法。\n");

    me->receive_damage("qi", 25);
    me->add("neili", -61);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"wuyue-blade/" + action;
}
