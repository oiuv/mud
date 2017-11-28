inherit SKILL;

mapping *action = ({
([      "action":"$N使一式「星辰满天」，手中$w由左至右横扫向向$n的$l",
        "force" : 70,
        "attack": 10,
        "dodge" : 10,
        "damage": 13,
        "lvl" : 0,
        "skill_name" : "星辰满天",
        "damage_type":  "割伤"
]),
([      "action":"$N踏上一步，「七星聚月」，手中$w盘旋飞舞出一道剑光劈向$n的$l",
        "force" : 74,
        "attack": 15,
        "dodge" : 20,
        "damage": 19,
        "lvl" : 10,
        "skill_name" : "七星聚月",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w一抖，一招「偏花七星」，斜斜一剑反腕撩出，攻向$n的$l",
        "force" : 85,
        "attack": 20,
        "dodge" : 25,
        "damage": 21,
        "lvl" : 20,
        "skill_name" : "偏花七星",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w连绕数个大圈，一式「星弛电闪」，一道剑光飞向$n的$l",
        "force" : 118,
        "attack": 25,
        "dodge" : 30,
        "damage": 28,
        "lvl" : 30,
        "skill_name" : "星弛电闪",
        "damage_type":  "刺伤"
]),
([      "action":"$N一式「横移北斗」，左手伸展，右手$w挥向$n的$l",
        "force" : 130,
        "attack": 30,
        "dodge" : 35,
        "damage": 32,
        "lvl" : 40,
        "skill_name" : "横移北斗",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w斜指苍天，一式「七星汇聚」，对准$n的$l斜斜击出",
        "force" : 150,
        "attack": 33,
        "dodge" : 45,
        "damage": 39,
        "lvl" : 50,
        "skill_name" : "七星汇聚",
        "damage_type":  "刺伤"
]),
([      "action":"$N一式「朝拜天罡」，$w飞斩盘旋，如疾电般射向$n的胸口",
        "force" : 193,
        "attack": 40,
        "dodge" : 55,
        "damage": 54,
        "lvl" : 60,
        "skill_name" : "朝拜天罡",
        "damage_type":  "刺伤"
]),
([      "action":"$N使一式「剑转七星」，手中$w合身疾刺$n的胸口，威不可当",
        "force" : 220,
        "attack": 45,
        "dodge" : 55,
        "damage": 63,
        "lvl" : 80,
        "skill_name" : "剑转七星",
        "damage_type":  "刺伤"
])
});

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query("max_neili") < 100)
                return notify_fail("你的内力修为太差，无法学习七星剑法。\n");

        if (me->query_skill("sword", 1) < 10)
                return notify_fail("你的基本剑法修为不够，无法学习七星剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("qixing-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的七星剑法。\n");

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
        level = (int) me->query_skill("qixing-jian",1);
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

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够练七星剑法。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的内力不够练七星剑法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -33);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qixing-jian/" + action;
}
