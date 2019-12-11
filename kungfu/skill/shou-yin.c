// shou-yin.c 手印(徐子陵)

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N使出一招「莲花合掌印」，双掌做锥，直直刺向$n的前胸",
        "force"    : 589,
        "attack"   : 285,
        "dodge"    : 167,
        "parry"    : 189,
        "damage"   : 303,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "刺伤",
]),
([      "action" : "$N使出一招「合掌观音印」，飞身跃起，双手如勾，抓向$n的$l",
        "force"    : 621,
        "attack"   : 309,
        "dodge"    : 188,
        "parry"    : 197,
        "damage"   : 326,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "刺伤",
]),
([      "action" : "$N使出一招「准提佛母印」，运力于指，直取$n的$l",
        "force"    : 642,
        "attack"   : 321,
        "dodge"    : 197,
        "parry"    : 203,
        "damage"   : 339,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "刺伤",
]),
([      "action" : "$N使出一招「红阎婆罗印」，怒吼一声，一掌当头拍向$n的$l",
        "force"    : 657,
        "attack"   : 335,
        "dodge"    : 215,
        "parry"    : 227,
        "damage"   : 356,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "内伤",
]),
([      "action" : "$N使出一招「药师佛根本印」，猛冲向前，掌刀如游龙般砍向$n",
        "force"    : 673,
        "attack"   : 357,
        "dodge"    : 243,
        "parry"    : 236,
        "damage"   : 367,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "割伤",
]),
([      "action" : "$N使出一招「威德金刚印」，伏身疾进，双掌自下扫向$n的$l",
        "force"    : 672,
        "attack"   : 371,
        "dodge"    : 265,
        "parry"    : 257,
        "damage"   : 386,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "割伤",
]),
([      "action" : "$N使出一招「上乐金刚印」，飞身横跃，双掌前后击出，抓向$n的咽"
                   "喉",
        "force"    : 680,
        "attack"   : 398,
        "dodge"    : 297,
        "parry"    : 271,
        "damage"   : 403,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "刺伤",
]),
([      "action" : "$N使出一招「六臂智慧印」，顿时劲气弥漫，天空中出现无数掌影打"
                   "向$n",
        "force"    : 720,
        "attack"   : 435,
        "dodge"    : 315,
        "parry"    : 287,
        "damage"   : 436,
        "weapon"   : HIW "手印" NOR,
        "damage_type" : "割伤",
]),
});

int double_attack() { return 1; }

int valid_enable(string usage) { return usage == "hand" || usage == "unarmed" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练手印必须空手。\n");

        if (me->query("int") < 36)
                return notify_fail("你觉得手印过于艰深，难以理解。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 300)
                return notify_fail("你的武学修养太低，无法修习手印。\n");

        if ((int)me->query("max_neili") < 5000)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 350)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("hand", 1) < 200)
                return notify_fail("你的基本手法火候太浅。\n");

        if ((int)me->query_skill("hand", 1) < (int)me->query_skill("shou-yin",1))
                return notify_fail("你的基本手法水平有限，无法领会更高深的手印。\n");

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
                  level   = (int) me->query_skill("shou-yin",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        // object weapon;

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练手印法必须空手。\n");

        if ((int)me->query("qi") < 350)
                return notify_fail("你的体力不够，练不了手印。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你的内力不够，练不了手印。\n");

        me->receive_damage("qi", 300);
        me->add("neili", -300);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (damage_bonus < 100) return 0;

        if (damage_bonus / 5 > victim->query_str())
        {
                victim->receive_wound("qi", (damage_bonus - 100) / 2);
                return HIR "只听" + victim->name() +
                       HIR "一声闷哼，一双" NOR + HIW "手印"
                       NOR + HIR "重重的印在胸前，“哇”"
                       "的喷出了一大口鲜血！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"shou-yin/" + action;
}
