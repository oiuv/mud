inherit SKILL;

mapping *action = ({
([      "action": "$N高高举起$w，施一招「天神降世」，狠狠的向$n的$l砸去",
        "force" : 110,
        "attack": 2,
        "dodge" : -5,
        "parry" : -7,
        "lvl"   : 0,
        "damage": 30,
        "skill_name" : "天神降世",
        "damage_type": "挫伤",
]),
([      "action": "$N拔地而起，半空中一个筋斗，手中$w一式「崩山」扫向$n",
        "force" : 130,
        "attack": 5,
        "dodge" : -11,
        "parry" : -5,
        "lvl"   : 40,
        "damage": 40,
        "skill_name" : "崩山",
        "damage_type": "挫伤",
]),
([      "action": "$N手中$w舞动，一招「力撼九天」挟着震天撞击之声，猛砸$n",
        "force" : 150,
        "attack": 8,
        "dodge" : -6,
        "parry" : -5,
        "lvl"   : 80,
        "damage": 45,
        "skill_name" : "力撼九天",
        "damage_type": "挫伤",
]),
([      "action": "$N施一招「佛嗔」，手中$w呼呼有声，连续砸向$n的各个部位",
        "force" : 160,
        "attack": 15,
        "dodge" : 0,
        "parry" : -3,
        "lvl"   : 100,
        "damage": 50,
        "skill_name" : "佛嗔",
        "damage_type": "挫伤",
]),
([      "action": "$N横过手中$w，使出「轰顶」，手中$w劈空而下，击向$n$l",
        "force" : 220,
        "attack": 22,
        "dodge" : -10,
        "parry" : -5,
        "lvl"   : 120,
        "damage": 75,
        "skill_name" : "轰顶",
        "damage_type": "挫伤",
]),
});

int valid_enable(string usage)
{
	return usage == "hammer" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力修为不够，难以修炼无上大力杵。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候太浅，难以修炼无上大力杵。\n");

        if ((int)me->query_skill("hammer", 1) < 20)
                return notify_fail("你的基本锤法不够，难以修炼无上大力杵。\n");

        if ((int)me->query_skill("hammer", 1) < (int)me->query_skill("dali-chu", 1))
                return notify_fail("你的基本锤法水平有限，无法领会更高深的无上大力杵。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("dali-chu", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) || 
            (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够，练不了无上大力杵。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够，练不了无上大力杵。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
       return __DIR__"dali-chu/" + action;
}
