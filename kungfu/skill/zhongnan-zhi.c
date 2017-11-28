inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「剑指南山」，右手拇指直刺$n的$l",
        "force" : 30,
        "dodge" : 10,
        "damage": 5,
        "skill_name" : "剑指南山",
        "lvl" : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N使一招「天荒地老」，左手轻轻一挥，右手刺向$n的檀中大穴",
        "force" : 60,
        "dodge" : 18,
        "damage": 10,
        "skill_name" : "天荒地老",
        "lvl" : 20,
        "damage_type" : "刺伤"
]),
([      "action" : "$N双掌翻飞，一招「海枯石烂」，暗藏玄机，中指戳向$n的$l",
        "force" : 110,
        "dodge" : 16,
        "damage": 12,
        "skill_name" : "海枯石烂",
        "lvl" : 40,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一声大喝，一式「大江东去」，双指齐出，攻向$n的胸口和$l",
        "force" : 150,
        "dodge" : 14,
        "damage": 15,
        "skill_name" : "大江东去",
        "lvl" : 60,
        "damage_type" : "刺伤"
]),
([      "action" : "$N连上数步，一招「乌雀南飞」，左掌劈向$n，右手却暗袭$n的$l",
        "force" : 170,
        "dodge" : 22,
        "damage": 25,
        "skill_name" : "乌雀南飞",
        "lvl" : 80,
        "damage_type" : "刺伤"
]),
([      "action" : "$N双手不住晃动，缓缓逼近$n，一招「冰冻千里」，笼罩了$n的$l",
        "force" : 190,
        "dodge" : 25,
        "damage": 20,
        "skill_name" : "冰冻千里",
        "lvl" : 90,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「寿比南山」，手指不住晃动，不离$n的$l方寸之间",
        "force" : 210,
        "dodge" : 30,
        "damage": 20,
        "skill_name" : "寿比南山",
        "lvl" : 100,
        "damage_type" : "刺伤"
])
});

int valid_enable(string usage)
{
	return usage == "finger" || usage == "parry";
}

int valid_combine(string combo)
{
        return combo == "chongyang-shenzhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练终南指法必须空手。\n");

        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力修为不够，无法学终南指法。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学终南指法。\n");

        if ((int)me->query_skill("finger") < 20)
                return notify_fail("你的基本指法太浅，无法学终南指法。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("zhongnan-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的终南指法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("zhongnan-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];

}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 20)
                return notify_fail("你的内力不够练习终南指法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -11);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhongnan-zhi/" + action;
}
