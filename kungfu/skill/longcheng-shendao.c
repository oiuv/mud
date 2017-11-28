// longcheng-shendao.c 龙城神刀

inherit SKILL;

mapping *action = ({
([      "action": "$N手中$w轻挥，一招「冬去春来」，身形一转，一刀向$n的$l撩去",
        "force" : 120,
        "attack": 25,
        "dodge" : 10,
        "parry" : 40,
        "damage": 30,
        "lvl"   : 0,
        "skill_name" : "冬去春来",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「月上西楼」，左脚虚点，$w一收一推，平刃挥向$n的脸部",
        "force" : 160,
        "attack": 28,
        "dodge" : 12,
        "parry" : 45,
        "damage": 45,
        "lvl"   : 30,
        "skill_name" : "月上西楼",
        "damage_type" : "割伤"
]),
([      "action": "$N虚步侧身，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
        "force" : 200,
        "attack": 31,
        "dodge" : 25,
        "parry" : 49,
        "damage": 65,
        "lvl"   : 60,
        "skill_name" : "推窗望月",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「梦断巫山」，$w自上而下划出一个大弧，笔直劈向$n",    
        "force" : 240,
        "attack": 48,
        "dodge" : 25,
        "parry" : 54,
        "damage": 80,
        "lvl"   : 90,
        "skill_name" : "梦断巫山",
        "damage_type" : "割伤"
]),
([      "action": "$N侧步拧身，一招「似是而非」，拦腰反切，$w砍向$n的胸口",    
        "force" : 270,
        "attack": 60,
        "dodge" : 30,
        "parry" : 72,
        "damage": 90,
        "lvl"   : 120,
        "skill_name" : "似是而非",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「月挂中天」，幻起片片刀影，齐齐罩向$n",
        "force" : 300,
        "attack": 71,
        "dodge" : 35,
        "parry" : 80,
        "damage": 96,
        "lvl"   : 150,
        "skill_name" : "月挂中天",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「日月交辉」，只见漫天刀光闪烁，重重刀影向$n的全身涌去",
        "force" : 330,
        "attack": 80,
        "dodge" : 42,
        "parry" : 94,
        "damage": 105,
        "lvl"   : 180,
        "skill_name" : "日月交辉",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 80)
                return notify_fail("你的基本刀法火候不够。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("longcheng-shendao", 1))
                return notify_fail("你的刀法水平有限，无法领会更高深的龙城神刀。\n");

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
        level = (int) me->query_skill("longcheng-shendao",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练龙城神刀。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练龙城神刀。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -68);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"longcheng-shendao/" + action;
}
