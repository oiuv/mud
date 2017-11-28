inherit SKILL;

mapping *action = ({
([      "action":"$N身形一展，施出一招「横峰断云势」，$w疾风般刺向$n的$l",
        "force" : 30,
        "attack": 15,
        "dodge" : 10,
        "parry" : 12,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "横峰断云势",
        "damage_type" : "刺伤"
]),
([      "action":"$N一声叱喝，$w如灵蛇吞吐，施一招「青龙啸」向$n的$l刺去",
        "force" : 53,
        "attack": 21,
        "dodge" : 12,
        "parry" : 13,
        "damage": 37,
        "lvl"   : 10,
        "skill_name" : "青龙啸",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身一跃而起，$w使出一式「琉璃刃」，三刺连环，射向$n$l",
        "force" : 71,
        "attack": 24,
        "dodge" : 15,
        "parry" : 22,
        "damage": 45,
        "lvl"   : 20,
        "skill_name" : "琉璃刃",
        "damage_type" : "刺伤"
]),
([      "action":"$N$w闪电般一晃，陡然使出一招「虚空无尽势」，飕的刺向$n$l",
        "force" : 98,
        "attack": 35,
        "dodge" : 15,
        "parry" : 13,
        "damage": 54,
        "lvl"   : 40,
        "skill_name" : "虚空无尽势",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身跃起，一式「天地重元势」，$w连环九刺，尽数射向$n而去",
        "force" : 140,
        "attack": 46,
        "dodge" : 11,
        "parry" : 9,
        "damage": 65,
        "lvl"   : 60,
        "skill_name" : "天地重元势",
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage)
{
	return usage == "dagger" || usage == "finger" || usage == "parry";
}

int valid_learn(object me)
{
        int skill;

        skill = me->query_skill("poxu-daxuefa", 1);

        if ((int)me->query("max_neili") < 650)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("dagger", 1) < 50
           && (int)me->query_skill("finger", 1) < 50)
                return notify_fail("你基本短兵和基本指法水平有限，无法学习破"
                                   "虚打穴法。\n");

        if ((int)me->query_skill("dagger", 1) < skill
           && (int)me->query_skill("finger", 1) < skill)
                return notify_fail("你基本短兵或基本指法水平有限，无法领会更"
                                   "高深的破虚打穴法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;

        for(i = sizeof(action) - 1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;

        level = (int) me->query_skill("poxu-daxuefa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (objectp(weapon = me->query_temp("weapon"))
           && (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习破虚打穴法。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练破虚打穴法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练破虚打穴法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"poxu-daxuefa/" + action;
}
