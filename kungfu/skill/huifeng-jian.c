inherit SKILL;

mapping *action = ({
([      "skill_name" : "清风袭月",
        "action": "$N剑尖剑芒暴长，一招「清风袭月」，手中$w自左下大开大阖，一剑\n"
                  "向右上向$n的$l",
        "force" : 125,
        "attack": 23,
        "dodge" : 5,
        "damage": 42,
        "lvl"   : 0,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "飘雪穿云",
        "action": "$N长剑圈转，施一招「飘雪穿云」，手中$w平展下刺，一剑轻轻划过\n"
                  "$n的$l",
        "force" : 172,
        "attack": 31,
        "dodge" : 10,
        "damage": 59,
        "lvl"   : 20,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "千峰竞秀",
        "action": "只见$N长剑轻灵跳动，剑随身长，右手$w猛地使出一式「千峰竞秀」\n"
                  "刺向$n的$l",
        "force" : 185,
        "attack": 39,
        "dodge" : 10,
        "damage": 73,
        "lvl"   : 40,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "万流归宗",
        "action": "$N长剑下指，剑意流转，一招「万流归宗」直取$n的$l",
        "force" : 197,
        "attack": 45,
        "dodge" : 10,
        "damage": 75,
        "lvl"   : 60,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "乌龙搅柱",
        "action": "$N剑芒吞吐，幻若灵蛇，手中$w使出一式「乌龙搅柱」，剑势曼妙\n"
                  "非凡，刺向$n的$l",
        "force" : 212,
        "attack": 44,
        "dodge" : 10,
        "damage": 96,
        "lvl"   : 90,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "大雁啼沙",
        "action": "$N屈腕云剑，剑光如彩碟纷飞，幻出点点星光，右手$w陡然使出那\n"
                  "式「大雁啼沙」跃跃洒洒飘向$n的$l",
        "force" : 230,
        "attack": 47,
        "dodge" : 15,
        "damage": 123,
        "lvl"   : 100,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "进退龙游",
        "action": "$N挥剑分击，剑势自胸前跃出，右手$w一式「进退龙游」，毫无留\n"
                  "恋之势，刺向$n的$l",
        "force" : 250,
        "attack": 51,
        "dodge" : 15,
        "lvl"   : 110,
        "damage": 125,
        "damage_type" : "刺伤"
]),
([      "skill_name" : "天地鹤翔",
        "action": "$N退步，左手剑指划转，腰部一扭，右手$w一记「天地鹤翔」自下\n"
                  "而上刺向$n的$l",
        "force" : 275,
        "attack": 65,
        "dodge" : 25,
        "damage": 130,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候太浅。\n");

        if (me->query_skill("sword", 1) < me->query_skill("huifeng-jian"))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的回风拂柳剑。\n");

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

        level = (int) me->query_skill("huifeng-jian", 1);
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
                return notify_fail("你的体力不够练回风拂柳剑。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练回风拂柳剑。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -58);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"huifeng-jian/" + action;
}
