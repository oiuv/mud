
inherit SKILL;

mapping *action = ({
([      "action":"$N一招「子弦相连」，手中$w一颤，疾点向$n的期门穴",
        "force" : 90,
        "attack": 15,
        "dodge" : -10,
        "parry" : 20,
        "damage": 25,
        "lvl"   : 0,
        "skill_name" : "子弦相连",
        "damage_type" : "点穴"
]),
([      "action":"$N吐气开声一招「百丑当道」，$w如灵蛇吞吐，向$n白海穴戳去",
        "force" : 130,
        "attack": 30,
        "dodge" : -10,
        "parry" : 30,
        "damage": 30,
        "lvl"   : 40,
        "skill_name" : "百丑当道",
        "damage_type" : "点穴"
]),
([      "action":"$N向前跨上一步，混身充满战意，手中$w使出「寅时挑灯」，疾点$n的地仓穴",
        "force" : 170,
        "attack": 40,
        "dodge" : 5,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 60,
        "skill_name" : "寅时挑灯",
        "damage_type" : "点穴"
]),
([      "action":"$N手中的$w自左而右地一晃，使出「神卯环心」带着呼呼风声横打$n的章门穴",
        "force" : 190,
        "attack": 50,
        "dodge" : 5,
        "parry" : 35,
        "damage": 40,
        "lvl"   : 80,
        "skill_name" : "神卯环心",
        "damage_type" : "点穴"
]),
([      "action":"$N飞身跃起，一式「午不过子」，卷起漫天幻影，$w向$n劳宫穴电射而去",
        "force" : 240,
        "attack": 60,
        "dodge" : 10,
        "parry" : 45,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "午不过子",
        "damage_type" : "点穴"
]),
([      "action":"$N凝气守中，$w逼出尺许雪亮笔锋，挥出「己元钧天」，一招快似一招地攻向$n",
        "force" : 260,
        "attack": 65,
        "dodge" : 5,
        "parry" : 50,
        "damage": 60,
        "lvl"   : 120,
        "skill_name" : "己元钧天",
        "damage_type" : "点穴"
]),
([      "action":"$N使出一招「七耀计都」中宫直进，$w颤动不已，中途忽然转而向上打向$n",
        "force" : 280,
        "attack": 70,
        "dodge" : 5,
        "parry" : 52,
        "damage": 75,
        "lvl"   : 140,
        "skill_name" : "七耀计都",
        "damage_type" : "点穴"
]),
([      "action":"$N侧身斜刺一招，正是一式「破煞冲关」卷带着呼呼风声，将$n包围紧裹",
        "force" : 310,
        "attack": 75,
        "dodge" : 5,
        "parry" : 64,
        "damage": 90,
        "lvl"   : 150,
        "skill_name" : "破煞冲关",
        "damage_type" : "点穴"
]),
});


int valid_enable(string usage) { return (usage == "dagger") || (usage == "parry"); }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力修为太浅，无法练子午打穴法。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅，无法练子午打穴法。\n");

        if ((int)me->query_skill("dagger", 1) < 80)
                return notify_fail("你的基本短兵火候太浅，无法练子午打穴法。\n");

        if ((int)me->query_skill("dagger", 1) < (int)me->query_skill("ziwu-daxuefa", 1))
                return notify_fail("你的基本短兵水平有限，无法领会更高深的子午打穴法。\n");

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

        level = (int) me->query_skill("ziwu-daxuefa", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "dagger")
                return notify_fail("你所持的武器无法练习子午打穴法。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练子午打穴法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练子午打穴法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"ziwu-daxuefa/" + action;
}
