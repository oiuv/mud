// cibei-dao.c 慈悲刀
// Modified by Venus Oct.1997
inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N手中$w斜指，一招「停车问路」，反身一顿，一刀向$n的$l撩去",
        "force" : 40,
        "attack": 10,
        "dodge" : -10,
        "parry" : 5,
        "lvl"   : 0,
        "damage": 5,
        "skill_name" : "停车问路",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「童子挂画」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 90,
        "attack": 20,
        "dodge" : -10,
        "parry" : 8,
        "damage": 5,
        "lvl"   : 10,
        "skill_name" : "童子挂画",
        "damage_type" : "割伤"
]),
([      "action": "$N展身虚步，提腰跃落，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
        "force" : 140,
        "attack": 25,
        "dodge" : -5,
        "parry" : 12,
        "damage": 15,
        "lvl"   : 30,
        "skill_name" : "推窗望月",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「开门见山」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 190,
        "attack": 30,
        "dodge" : 5,
        "parry" : 15,
        "damage": 25,
        "lvl"   : 50,
        "skill_name" : "开门见山",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，一招「临溪观鱼」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 240,
        "attack": 35,
        "dodge" : 10,
        "parry" : 25,
        "damage": 30,
        "lvl"   : 80,
        "skill_name" : "临溪观鱼",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「张弓望的」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 280,
        "attack": 40,
        "dodge" : 15,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 100,
        "skill_name" : "张弓望的",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「风送轻舟」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force" : 290,
        "attack": 45,
        "dodge" : 5,
        "parry" : 35,
        "damage": 50,
        "lvl"   : 120,
        "skill_name" : "风送轻舟",
        "damage_type" : "割伤"
]),
([      "action": "$N盘身驻地，一招「川流不息」，挥出一片流光般的刀影，向$n的全身涌去",
        "force" : 320,
        "attack": 50,
        "dodge" : 20,
        "parry" : 45,
        "damage": 60,
        "lvl"   : 150,
        "skill_name" : "停车问路",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("cibei-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的慈悲刀法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("cibei-dao",1);
        for(i = sizeof(action); i > 0; i--)
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
                return notify_fail("你的体力不够练慈悲刀。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练慈悲刀。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -58);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"cibei-dao/" + action;
}
