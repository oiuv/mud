inherit SKILL;

mapping *action = ({
([      "action":"$N左手施展出一招「清心普善」，手中的$w疾点向$n的期门穴",
        "force" : 90,
        "attack": 15,
        "dodge" : -10,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "清心普善",
        "damage_type" : "刺伤"
]),
([      "action":"$N吐气开声一招「寒梅映雪」，$w如灵蛇吞吐，向$n白海穴戳去",
        "force" : 130,
        "attack": 30,
        "dodge" : -10,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "寒梅映雪",
        "damage_type" : "刺伤"
]),
([      "action":"$N向前跨上一步，混身充满战意，手中$w使出「追风逐电」，疾点$n的地仓穴",
        "force" : 170,
        "attack": 40,
        "dodge" : 5,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 60,
        "skill_name" : "追风逐电",
        "damage_type" : "刺伤"
]),
([      "action":"$N手中的$w自左而右地一晃，使出「飞黄腾达」带着呼呼风声横打$n的章门穴",
        "force" : 190,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "飞黄腾达",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身跃起，一式「快马加鞭」，卷起漫天笔影，$w向$n电射而去",
        "force" : 240,
        "attack": 60,
        "dodge" : 10,
        "parry" : 45,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "快马加鞭",
        "damage_type" : "刺伤"
]),
([      "action":"$N凝气守中，$w逼出尺许雪亮笔锋，挥出「灵台观景」，一笔快似一笔地攻向$n",
        "force" : 260,
        "attack": 65,
        "dodge" : 5,
        "parry" : 50,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "灵台观景",
        "damage_type" : "刺伤"
]),
([      "action":"$N使出一招「群山叠影」挺笔中宫直进，笔尖颤动，中途忽然转而向上变幻无方",
        "force" : 280,
        "attack": 70,
        "dodge" : 5,
        "parry" : 52,
        "damage": 75,
        "lvl"   : 140,
        "skill_name" : "群山叠影",
        "damage_type" : "刺伤"
]),
([      "action":"$N侧身斜刺一笔，一招「风雷卷破」卷带着呼呼笔风，将$n包围紧裹",
        "force" : 310,
        "attack": 75,
        "dodge" : 5,
        "parry" : 64,
        "damage": 90,
        "lvl"   : 150,
        "skill_name" : "风雷卷破",
        "damage_type" : "刺伤"
]),
});


int valid_enable(string usage)
{
	return usage == "dagger" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("dagger", 1) < 10)
                return notify_fail("你的基本短兵火候太浅。\n");

        if ((int)me->query_skill("dagger", 1) < (int)me->query_skill("qingliang-daxuefa", 1))
                return notify_fail("你的基本短兵水平有限，无法领会更高深的清凉打穴法。\n");

    return 1;
}

string query_skill_name(int level)
{
        int i;

        for(i = sizeof(action) - 1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;

        level = (int) me->query_skill("qingliang-daxuefa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习清凉打穴法。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练清凉打穴法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练清凉打穴法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qingliang-daxuefa/" + action;
}
