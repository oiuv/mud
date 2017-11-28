inherit SKILL;

mapping *action = ({
([      "action":"$N吐气开声一招「泣」字诀，$w如灵蛇吞吐，向$n白海穴戳去",
        "force" : 130,
        "attack": 30,
        "dodge" : -10,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 0,
        "skill_name" : "泣字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N向前跨上一步，混身充满战意，使出「惊」字诀，疾点$n的地仓穴",
        "force" : 170,
        "attack": 40,
        "dodge" : 5,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 30,
        "skill_name" : "惊字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N手中的$w自左而右地一晃，使出「伤」字诀横打$n的章门穴",
        "force" : 190,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 40,
        "lvl"   : 60,
        "skill_name" : "伤字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N飞身跃起，一式「卷」字诀，卷起漫天笔影，$w向$n电射而去",
        "force" : 240,
        "attack": 60,
        "dodge" : 10,
        "parry" : 45,
        "damage": 50,
        "lvl"   : 90,
        "skill_name" : "卷字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N凝气守中，$w逼出尺许雪亮笔锋，陡然挥出「离」字诀攻向$n",
        "force" : 260,
        "attack": 65,
        "dodge" : 5,
        "parry" : 50,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "离字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N使出一招「悲」字诀挺笔中宫直进，笔尖颤动，中途忽然转而向上",
        "force" : 280,
        "attack": 70,
        "dodge" : 5,
        "parry" : 52,
        "damage": 75,
        "lvl"   : 150,
        "skill_name" : "悲字诀",
        "damage_type" : "刺伤"
]),
([      "action":"$N侧身斜刺一笔，一招「苍」字诀卷带着呼呼笔风，将$n包围紧裹",
        "force" : 310,
        "attack": 75,
        "dodge" : 5,
        "parry" : 64,
        "damage": 90,
        "lvl"   : 180,
        "skill_name" : "苍字诀",
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

        if ((int)me->query_skill("dagger", 1) < 30)
                return notify_fail("你的基本短兵火候太浅。\n");

        if ((int)me->query_skill("dagger", 1) < (int)me->query_skill("canghong-bifa", 1))
                return notify_fail("你的基本短兵水平有限，无法领会更高深的苍虹笔法。\n");

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

        level = (int) me->query_skill("canghong-bifa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习苍虹笔法。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练苍虹笔法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练苍虹笔法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"canghong-bifa/" + action;
}
