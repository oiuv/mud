inherit SKILL;

mapping *action = ({
([      "action": "$N手中$w斜指，一招「回身诛杀势」，反身一顿，一刀向$n的$l撩去",
        "force" : 72,
        "dodge" : 10,
        "parry" : 25,
        "attack": 16,
        "damage": 15,
        "lvl"   : 0,
        "skill_name"  : "回身诛杀势",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「临图现匕势」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 90,
        "dodge" : 30,
        "parry" : 40,
        "attack": 24,
        "damage": 21,
        "lvl"   : 20,
        "skill_name"  : "临图现匕势",
        "damage_type" : "割伤"
]),
([      "action": "$N展身虚步，提腰跃落，一招「下步劈山势」，刀锋一卷，拦腰斩向$n",
        "force" : 124,
        "dodge" : 35,
        "parry" : 45,
        "attack": 29,
        "damage": 35,
        "lvl"   : 40,
        "skill_name"  : "下步劈山势",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「戮妖降魔势」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 136,
        "dodge" : 45,
        "parry" : 45,
        "attack": 34,
        "damage": 52,
        "lvl"   : 60,
        "skill_name"  : "戮妖降魔势",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，一招「破玉穿梭势」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 158,
        "dodge" : 50,
        "parry" : 55,
        "attack": 37,
        "damage": 65,
        "lvl"   : 80,
        "skill_name"  : "破玉穿梭势",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「抱月藏刀势」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 169,
        "dodge" : 65,
        "parry" : 55,
        "attack": 46,
        "damage": 73,
        "lvl"   : 100,
        "skill_name"  : "抱月藏刀势",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「寒星凸起势」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force" : 210,
        "dodge" : 75,
        "parry" : 85,
        "attack": 55,
        "damage": 85,
        "lvl"   : 130,
        "skill_name"  : "寒星凸起势",
        "damage_type" : "割伤"
]),
([      "action": "$N盘身驻地，一招「翻天弑穹势」，挥出一片流光般的刀影，向$n的全身涌去",
        "force" : 240,
        "dodge" : 90,
        "parry" : 90,
        "attack": 76,
        "damage": 104,
        "lvl"   : 160,
        "skill_name"  : "翻天弑穹势",
        "damage_type" : "割伤"
]),
([      "action": "$N回首施出一招「十二转破神势」，$w顿时卷起无数闪耀的刀芒笼罩$n全身",
        "force" : 240,
        "dodge" : 90,
        "parry" : 90,
        "attack": 76,
        "damage": 104,
        "lvl"   : 200,
        "skill_name"  : "十二转破神势",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage)
{
	return usage == "blade" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < 50)
                return notify_fail("你的基本刀法火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("shiying-lianhuan", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的弑鹰九连环。\n");

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
        level = (int) me->query_skill("shiying-lianhuan", 1);
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
                return notify_fail("你的体力不够练弑鹰九连环。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练弑鹰九连环。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -53);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shiying-lianhuan/" + action;
}
