// wuhu-duanmendao.c 五虎断门刀

inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w斜指，一招「直来直去」，反身一顿，一刀向$n的$l撩去",
        "force"  : 30,
		"attack" : 65,
        "dodge"  : -10,
        "parry"  : 5,
        "lvl"    : 0,
        "skill_name"  : "直来直去",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「壁上挂画」，左右腿虚点，$w一提一收，平刃挥向$n的颈部",
        "force"  : 35,
		"attack" : 65,
        "dodge"  : -10,
        "parry"  : 10,
        "lvl"    : 10,
        "skill_name"  : "壁上挂画",
        "damage_type" : "割伤"
]),
([      "action" : "$N展身虚步，提腰跃落，一招「推窗望月」，刀锋一卷，拦腰斩向$n",
        "force"  : 40,
		"attack" : 65,
        "dodge"  : -5,
        "parry"  : 5,
        "lvl"    : 20,
        "skill_name"  : "推窗望月",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「力劈华山」，$w大开大阖，自上而下划出一个闪电，直劈向$n",
        "force"  : 60,
		"attack" : 65,
        "dodge"  : 5,
        "parry"  : 5,
        "lvl"    : 30,
        "skill_name"  : "力劈华山",
        "damage_type" : "割伤"
]),
([      "action" : "$N手中$w一沉，一招「临溪观鱼」，双手持刃拦腰反切，砍向$n的胸口",
        "force"  : 80,
		"attack" : 65,
        "dodge"  : 10,
        "parry"  : 5,
        "lvl"    : 40,
        "skill_name"  : "临溪观鱼",
        "damage_type" : "割伤"
]),
([      "action" : "$N挥舞$w，使出一招「张弓望的」，上劈下撩，左挡右开，齐齐罩向$n",
        "force"  : 100,
		"attack" : 70,
        "dodge"  : 15,
        "parry"  : 15,
        "lvl"    : 50,
        "skill_name"  : "张弓望的",
        "damage_type" : "割伤"
]),
([      "action" : "$N一招「风送轻舟」，左脚跃步落地，$w顺势往前，挟风声劈向$n的$l",
        "force"  : 110,
		"attack" : 75,
        "dodge"  : 5,
        "parry"  : 15,
        "damage" : 45,
        "lvl"    : 60,
        "skill_name"  : "风送轻舟",
        "damage_type" : "劈伤"
]),
([      "action" : "$N盘身驻地，一招「川流不息」，挥出一片流光般的刀影，向$n的全身涌去",
        "force"  : 130,
		"attack" : 80,
        "dodge"  : 20,
        "parry"  : 10,
        "damage" : 55,
        "lvl"    : 70,
        "skill_name"  : "川流不息",
        "damage_type" : "刺伤"
]),
([      "action" : "$N右手后撤，手腕一翻，一招「壮士断腕」，顿时一道白光直斩向$n的手臂",
        "force"  : 150,
		"attack" : 85,
        "dodge"  : 20,
        "parry"  : 20,
        "damage" : 65,
        "lvl"    : 80,
        "skill_name"  : "壮士断腕",
        "damage_type" : "砍伤"
]),
([      "action" : "$N高高跃起，一招「人头落地」，手中$w直劈向$n的颈部",
        "force"  : 170,
		"attack" : 90,
        "dodge"  : 20,
        "parry"  : 20,
        "damage" : 75,
        "lvl"    : 90,
        "skill_name"  : "人头落地",
        "damage_type" : "劈伤"
]),
([      "action" : "$N贴地滑行，一招「断子绝孙」，手中$w直撩去$n的裆部",
        "force"  : 180,
		"attack" : 95,
        "dodge"  : 30,
        "parry"  : 30,
        "damage" : 85,
        "lvl"    : 100,
        "skill_name"  : "断子绝孙",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 350)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的基本内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("wuhu-duanmendao", 1))
                return notify_fail("你的基本刀法火候有限，无法领会更高深的五虎断门刀法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("wuhu-duanmendao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练五虎断门刀法。\n");

        if ((int)me->query("neili") < 30)
                return notify_fail("你的体力不够练五虎断门刀法。\n");

        me->receive_damage("qi", 30);
        me->add("neili", -18);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"wuhu-duanmendao/" + action;
}
