inherit SKILL;

mapping *action = ({
([      "action" : "$N施展出一招「雷风指」，右手拇指直刺$n$l处的要穴所在",
        "force" : 30,
        "dodge" : 10,
        "damage": 5,
        "skill_name" : "雷风指",
        "lvl" : 0,
        "damage_type" : "刺伤"
]),
([      "action" : "$N使一招「山泽指」，左手轻轻一挥，右手刺向$n的檀中大穴",
        "force" : 60,
        "dodge" : 18,
        "damage": 10,
        "skill_name" : "山泽指",
        "lvl" : 20,
        "damage_type" : "刺伤"
]),
([      "action" : "$N双掌翻飞，一招「乾坤指」，暗藏玄机，中指戳向$n的$l",
        "force" : 110,
        "dodge" : 16,
        "damage": 12,
        "skill_name" : "乾坤指",
        "lvl" : 40,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一声大喝，一式「太阴指」，双指齐出，攻向$n的胸口和$l",
        "force" : 150,
        "dodge" : 14,
        "damage": 15,
        "skill_name" : "太阴指",
        "lvl" : 60,
        "damage_type" : "刺伤"
]),
([      "action" : "$N连上数步，一招「少阳指」，左掌劈向$n，右手却暗袭$n的$l",
        "force" : 170,
        "dodge" : 22,
        "damage": 25,
        "skill_name" : "少阳指",
        "lvl" : 80,
        "damage_type" : "刺伤"
]),
([      "action" : "$N双手不住晃动，缓缓逼近$n，一招「少阴指」，笼罩了$n的$l",
        "force" : 190,
        "dodge" : 25,
        "damage": 20,
        "skill_name" : "少阴指",
        "lvl" : 90,
        "damage_type" : "刺伤"
]),
([      "action" : "$N一招「太阳指」，手指不住晃动，不离$n的$l方寸之间",
        "force" : 210,
        "dodge" : 30,
        "damage": 20,
        "skill_name" : "太阳指",
        "lvl" : 100,
        "damage_type" : "刺伤"
])
});

int valid_enable(string usage)
{
        return usage == "finger" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练乾天指法必须空手。\n");

        if ((int)me->query("neili") < 250)
                return notify_fail("你的内力不够，无法学乾天指法。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学乾天指法。\n");

        if ((int)me->query_skill("finger") < 20)
                return notify_fail("你的基本指法太浅，无法学乾天指法。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("qiantian-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的乾天指法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("qiantian-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 5, level / 5)];

}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 20)
                return notify_fail("你的内力不够练习乾天指法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -11);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qiantian-zhi/" + action;
}
