inherit SKILL;

mapping *action = ({
([      "action": "$N怒目圆睁，使出一招「不动」，手中$w一抖，直刺$n的$l",
        "skill_name" : "不动",
        "force" : 100,
        "dodge" : -10,
        "lvl"   : 0,
        "damage": 30,
        "damage_type" : "刺伤",
]),
([      "action": "$N使出一式「起手出剑」，足下一滑，剑芒闪向$n的$l",
        "skill_name" : "起手出剑",
        "force" : 140,
        "dodge" : 5,
        "lvl"   : 30,
        "damage": 30,
        "damage_type" : "刺伤",
]),
([      "action": "$N使出一招「山崩」，纵身跃入半空，$w如山崩般劈向$n的$l",
        "skill_name" : "山崩",
        "force" : 180,
        "dodge" : -10,
        "lvl"   : 50,
        "damage": 40,
        "damage_type" : "割伤",
]),
([      "action": "$N使出「千旋转」，将$w舞得如纺车一般，忽然一剑刺向$n的$l",
        "skill_name" : "千旋转",
        "force" : 220,
        "dodge" : 10,
        "lvl"   : 70,
        "damage": 48,
        "damage_type" : "刺伤",
]),
([      "action": "$N使出一招「降魔舞」，全身劲气贯于$w中，剑气直指$n的$l",
        "skill_name" : "降魔舞",
        "force" : 250,
        "dodge" : 10,
        "lvl"   : 90,
        "damage": 54,
        "damage_type" : "刺伤",
]),
([      "action": "$N单足独立，使出一式「鹤舞」，一道剑光如白影般向$n的$l扫去",
        "skill_name" : "鹤舞",
        "force" : 280,
        "dodge" : 15,
        "lvl"   : 120,
        "damage": 60,
        "damage_type" : "割伤",
]),
([      "action": "$N使出一招「龙腾」，手中$w便如游龙一般扑向$n的$l",
        "skill_name" : "龙腾",
        "force" : 300,
        "dodge" : 20,
        "lvl"   : 140,
        "damage": 66,
        "damage_type" : "割伤",
]),
([      "action": "$N飞身一跃，居高临下使出「花雨满天」，顿时剑尖如雨刺向$n的$l",
        "skill_name" : "花雨漫天",
        "force" : 320,
        "dodge" : 25,
        "lvl"   : 160,
        "damage": 80,
        "damage_type" : "刺伤",
]),
});


int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 400)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 70)
                return notify_fail("你的内功火候太浅。\n");

        if (me->query_skill("sword", 1) < me->query_skill("mingwang-jian", 1))
                return notify_fail("你的基本剑法火候有限，无法领会更高深的不动明王剑法。\n");

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
        level   = (int) me->query_skill("mingwang-jian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够，练不了不动明王剑。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，练不了不动明王剑。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -58);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"mingwang-jian/" + action;
}
