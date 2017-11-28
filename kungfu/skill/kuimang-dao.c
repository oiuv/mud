inherit SKILL;

mapping *action = ({
([      "action": "$N手中$w斜指，一招「蝰蛇翻身」，反身一顿，一刀向$n的$l撩去",
        "force" : 20,
        "dodge" : 10,
        "parry" : 25,
        "damage": 5,
        "lvl"   : 0,
        "skill_name"  : "蝰蛇翻身",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「巨蟒缠身」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 30,
        "dodge" : 30,
        "parry" : 10,
        "damage": 10,
        "lvl"   : 20,
        "skill_name"  : "巨蟒缠身",
        "damage_type" : "割伤"
]),
([      "action": "$N展身虚步，提腰跃落，一招「蛇蜕于野」，刀锋一卷，拦腰斩向$n",
        "force" : 40,
        "dodge" : 35,
        "parry" : 25,
        "damage": 11,
        "lvl"   : 40,
        "skill_name"  : "蛇蜕于野",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「曲蛇吐信」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 60,
        "dodge" : 36,
        "parry" : 25,
        "damage": 17,
        "lvl"   : 60,
        "skill_name"  : "曲蛇吐信",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，一招「蛇鹤相争」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 80,
        "dodge" : 34,
        "parry" : 35,
        "damage": 21,
        "lvl"   : 80,
        "skill_name"  : "蛇鹤相争",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「蝰蟒暴伸」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 90,
        "dodge" : 41,
        "parry" : 38,
        "damage": 27,
        "lvl"   : 100,
        "skill_name"  : "蝰蟒暴伸",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 50)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force") < 10)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("kuimang-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的蝰蟒刀法。\n");

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
        level = (int) me->query_skill("kuimang-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练蝰蟒刀法。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练蝰蟒刀法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -43);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"kuimang-dao/" + action;
}
