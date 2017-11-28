inherit SKILL;

mapping *action = ({
([      "action": "$N剑尖剑芒暴长，一招「碧漾剑」，手中$w大开大阖，剑芒直刺$n的$l",
        "force" : 98,
        "attack": 13,
        "dodge" : 2,
        "parry" : 3,
        "damage": 41,
        "lvl"   : 0,
        "skill_name"  : "碧漾剑",
        "damage_type" : "刺伤"
]),
([      "action": "$N剑芒吞吐，单手$w一招「傲寒剑」，剑势曼妙，剑光直逼向$n的$l",
        "force" : 132,
        "attack": 19,
        "dodge" : 3,
        "parry" : 4,
        "damage": 58,
        "lvl"  : 30,
        "skill_name"  : "傲寒剑",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「刺骨剑」，屈腕云剑，剑光如彩碟纷飞，幻出点点星光飘向$n",
        "force" : 163,
        "attack": 23,
        "dodge" : 9,
        "parry" : 10,
        "damage": 77,
        "lvl"   : 60,
        "skill_name"  : "刺骨剑",
        "damage_type" : "刺伤"
]),
([      "action": "$N挥剑分击，剑势自胸前跃出，$w一式「惊神剑」，毫无留恋之势，刺向$n",
        "force" : 190,
        "attack": 31,
        "dodge" : 11,
        "parry" : 13,
        "damage": 85,
        "lvl"   : 100,
        "skill_name"  : "惊神剑",
        "damage_type" : "刺伤"
]),
([      "action": "$N左手剑指划转，腰部一扭，右手$w一记「辟尘剑」自下而上刺向$n的$l",
        "force" : 225,
        "attack": 35,
        "dodge" : 5,
        "parry" : 7,
        "damage": 93,
        "lvl"   : 150,
        "skill_name"  : "辟尘剑",
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不足。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 80)
                return notify_fail("你的基本剑法火候太浅。\n");

        if (me->query_skill("sword", 1) < me->query_skill("pichen-jian"))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的辟尘剑法。\n");

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

        level = (int) me->query_skill("pichen-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                       return action[NewRandom(i, 20, level/5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练辟尘剑法。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练辟尘剑法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -55);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"pichen-jian/" + action;
}
