inherit SKILL;

mapping *action = ({
([      "action":"$N右手托住杖端，一招「天上地下」，左掌居中一击，令其凭惯性倒向$n的肩头",
        "force" : 65,
        "attack": 12,
        "dodge" : -10,
        "parry" : 5,
        "damage": 35,
        "lvl"   : 0,
        "damage_type":"挫伤"
]),
([      "action":"$N双眼发红，将手中$w舞成千百根相似，根根砸向$n全身各处要害",
        "force" : 89,
        "attack": 20,
        "dodge" : -10,
        "parry" : 8,
        "damage": 44,
        "lvl"   : 30,
        "damage_type":"挫伤"
]),
([      "action":"$N快步跨出，左手平托$w，右掌猛推杖端，顶向$n的胸口",
        "force" : 128,
        "attack": 35,
        "dodge" : -5,
        "parry" : 10,
        "damage": 52,
        "lvl"   : 60,
        "damage_type":"挫伤"
]),
([      "action":"$N大喝一声，手中$w如飞龙般自掌中跃出，直向$n的胸口穿入",
        "force" : 200,
        "attack": 34,
        "dodge" : -5,
        "parry" : 12,
        "damage": 66,
        "lvl"   : 80,
        "damage_type":"挫伤"
]),
([      "action":"$N横持$w，杖端化出无数个圆圈，凝滞沉重，把$n缠在其中",
        "force" : 250,
        "attack": 46,
        "dodge" : -15,
        "parry" : 18,
        "damage": 70,
        "lvl"   : 100,
        "damage_type":"挫伤"
]),
([      "action":"横持$w，一招「海中求月」，杖端化出无数个圆圈，凝滞沉重，把$n缠在其中",
        "force" : 280,
        "attack": 67,
        "dodge" : 5,
        "parry" : 22,
        "damage": 78,
        "lvl"   : 120,
        "damage_type":"挫伤"
]),
([      "action":"$N全身滚倒，$w盘地横飞，突出一招「巨浪滔天」，杖影把$n裹了起来",
        "force" : 320,
        "attack": 89,
        "dodge" : -5,
        "parry" : 28,
        "damage": 100,
        "lvl"   : 140,
        "damage_type":"挫伤"
]),
([      "action":"$N单腿独立，$w舞成千百根相似，根根砸向$n全身各处要害",
        "force" : 360,
        "attack": 102,
        "dodge" : -5,
        "parry" : 35,
        "damage": 120,
        "lvl"   : 160,
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage)
{
        return usage == "staff" || usage == "parry";
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力修为不足，无法学习银瑚杖法。\n");

        if ((int)me->query_skill("force", 1) < 140)
                return notify_fail("你的内功火候太浅，无法学习银瑚杖法。\n");

        if ((int)me->query_skill("staff", 1) < 60)
                return notify_fail("你的基本杖法太浅，无法学习银瑚杖法。\n");

        if ((int)me->query_skill("staff", 1) < (int)me->query_skill("yinhu-zhang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的银瑚杖法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("yinhu-zhang", 1);

        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练银瑚杖法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练银瑚杖法。\n");

        me->receive_damage("qi", 75);
        me->add("neili", -78);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yinhu-zhang/" + action;
}
