inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N使一式「万事随缘往」，手中$w嗡嗡微振，幻成一条疾光刺向$n的$l",
        "force" : 90,
        "attack": 30,
        "dodge" : 10,
        "parry" : 15,
        "damage": 15,
        "lvl"   : 0,
        "skill_name" : "万事随缘往",
        "damage_type": "刺伤"
]),
([      "action": "$N错步上前，使出「来去若梦行」，剑意若有若无，$w淡淡地向$n的$l挥去",
        "force" : 140,
        "attack": 50,
        "dodge" : 15,
        "parry" : 25,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "来去若梦行",
        "damage_type": "割伤"
]),
([      "action": "$N一式「浮世沧桑远」，纵身飘开数尺，运发剑气，手中$w遥摇指向$n的$l",
        "force" : 160,
        "attack": 60,
        "dodge" : 25,
        "parry" : 28,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "浮世沧桑远",
        "damage_type": "割伤"
]),
([      "action": "$N纵身轻轻跃起，一式「轮回法舟轻」，剑光如轮疾转，霍霍斩向$n的$l",
        "force" : 180,
        "attack": 70,
        "dodge" : 20,
        "parry" : 35,
        "damage": 55,
        "lvl"   : 120,
        "skill_name" : "轮回法舟轻",
        "damage_type": "割伤"
]),
([      "action": "$N手中$w中宫直进，一式「水月通禅寂」，无声无息地对准$n的$l刺出一剑",
        "force" : 220,
        "attack": 80,
        "dodge" : 25,
        "parry" : 42,
        "damage": 60,
        "lvl"   : 130,
        "skill_name" : "水月通禅寂",
        "damage_type": "刺伤"
]),
([      "action": "$N手中$w斜指苍天，剑芒吞吐，一式「鱼龙听梵音」，对准$n的$l斜斜击出",
        "force" : 260,
        "attack": 85,
        "dodge" : 25,
        "parry" : 51,
        "damage": 70,
        "lvl"   : 140,
        "skill_name" : "鱼龙听梵音",
        "damage_type": "刺伤"
]),
([      "action": "$N左指凌空虚点，右手$w逼出丈许雪亮剑芒，一式「千里一苇去」刺向$n的$l",
        "force" : 320,
        "attack": 90,
        "dodge" : 30,
        "parry" : 59,
        "damage": 75,
        "lvl"   : 150,
        "skill_name" : "千里一苇去",
        "damage_type": "刺伤"
]),
([      "action": "$N合掌跌坐，一式「禅心顿自明」，$w自怀中跃出，如疾电般射向$n的胸口",
        "force" : 380,
        "attack": 95,
        "dodge" : 25,
        "parry" : 67,
        "damage": 90,
        "lvl"   : 160,
        "skill_name" : "禅心顿自明",
        "damage_type": "刺伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 300)
                return notify_fail("你的内力不够。\n");

        if (me->query("int") < 30) 
                  return notify_fail("你的先天悟性不足。\n"); 
        if ((int)me->query_skill("force") < 60)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("damo-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的达摩剑法。\n");

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
        level = (int) me->query_skill("damo-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练达摩剑。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练达摩剑。\n");

        me->receive_damage("qi", 62);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"damo-jian/" + action;
}
