inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w横推，一招「推波助澜」，由上至下向$nl砍去",
        "skill_name" : "推波助澜",
        "force"  : 120,
        "attack" : 35,
        "dodge"  : 30,
        "parry"  : 12,
        "lvl"    : 0,
        "damage" : 40,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「沙鸥掠波」，刀锋自下而上划了个半弧，$w一提一收，平刃挥向$n的$l",
        "skill_name" : "沙鸥掠波",
        "force"  : 160,
        "attack" : 42,
        "dodge"  : 40,
        "parry"  : 15,
        "lvl"    : 20,
        "damage" : 50,
        "damage_type" : "割伤",
]),
([      "action" : "$N使出一招「天设牢笼」，将$w舞得如白雾一般，铺天盖地压向$n",
        "skill_name" : "天设牢笼",
        "force"  : 185,
        "attack" : 51,
        "dodge"  : 45,
        "parry"  : 17,
        "lvl"    : 40,
        "damage" : 60,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「闭门铁扇」，左手平平拍出，右手$w缓缓的斜着向$n推去",
        "skill_name" : "闭门铁扇",
        "force"  : 220,
        "attack" : 55,
        "dodge"  : 55,
        "parry"  : 21,
        "lvl"    : 60,
        "damage" : 70,
        "damage_type" : "割伤",
]),
([      "action" : "$N手拖$w，转身跃起，一招「翼德闯帐」，一道白光射向$n的$l",
        "skill_name" : "翼德闯帐",
        "force"  : 255,
        "attack" : 65,
        "dodge"  : 60,
        "parry"  : 32,
        "lvl"    : 80,
        "damage" : 80,
        "damage_type" : "割伤",
]),
([      "action" : "$N挥舞$w，使出一招「白鹤舒翅」，上劈下撩，左挡右开，齐齐罩向$n",
        "skill_name" : "白鹤舒翅",
        "force"  : 290,
        "attack" : 70,
        "dodge"  : 70,
        "parry"  : 35,
        "lvl"    : 120,
        "damage" : 90,
        "damage_type" : "割伤",
]),
([      "action" : "$N一招「春风送暖」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "skill_name" : "春风送暖",
        "force"  : 320,
        "attack" : 80,
        "dodge"  : 85,
        "parry"  : 35,
        "lvl"    : 160,
        "damage" : 100,
        "damage_type" : "割伤",
]),
([      "action" : "$N蓦的使一招「八方藏刀」，顿时剑光中无数朵刀花从四面八方涌向$n$l",
        "skill_name" : "八方藏刀",
        "force"  : 340,
        "attack" : 110,
        "dodge"  : 100,
        "parry"  : 50,
        "lvl"    : 200,
        "damage" : 110,
        "damage_type" : "割伤",
]),
});

string main_skill() { return "daojian-guizhen"; }

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("daojian-guizhen", 1))
                return notify_fail("你已经将苗家剑法和胡家刀法二者合一了。\n");

        if ((int)me->query("max_neili") < 1400)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 120)
                return notify_fail("你的基本刀法火候不够，无法学习胡家刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("hujia-daofa", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的胡家刀法。\n");
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
        level   = (int) me->query_skill("hujia-daofa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if ((int)me->query_skill("daojian-guizhen", 1))
                return notify_fail("你已经将苗家剑法和胡家刀法二者合一了。\n");

        if ( ! objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够，练不了胡家刀法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够，练不了胡家刀法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -80);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hujia-daofa/" + action;
}
