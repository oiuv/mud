inherit SKILL;

mapping *action = ({
([      "action":"$N使一式「虚式分金」，手中$w由左至右横扫向向$n的$l",
        "force" : 126,
        "parry" : 3,
        "dodge" : 5,
        "damage": 21,
        "lvl"   : 0,
        "skill_name" : "虚式分金",
        "damage_type":  "割伤"
]),
([      "action":"$N踏上一步，「荆轲刺秦」，手中$w盘旋飞舞出一道金光劈向$n的$l",
        "force" : 149,
        "parry" : 13,
        "dodge" : 10,
        "damage": 25,
        "lvl"   : 30,
        "skill_name" : "荆轲刺秦",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w一抖，一招「九品莲台」，斜斜反腕撩出，攻向$n的$l",
        "force" : 167,
        "parry" : 12,
        "dodge" : 15,
        "damage": 31,
        "lvl"   : 50,
        "skill_name" : "九品莲台",
        "damage_type":  "割伤"
]),
([      "action":"$N手中$w连绕数个大圈，一式「刚柔并济」，一道光飞向$n的$l",
        "force" : 187,
        "parry" : 23,
        "dodge" : 19,
        "damage": 45,
        "lvl"   : 70,
        "skill_name" : "刚柔并济",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w斜指苍天，一式「日月无华」，对准$n的$l斜斜击出",
        "force" : 197,
        "parry" : 31,
        "dodge" : 27,
        "damage": 56,
        "lvl"   : 90,
        "skill_name" : "日月无华",
        "damage_type":  "刺伤"
]),
([      "action":"$N一式「天罡汇聚」，$w飞斩盘旋，如疾电般射向$n的胸口",
        "force" : 218,
        "parry" : 49,
        "dodge" : 35,
        "damage": 63,
        "lvl"   : 110,
        "skill_name" : "天罡汇聚",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w一沉，一式「行影相随」，无声无息地滑向$n的$l",
        "force" : 239,
        "parry" : 52,
        "dodge" : 45,
        "damage": 72,
        "lvl"   : 130,
        "skill_name" : "行影相随",
        "damage_type":  "刺伤"
]),
([      "action":"$N手中$w斜指苍天，剑芒吞吐，一式「岁月无声」，对准$n的$l斜斜击出",
        "force" : 287,
        "parry" : 55,
        "dodge" : 51,
        "damage": 88,
        "lvl"   : 150,
        "skill_name" : "岁月无声",
        "damage_type":  "刺伤"
]),
([      "action":"$N左指凌空虚点，右手$w逼出丈许雪亮光芒，一式「流水无情」刺向$n的咽喉",
        "force" : 342,
        "parry" : 63,
        "dodge" : 55,
        "damage": 105,
        "lvl"   : 170,
        "skill_name" : "流水无情",
        "damage_type":  "刺伤"
]),
([      "action":"$N合掌跌坐，一式「刀光剑影」，$w自怀中跃出，如疾电般射向$n的胸口",
        "force" : 381,
        "parry" : 76,
        "dodge" : 65,
        "damage": 122,
        "lvl"   : 190,
        "skill_name" : "刀光剑影",
        "damage_type":  "刺伤"
])
});

int valid_enable(string usage)
{ 
       return usage == "sword" || usage == "parry" || usage == "blade";
}

int valid_learn(object me)
{
        object weapon;
        int lv = me->query_skill("yinyang-ren", 1);

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade"))
                return notify_fail("你使用的武器不对。\n");

        if (me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，不能学习阴阳刃法。\n");

        if (me->query("max_neili") < 1800)
                return notify_fail("你的内力修为不够，不能学习阴阳刃法。\n");

        if (me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，不能学习阴阳刃法。\n");

        if (me->query_skill("blade", 1) < 100)
                return notify_fail("你的基本刀法火候不够，不能学习阴阳刃法。\n");

        // 180 级之前受 sword 及 blade 两种基本技能限制
        if (lv <= 180 && (int)me->query_skill("sword", 1) < lv)
                return notify_fail("你的基本剑法水平有限，无法领会更高深的阴阳刃法。\n");

        if (lv <= 180 && (int)me->query_skill("blade", 1) < lv)
                return notify_fail("你的基本刀法水平有限，无法领会更高深的阴阳刃法。\n");

        if ((int)me->query_skill("sword", 1) < lv
           && (int)me->query_skill("blade", 1) < lv)
                return notify_fail("你的基本刀剑水平有限，无法领会更高深的阴阳刃法。\n");

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
        level = (int) me->query_skill("yinyang-ren", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || ((string)weapon->query("skill_type") != "sword"
           && (string)weapon->query("skill_type") != "blade"))
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力不够练阴阳刃法。\n");

        if ((int)me->query("neili") < 130)
                return notify_fail("你的内力不够练阴阳刃法。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yinyang-ren/" + action;
}