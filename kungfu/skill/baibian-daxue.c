// baibian-daxue.c
inherit SKILL;

mapping *action = ({
([      "action":"$N一招「指点江山」，手中$w疾点向$n的期门穴!",
        "force" : 60,
        "dodge" : 20,
        "damage" : 22,
        "lvl" : 0,
        "damage_type" : "刺伤",
        "skill_name" : "指点江山",
]),
([      "action":"$N吐气开声一招「银钩铁划」，$w如灵蛇吞吐，向$n白海穴戳去",
        "force" : 90,
        "dodge" : 15,
        "damage" : 28,
        "lvl" : 9,
        "damage_type": "刺伤",
        "skill_name" : "银钩铁划",
]),
([      "action":"$N向前跨上一步，手中$w一晃，正是一招使出「灵蛇吐雾」，疾点$n的地仓穴",
        "force" : 120,
        "dodge" : 10,
        "damage" : 32,
        "lvl" : 19,
        "damage_type" : "刺伤",
        "skill_name" : "灵蛇吐雾",
]),
([      "action":"$N手中的$w左右急晃，舞成一段光芒，使出「千变万化」带着呼呼风声笼罩了$n的章门穴",
        "force" : 140,
        "dodge" : 8,
        "damage" : 38,
        "lvl" : 29,
        "damage_type": "刺伤",
        "skill_name" : "千变万化",
]),
([      "action":"$N飞身跃起，一式「千蛇出洞」，卷起漫天笔影，紧紧裹住$n",
        "force" : 160,
        "dodge" : 15,
        "damage" : 44,
        "lvl" : 39,
        "damage_type": "刺伤",
        "skill_name" : "千蛇出洞",
]),
([      "action":"$N凝气守中，$w逼出阵阵光芒，挥出「灵台观景」，一招快一招地攻向$n",
        "force" : 190,
        "dodge" : 12,
        "damage" : 49,
        "lvl" : 59,
        "damage_type": "刺伤",
        "skill_name" : "灵台观景",
]),
([      "action":"$N使出一招「神蛇引路」挺笔中宫直进，$w忽的颤动，中途忽然转而向上变幻无方",
        "force" : 230,
        "dodge" : 5,
        "damage" : 53,
        "lvl" : 79,
        "damage_type": "刺伤",
        "skill_name" : "神蛇引路",
]),
([      "action":"$N侧身手中的$w斜刺，一招「奇采迭出」，刺向$n胸前檀中大穴",
        "force" : 250,
        "dodge" : 15,
        "damage" : 58,
        "lvl" : 99,
        "damage_type": "刺伤",
        "skill_name" : "奇采迭出",
]),
});

int valid_enable(string usage) { return (usage == "staff") || (usage == "parry"); }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 150)
                return notify_fail("你的内力不够，没有办法练百变打穴法。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，还不能学习百变打穴法!\n");

	if ((int)me->query_skill("staff", 1) < (int)me->query_skill("baibian-daxue", 1))
		return notify_fail("你的基本杖法水平有限，无法领会更高深的百变打穴杖法。\n");

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
       level   = (int) me->query_skill("baibian-daxue",1);
       for(i = sizeof(action); i > 0; i--)
               if(level > action[i-1]["lvl"])
                       return action[NewRandom(i, 20, level/5)];

}

int practice_skill(object me)
{       object ob;
        if( !(ob = me->query_temp("weapon")) ||
            (string)ob->query("skill_type") != "staff" )
                return notify_fail("你必须先找一根铁杖才能学习百变打穴法。\n");

        if( (int)me->query("qi") < 50)
                return notify_fail("你的气不够，没有办法练习百变打穴法。\n");

        if( (int)me->query("neili") < 40)
                return notify_fail("你的内力不够，没有办法练习百变打穴法。\n");

        me->receive_damage("qi", 32);
        me->add("neili", -15);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__ "baibian-daxue/" + action;
}

