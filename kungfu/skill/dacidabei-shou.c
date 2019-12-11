inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action" : "$N使出一招「莲花手」，双掌合十，直直撞向$n的前胸",
        "skill_name" : "莲花手",
        "force" : 120,
        "attack": 70,
        "dodge" : 20,
        "lvl" : 0,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「观音手」，飞身跃起，双手如勾，抓向$n的$l",
        "skill_name" : "观音手",
        "force" : 170,
        "attack": 80,
        "dodge" : 20,
        "lvl" : 25,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「佛母手」，运力于指，直取$n的$l",
        "skill_name" : "佛母手",
        "force" : 220,
        "attack": 60,
        "dodge" : 20,
        "lvl" : 50,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「红阎婆罗手」，怒吼一声，一掌当头拍向$n的$l",
        "skill_name" : "红阎婆罗手",
        "force" : 250,
        "attack": 80,
        "dodge" : 30,
        "lvl" : 80,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「慈悲手」，猛冲向前，掌如游龙般攻向$n",
        "skill_name" : "慈悲手",
        "force" : 360,
        "attack": 80,
        "dodge" : 30,
        "lvl" : 100,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「大慈大悲手」，伏身疾进，双掌自下扫向$n的$l",
        "skill_name" : "大慈大悲手",
        "force" : 550,
        "dodge" : 70,
        "lvl" : 180,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「金刚手」，飞身横跃，双掌前后击出，抓向$n的咽喉",
        "skill_name" : "金刚手",
        "force" : 500,
        "attack": 120,
        "dodge" : 80,
        "lvl" : 140,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N使出一招「六臂智慧手」，顿时劲气弥漫，天空中出现无数掌影打"
                   "向$n的$l",
        "skill_name" : "六臂智慧手",
        "force" : 500,
        "attack": 120,
        "dodge" : 100,
        "lvl" : 160,
        "damage_type" : "瘀伤",
]),
});

int valid_enable(string usage) { return usage == "hand" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练大慈大悲手必须空手。\n");

        if ((int)me->query("max_neili") < 3500)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 250)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query("dex") < 26 || (int)me->query("con") < 26)
                return notify_fail("你的先天不足，无法理解大慈大悲手。\n");

        if ((int)me->query_skill("buddhism", 1) < 200)
                return notify_fail("你对禅宗心法的知识了解太少，无法理解大慈大悲手。\n");

        if ((int)me->query_skill("buddhism", 1) < (int)me->query_skill("dacidabei-shou",1) &&
            (int)me->query_skill("buddhism", 1) < 300)
                return notify_fail("你受禅宗心法知识的知识所限，难以进一步领悟大慈大悲手。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("dashou-yin",1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的大慈大悲手。\n");

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
                  level   = (int) me->query_skill("dashou-yin",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        // object weapon; 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练「大慈大悲手」必须空手。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力不够，练不了大慈大悲手。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够，练不了大慈大悲手。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -70);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"dacidabei-shou/" + action;
}
