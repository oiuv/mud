inherit SKILL;

string *dodge_msg = ({
        "$n身子轻轻一摆，一招「乳燕归巢」，躲开了$N的攻击。\n",
        "$n一招「蜻蜓点水」，身形微微一抖，向后跳开了数尺。\n",
        "可是$n一招「平步青云」，双足点地，飘然而起，使$N攻势落空。\n",
        "$n一招「雪燕南归」，身子向后横移开来，躲开了攻击。\n",
        "$n使出一招「燕落长空」，整个身体一个盘旋，绕开了$N攻击。\n",
});

mapping *action = ({
([      "action":"$N一招「乳燕归巢」，手中$w如蜻蜓点水般，招招向$n的$l点去",
        "force" : 120,
        "attack": 25,
        "dodge" : 75,
        "parry" : 82,
        "damage": 10,
        "lvl"   : 0,
        "skill_name" : "乳燕归巢",
        "damage_type":"挫伤"
]),
([      "action":"$N把$w平提胸口，一拧身，一招「蜻蜓点水」，$w猛地撩向$n的$l",
        "force" : 150,
        "attack": 37,
        "dodge" : 73,
        "parry" : 81,
        "damage": 15,
        "lvl"   : 40,
        "skill_name" : "蜻蜓点水",
        "damage_type":"挫伤"
]),
([      "action":"$N一招「雪燕南归」，全身滴溜溜地在地上打个大转，$w向$n的$l间戳去",
        "force" : 180,
        "attack": 42,
        "dodge" : 65,
        "parry" : 87,
        "damage": 20,
        "lvl"   : 80,
        "skill_name" : "雪燕南归",
        "damage_type":"挫伤"
]),
([      "action":"$N伏地一个滚翻，一招「平步青云」，$w挟呼呼风声迅猛扫向$n的足胫",
        "force" : 210,
        "attack": 43,
        "dodge" : 68,
        "parry" : 85,
        "damage": 25,
        "lvl"   : 100,
        "skill_name" : "平步青云",
        "damage_type":"挫伤"
]),
([      "action":"$N一招「燕落长空」，身棍合一，棍端逼成一条直线，流星般向顶向$n的$l",
        "force" : 240,
        "attack": 49,
        "dodge" : 73,
        "parry" : 91,
        "damage": 30,
        "lvl"   : 120,
        "skill_name" : "燕落长空",
        "damage_type":"挫伤"
]),
});

int valid_enable(string usage) { return usage == "club" || usage == "parry" || usage == "dodge"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 250)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("dodge", 1) < (int)me->query_skill("caiyan-gong", 1))
                return notify_fail("你的基本轻功水平有限，无法领会更高深的采燕功。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("caiyan-gong", 1))
                return notify_fail("你的基本棍法水平有限，无法领会更高深的采燕功。\n");

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
        level = (int) me->query_skill("caiyan-gong", 1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练采燕功。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的体力不够练采燕功。\n");

        me->receive_damage("qi", 62);
        me->add("neili", -61);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"caiyan-gong/" + action;
}
