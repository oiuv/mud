inherit SKILL;

mapping *action = ({
([      "action":"$N使一式「春暖花开」，手中$w由左至右横扫向向$n的$l",
        "force" : 60,
        "attack": 5,
        "dodge" : 10,
        "damage": 33,
        "lvl" : 0,
        "damage_type":  "割伤"
]),
([      "action":"$N踏上一步，「夏日炎炎」，手中$w盘旋飞舞出一道剑光刺向$n的$l",
        "force" : 120,
        "attack": 15,
        "dodge" : 20,
        "damage": 51,
        "lvl" : 40,
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w一抖，一招「秋风萧瑟」，斜斜一剑反腕撩出，攻向$n的$l",
        "force" : 150,
        "attack": 64,
        "dodge" : 25,
        "damage": 85,
        "lvl" : 80,
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w连绕数个大圈，一式「冬掣寒星」，一道剑光飞向$n的$l",
        "force" : 180,
        "attack": 95,
        "dodge" : 30,
        "damage": 125,
        "lvl" : 120,
        "damage_type":  "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不到，无法学习四季剑法。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不到，无法学习四季剑法。\n");

        if (me->query("neili") < 200)
                return notify_fail("你的内力太差，无法学习四季剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("siji-jianfa", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的四季剑法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("siji-jianfa",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 150)
                return notify_fail("你的体力不够练四季剑法。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够练四季剑法。\n");

        me->receive_damage("qi", 125);
        me->add("neili", -125);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"siji-jianfa/" + action;
}

