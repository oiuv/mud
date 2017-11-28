// taohua-zhangfa.c 桃花掌法
inherit SKILL;

mapping *action = ({
([      "action" : "$N右手五指缓缓一收，一式「春风拂面」，五指忽然遥遥拂向$n，$n只觉得五"
                   "股疾风袭向自己五处大穴",
        "force"  : 40,
        "dodge"  : 20,
        "damage_type" : "瘀伤",
        "lvl" : 0,
        "skill_name" : "春风拂面"
]),
([      "action" : "$N突然纵身跃入半空，一式「落花无情」，双掌向下，疾扑$n的头顶",
        "force"  : 60,
        "dodge"  : 25,
        "damage_type" : "内伤",
        "lvl" : 10,
        "skill_name" : "落花无情"
]),
([      "action" : "$N伸出右手并拢食指中指，捻个剑决，一式「寻花探柳」，直指$n的中盘",
        "force"  : 80,
        "dodge"  : 20,
        "damage_type" : "内伤",
        "lvl" : 20,
        "skill_name" : "寻花探柳"
]),
([      "action" : "$N突然抽身而退，接着一式「随风而逝」，平身飞起，双掌向$n的$l"
                   "连拍数掌",
        "force"  : 100,
        "dodge"  : 35,
        "damage_type" : "内伤",
        "lvl" : 30,
        "skill_name" : "随风而逝"
]),
([      "action" : "$N使一式「狂风卷叶」，全身突然飞速旋转，双掌忽前忽后，猛地拍向$n"
                   "的胸口",
        "force"  : 110,
        "dodge"  : 30,
        "damage_type" : "内伤",
        "lvl" : 40,
        "skill_name" : "狂风卷叶"
]),
([      "action" : "$N前后一揉，一式「寸草不生」，双掌推出一股阴柔之力袭向$n的$1 ",
        "force"  : 130,
        "dodge"  : 35,
        "damage_type" : "内伤",
        "lvl" : 50,
        "skill_name" : "寸草不生"
]),
([      "action" : "$N双手食指和中指迅速和在一起，一式「摧花断叶」，一股强烈的气"
                   "流涌向$n的全身",
        "force"  : 150,
        "parry"  : 25,
        "dodge"  : 20,
        "damage_type" : "内伤",
        "lvl" : 60,
        "skill_name" : "摧花断叶"
]),
([      "action" : "$N使一式「天女散花」，双掌舞出无数圈劲气，一环环向$n的$l斫去 ",
        "force" : 170,
        "parry" : 25,
        "dodge" : 35,
        "damage_type" : "劈伤",
        "lvl" : 70,
        "skill_name" : "天女散花"
]),
([      "action" : "$N两掌在胸前合什，施展出「推波助澜」，双掌骤然分开，祭出两团光"
                   "球飞速攻向$n",
        "force" : 190,
        "parry" : 25,
        "dodge" : 30,
        "damage_type" : "内伤",
        "lvl" : 80,
        "skill_name" : "推波助澜"
]),
([      "action" : "$N一式「落英缤纷」，双掌在胸前疾转数圈，不急不缓地推向$n。$n只"
                   "见漫天掌花逼向自己，早已为此招所折服，根本不知躲避。",
        "force" : 210,
        "parry" : 30,
        "dodge" : 35,
        "damage_type" : "内伤",
        "lvl" : 90,
        "skill_name" : "落英缤纷"
])
});

int valid_enable(string usage) { return usage=="unarmed" ||  usage=="parry"; }  

int valid_learn(object me)
{
    if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
        return notify_fail("练桃花掌法必须空手。\n");

    if ((int)me->query("max_neili") < 100)
        return notify_fail("你的内力太弱，无法练桃花掌法。\n");

    if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("taohua-zhangfa", 1))
	return notify_fail("你的基本掌法水平有限，无法领会更高深的桃花掌法。\n");

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
    level = (int)me->query_skill("taohua-zhangfa", 1);
    for(i = sizeof(action); i > 0; i--)
        if(level > action[i-1]["lvl"])
            return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
    if ((int)me->query("qi") < 40)
        return notify_fail("你的体力太低了。\n");

    if ((int)me->query("neili") < 20)
        return notify_fail("你的内力不够练桃花掌法。\n");

    me->receive_damage("qi", 30);
    me->add("neili", -5);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"taohua-zhangfa/" + action;
}
