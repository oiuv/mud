inherit SKILL;

mapping *action = ({
([      "action": "$N一招「黑龙现身」，$w有如黑龙在$n的周身旋游，勿快勿慢，变化若神",
        "force" : 40,
        "attack": 10,
        "dodge" : 10,
        "parry" : 5,
        "lvl"   : 0,
        "damage": 5,
        "skill_name"  : "黑龙现身",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「万水千山」，左右腿一前一后，$w乱披风势向$n的$l斩去",
        "force" : 90,
        "attack": 20,
        "dodge" : 10,
        "parry" : 8,
        "damage": 5,
        "lvl"   : 10,
        "skill_name"  : "万水千山",
        "damage_type" : "割伤"
]),
([      "action":  "$N纵身跃落，一招「横扫千里」，$w带着疾风呼的一声便向$n横扫过去",
        "force" : 140,
        "attack": 25,
        "dodge" : 5,
        "parry" : 12,
        "damage": 15,
        "lvl"   : 30,
        "skill_name"  : "横扫千里",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「左右开弓」，$w大开大阖，左右并进，左右两刀向$n的两肩砍落",
        "force" : 190,
        "attack": 30,
        "dodge" : 5,
        "parry" : 15,
        "damage": 25,
        "lvl"   : 50,
        "skill_name"  : "左右开弓",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w自上而下，一招「百丈飞瀑」刀光流泻，如瀑布般砍向$n的头部",
        "force" : 240,
        "attack": 35,
        "dodge" : 10,
        "parry" : 25,
        "damage": 30,
        "lvl"   : 80,
        "skill_name"  : "百丈飞瀑",
        "damage_type" : "割伤"
]),
([      "action": "$N使出一招「直摧万马」，上劈下撩，左挡右开，如千军万马般罩向$n",
        "force" : 280,
        "attack": 40,
        "dodge" : 15,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 100,
        "skill_name"  : "直摧万马",
        "damage_type" : "割伤"
]),
([      "action": "$N带得刀风劲疾，一招「怪蟒翻身」，转身连刀带人往$n的$l的劈去",
        "force" : 290,
        "attack": 45,
        "dodge" : 5,
        "parry" : 35,
        "damage": 50,
        "lvl"   : 120,
        "skill_name"  : "怪蟒翻身",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「上步劈山」，$w直直的劈出，一片流光般的刀影向$n的全身罩去",
        "force" : 320,
        "attack": 50,
        "dodge" : 20,
        "parry" : 45,
        "damage": 60,
        "lvl"   : 150,
        "skill_name"  : "上步劈山",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage)
{
        return usage == "blade" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力修为不够，难以修炼铁血刀法。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，难以修炼铁血刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("tiexue-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的铁血刀法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("tiexue-dao", 1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练铁血刀法。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练铁血刀法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -58);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tiexue-dao/" + action;
}
