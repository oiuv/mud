inherit SKILL;

mapping *action = ({
([      "action": "$N手中$w斜指，一招「阴晴不定」，反身一顿，一刀向$n的$l撩去",
        "force" : 110,
        "dodge" : -10,
        "lvl"   : 0,
        "skill_name" : "阴晴不定",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「李白醉酒」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 130,
        "dodge" : -10,
        "damage": 5,
        "lvl"   : 20,
        "skill_name" : "李白醉酒",
        "damage_type" : "割伤"
]),
([      "action": "$N展身虚步，提腰跃落，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
        "force" : 150,
        "dodge" : -5,
        "damage": 15,
        "lvl"   : 40,
        "skill_name" : "推窗望月",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「所向披靡」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 180,
        "dodge" : 5,
        "damage": 25,
        "lvl"   : 60,
        "skill_name" : "所向披靡",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，一招「临溪观鱼」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 220,
        "dodge" : 10,
        "damage": 30,
        "lvl"   : 80,
        "skill_name" : "临溪观鱼",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「张弓望的」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 250,
        "dodge" : 15,
        "damage": 35,
        "lvl"   : 100,
        "skill_name" : "张弓望的",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「扬帆远去」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force" : 280,
        "dodge" : 10,
        "damage": 50,
        "lvl"   : 120,
        "skill_name" : "扬帆远去",
        "damage_type" : "割伤"
]),
([      "action": "$N盘身驻地，一招「川流不息」，挥出一片流光般的刀影，向$n的全身涌去",
        "force" : 310,
        "dodge" : 25,
        "damage": 60,
        "lvl"   : 140,
        "skill_name" : "川流不息",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 350)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候太浅。\n");

        if (me->query_skill("blade", 1) < me->query_skill("ruyi-dao", 1))
                return notify_fail("你的基本刀法火候太浅，难以领会更高深的如意刀法。\n");

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
        level   = (int) me->query_skill("ruyi-dao", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练如意刀。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练如意刀。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -53);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"ruyi-dao/" + action;
}
