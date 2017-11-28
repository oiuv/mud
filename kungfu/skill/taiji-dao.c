// taiji-dao.c 太极刀
// modified by Venus Oct.1997
// cleansword 2/15/96

inherit SKILL;

mapping *action = ({
([      "action": "$N手中$w斜指，一招「停车问路」，反身一顿，一刀向$n的$l撩去",
        "force" : 20,
        "dodge" : 10,
        "parry" : 25,
        "damage": 5,
        "lvl"   : 0,
        "skill_name"  : "停车问路",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「童子挂画」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force" : 30,
        "dodge" : 30,
        "parry" : 40,
        "damage": 10,
        "lvl"   : 20,
        "skill_name"  : "童子挂画",
        "damage_type" : "割伤"
]),
([      "action": "$N展身虚步，提腰跃落，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
        "force" : 40,
        "dodge" : 35,
        "parry" : 45,
        "damage": 15,
        "lvl"   : 40,
        "skill_name"  : "推窗望月",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「开门见山」，$w大开大阖，自上而下划出一个大弧，笔直劈向$n",
        "force" : 60,
        "dodge" : 45,
        "parry" : 45,
        "damage": 20,
        "lvl"   : 60,
        "skill_name"  : "开门见山",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w一沉，一招「临溪观鱼」，双手持刃拦腰反切，砍向$n的胸口",
        "force" : 80,
        "dodge" : 50,
        "parry" : 55,
        "damage": 25,
        "lvl"   : 80,
        "skill_name"  : "临溪观鱼",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「张弓望的」，上劈下撩，左挡右开，齐齐罩向$n",
        "force" : 90,
        "dodge" : 65,
        "parry" : 55,
        "damage": 30,
        "lvl"   : 100,
        "skill_name"  : "张弓望的",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「风送轻舟」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force" : 120,
        "dodge" : 75,
        "parry" : 85,
        "damage": 35,
        "lvl"   : 120,
        "skill_name"  : "风送轻舟",
        "damage_type" : "割伤"
]),
([      "action": "$N盘身驻地，一招「川流不息」，挥出一片流光般的刀影，向$n的全身涌去",
        "force" : 140,
        "dodge" : 90,
        "parry" : 90,
        "damage": 40,
        "lvl"   : 140,
        "skill_name"  : "川流不息",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力修为不够。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("taiji-dao", 1))
	        return notify_fail("你的基本刀法水平有限，无法领会更高深的太极刀法。\n");

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
	level = (int) me->query_skill("taiji-dao", 1);
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
                return notify_fail("你的体力不够练太极刀法。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练太极刀法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -43);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"taiji-dao/" + action;
}
