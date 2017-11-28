inherit SKILL;

mapping *action = ({
([      "action": "$N双手一别，尽力前伸，使出一招「中平无敌」，手中$w平平刺向$n",
        "force" : 80,
        "dodge" : 3,
        "damage": 30,
        "attack": 10,
        "parry" : 25,
        "lvl"   : 0,
        "skill_name" : "中平无敌",
        "damage_type": "刺伤"
]),
([      "action": "$N手中$w盘旋回转，屈身下蹲，反手一招「夜叉探海」自下向$n刺去",
        "force" : 100,
        "dodge" : 5,
        "damage": 40,
        "attack": 20,
        "parry" : 25,
        "lvl"   : 40,
        "skill_name" : "夜叉探海",
        "damage_type": "刺伤"
]),
([      "action": "$N高高举起$w，迎空抖出数朵枪花，一招「灵蛇出洞」向$n分心扎去",
        "force" : 110,
        "dodge" : 10,
        "damage": 44,
        "attack": 27,
        "parry" : 21,
        "lvl"   : 80,
        "skill_name" : "灵蛇出洞",
        "damage_type": "刺伤"
]),
([      "action": "$N施出「游龙逆转」，手中$w斜刺消去$n的后招，接着闪电般刺向$n",
        "force" : 120,
        "dodge" : -5,
        "damage": 50,
        "attack": 30,
        "parry" : 35,
        "lvl"   : 120,
        "skill_name" : "游龙逆转",
        "damage_type": "刺伤"
]),
});

int valid_enable(string usage)
{
	return usage == "club" || usage == "parry";
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "club")
                return notify_fail("你必须先找一根棍子才能练中平枪法。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力修为不足，没有办法练中平枪法。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅，没有办法练中平枪法。\n");

        if ((int)me->query_skill("club", 1) < 80)
                return notify_fail("你的棍法根基不足，没有办法练中平枪法。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("zhongping-qiang", 1))
                return notify_fail("你的基本棍法水平不够，无法领会更高深的中平枪法。\n");

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
        level = (int) me->query_skill("zhongping-qiang", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练中平枪法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练中平枪法。\n");

        me->receive_damage("qi", 20);
        me->add("neili", -20);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhongping-qiang/" + action;
}
