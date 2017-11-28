// weituo-gun.c 韦陀棍
// modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action":"$N一招「黄石纳履」，手中$w如蜻蜓点水般，招招向$n的下盘要害点去",
        "force" : 120,
        "attack": 25,
        "dodge" : 5,
        "parry" : 30,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "黄石纳履",
        "damage_type":"挫伤"
]),
([      "action":"$N把$w平提胸口，一拧身，一招「勒马停锋」，$w猛地撩向$n的颈部",
        "force" : 150,
        "attack": 37,
        "dodge" : 5,
        "parry" : 31,
        "damage": 15,
        "lvl"   : 40,
        "skill_name" : "勒马停锋",
        "damage_type":"挫伤"
]),
([      "action":"$N一招「平地龙飞」，全身滴溜溜地在地上打个大转，举棍向$n的胸腹间戳去",
        "force" : 180,
        "attack": 42,
        "dodge" : 5,
        "parry" : 37,
        "damage": 20,
        "lvl"   : 80,
        "skill_name" : "平地龙飞",
        "damage_type":"挫伤"
]),
([      "action":"$N伏地一个滚翻，一招「伏虎听风」，$w挟呼呼风声迅猛扫向$n的足胫",
        "force" : 210,
        "attack": 43,
        "dodge" : 15,
        "parry" : 35,
        "damage": 25,
        "lvl"   : 100,
        "skill_name" : "伏虎听风",
        "damage_type":"挫伤"
]),
([      "action":"$N一招「流星赶月」，身棍合一，棍端逼成一条直线，流星般向顶向$n的$l",
        "force" : 240,
        "attack": 49,
        "dodge" : 20,
        "parry" : 41,
        "damage": 30,
        "lvl"   : 120,
        "skill_name" : "流星赶月",
        "damage_type":"挫伤"
]),
([      "action":"$N双手持棍划了个天地大圈，一招「红霞贯日」，一棍从圆心正中击出，撞向$n的胸口",
        "force" : 270,
        "attack": 58,
        "dodge" : 20,
        "parry" : 45,
        "damage": 35,
        "lvl"   : 140,
        "skill_name" : "红霞贯日",
        "damage_type":"挫伤"
]),
([      "action":"$N一招「投鞭断流」，$w高举，以雷霆万钧之势对准$n的天灵当头劈下",
        "force" : 300,
        "attack": 61,
        "dodge" : 25,
        "parry" : 52,
        "damage": 40,
        "lvl"   : 160,
        "skill_name" : "投鞭断流",
        "damage_type":"挫伤"
]),
([      "action":"$N潜运真力，一招「苍龙归海」，$w顿时长了数丈，矫龙般直射$n的胸口",
        "force" : 320,
        "attack": 63,
        "dodge" : 30,
        "parry" : 55,
        "damage": 50,
        "lvl"   : 180,
        "skill_name" : "苍龙归海",
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage) { return usage == "club" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("weituo-gun", 1))
                return notify_fail("你的基本棍法水平有限，无法领会更高深的韦陀棍法。\n");

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
        level = (int) me->query_skill("weituo-gun", 1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练韦陀棍。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的体力不够练韦陀棍。\n");

        me->receive_damage("qi", 62);
        me->add("neili", -61);
        return 1;
}

string perform_action_file(string action)
{
	return __DIR__"weituo-gun/" + action;
}
