inherit SKILL;

mapping *action = ({
([      "skill_name" : "三阳开泰" ,
        "action": "$N身形微晃，一招「三阳开泰」，掌起风生，$n只觉得一股暖气袭向$l",
        "force" : 100,
        "dodge" : 10,
        "lvl"   : 0,
        "damage_type" : "内伤",
]),
([      "skill_name" : "五气呈祥" ,
        "action": "$N双手变幻，五指轻弹，一招「五气呈祥」，力分五路，招罩十方，抓向$n的$l",
        "force" : 120,
        "dodge" : 10,
        "lvl"   : 20,
        "damage_type" : "内伤",
]),
([      "skill_name" : "罡风推云" ,
        "action": "$N左手前引，右手倏出，抢在头里，一招「罡风推云」，疾抓向$n的$l",
        "force" : 150,
        "dodge" : 15,
        "lvl"   : 30,
        "damage_type" : "内伤",
]),
([      "skill_name" : "逆流捧沙" ,
        "action": "$N左手圈转，轻拂$n的左手，反向推出，一招「逆流捧沙」，猛地击向$n的下巴",
        "force" : 200,
        "dodge" : 25,
        "lvl"   : 40,
        "damage_type" : "内伤",
]),
([      "skill_name" : "雷洞霹雳" ,
        "action": "$N舌绽春雷，一声娇喝，在$n一愣间，右手一招「雷洞霹雳」，直捣$n的$l",
        "force" : 100,
        "dodge" : 10,
        "lvl"   : 50,
        "damage_type" : "内伤",
]),
([      "skill_name" : "金顶佛光" ,
        "action": "$N双手平举握拳，一招「金顶佛光」施出，掌影重重，难辨虚实，掌风已经袭面",
        "force" : 200,
        "dodge" : 15,
        "lvl"   : 70,
        "damage_type" : "内伤",
]),
([      "skill_name" : "梵心降魔" ,
        "action": "$N一幅宝像庄严，使出「梵心降魔」，掌势如虹，绕着$n漂移不定",
        "force" : 230,
        "parry" : 20,
        "dodge" : 20,
        "lvl"   : 80,
        "damage_type" : "内伤",
]),
([      "skill_name" : "法尊八荒" ,
        "action": "$N双臂疾舞，化为点点掌影，一招「法尊八荒」铺天盖地袭向$n全身各处大穴",
        "force" : 260,
        "parry" : 5,
        "dodge" : 30,
        "lvl"   : 100,
        "damage_type" : "内伤",
]),
});

int valid_enable(string usage) { return usage == "strike" ||  usage == "parry"; }

int valid_combine(string combo) { return combo == "tiangang-zhi" || combo == "jieshou-jiushi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练金顶绵掌必须空手。\n");

        if (me->query_skill("force") < 50)
                return notify_fail("你的内功火候不够，不能练金顶绵掌。\n");

        if (me->query("max_neili") < 150)
                return notify_fail("你的内力太弱，无法练金顶绵掌。\n");

        if (me->query_skill("strike", 1) < me->query_skill("jinding-zhang", 1))
                return notify_fail("你的基本掌法太差，无法领会更高深的金顶绵掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int)me->query_skill("jinding-zhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练习金顶绵掌。\n");

        if (me->query_skill("jinding-zhang", 1) < 100)
                me->receive_damage("qi", 30);
        else
                me->receive_damage("qi", 45);

        me->add("neili", -48);
        return 1;
}
string perform_action_file(string action)
{
        return __DIR__"jinding-zhang/"+ action;
}
