inherit SKILL;

mapping *action = ({
([      "action": "$N斜举$w, 一招「秦王鞭石」，斜肩铲背砸向$n的$l",
        "force" : 80,
        "attack": 24,
        "dodge" : -5,
        "parry" : 20,
        "damage": 35,
        "lvl"   : 0,
        "damage_type":"挫伤"
]),
([      "action": "$N一声大喝，使出一招「鲁达拔柳」, 手中$w自下而上扫向$n的$l",
        "force" : 100,
        "attack": 30,
        "dodge" : -10,
        "parry" : 25,
        "damage": 40,
        "lvl"   : 30,
        "damage_type":"挫伤"
]),
([      "action": "$N使出一招「霸王扛鼎」，将$w从肩头甩出砸向往$n的$l",
        "force" : 120,
        "attack": 35,
        "dodge" : -5,
        "parry" : 24,
        "damage": 50,
        "lvl"   : 70,
        "damage_type":"挫伤"
]),
([      "action": "$N身子一晃，一招「八仙醉打」，手中$w如狂风暴雨般向$n打出",
        "force" : 160,
        "attack": 50,
        "dodge" : -5,
        "parry" : 45,
        "damage": 60,
        "lvl"   : 100,
        "damage_type":"挫伤"
]),
([      "action": "$N一声咆哮，一招「长虹经天」, $w从手中掷出，飞向$n的$l",
        "force" : 180,
        "attack": 61,
        "dodge" : -5,
        "parry" : 50,
        "damage": 75,
        "lvl"   : 120,
        "damage_type":"挫伤"
]),
([      "action": "$N一招「飞龙一现」, 将手中$w舞成千百根相似，根根砸向$n全身各处要害",
        "force" : 220,
        "attack": 70,
        "dodge" : -5,
        "parry" : 60,
        "damage": 90,
        "lvl"   : 150, 
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

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力修为不足，难以修炼飞龙杖法。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功修为不够，难以修炼飞龙杖法。\n");

        if ((int)me->query_skill("staff", 1) < 40)
                return notify_fail("你的基本杖法火候太浅，难以修炼飞龙杖法。\n");

        if ((int)me->query_skill("staff", 1) < (int)(int)me->query_skill("feilong-zhang", 1))
                return notify_fail("你的基本杖法水平有限，无法领会更高深的飞龙杖法。\n");

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
        level = (int) me->query_skill("feilong-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练飞龙杖法。\n");

        if ((int)me->query("neili") < 75)
                return notify_fail("你的内力不够练飞龙杖法。\n");

        me->receive_damage("qi", 70);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"feilong-zhang/" + action;
}

