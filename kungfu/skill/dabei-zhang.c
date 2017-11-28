#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N身形急晃，施出大悲掌「" HIG "浪涛势" NOR "」，右掌带着切骨之劲砍向$n",
        "force" : 180,
        "attack": 23,
        "dodge" : 25,
        "parry" : 17,
        "damage": 19,
        "lvl"   : 0,
        "skill_name"  : "浪涛势",
        "damage_type" : "内伤"
]),
([      "action" : "$N一招「" HIG "深渊势" NOR "」，双掌斜出，万千道掌寒劲从四面八方席卷$n",
        "force" : 240,
        "attack": 41,
        "dodge" : 25,
        "parry" : 27,
        "damage": 25,
        "lvl"   : 30,
        "skill_name"  : "深渊势",
        "damage_type" : "内伤"
]),
([      "action" : "$N平掌为刀施展「" HIG "鲸吞势" NOR "」，幻出一道刚猛的掌劲飓风般裹向$n",
        "force" : 330,
        "attack": 58,
        "dodge" : 36,
        "parry" : 35,
        "damage": 39,
        "lvl"   : 60,
        "skill_name"  : "鲸吞势",
        "damage_type" : "内伤"
]),
([      "action" : "$N反转右掌陡然施一招「" HIG "破穹势" NOR "」，力注左掌，横向$n拦腰砍去",
        "force" : 410,
        "attack": 96,
        "dodge" : 81,
        "parry" : 62,
        "damage": 53,
        "lvl"   : 90,
        "skill_name"  : "破穹势",
        "damage_type" : "内伤"
]),
([      "action" : "$N手腕一翻，挥出一道无比凌厉的掌劲直斩$n，正是「" HIG "翻海势" NOR "」",
        "force" : 460,
        "attack": 125,
        "dodge" : 35,
        "parry" : 47,
        "damage": 78,
        "lvl"   : 120,
        "skill_name"  : "翻海势",
        "damage_type" : "内伤"
]),
([      "action" : "$N施出「" HIG "滔天势" NOR "」，双手凌空舞出一个大圈，劲气至圈中直涌$n",
        "force" : 520,
        "attack": 110,
        "dodge" : 45,
        "parry" : 40,
        "damage": 85,
        "lvl"   : 150,
        "skill_name"  : "滔天势",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage)
{
        return usage == "strike" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练大悲神掌必须空手。\n");

        if ((int)me->query_skill("force") < 240)
                return notify_fail("你的内功火候不够，无法练习大悲神掌。\n");

        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力太弱，无法练习大悲神掌。\n");

        if ((int)me->query_skill("strike", 1) < 180)
                return notify_fail("你的基本掌法火候不够，无法练习大悲神掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("dabei-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的大悲神掌。\n");

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
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练大悲神掌。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -80);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (damage_bonus < 100)
                return 0;

        if (random(me->query_skill("force")) > victim->query_skill("force") / 2)
        {
                victim->receive_wound("qi", (damage_bonus - 100) / 2, me);
                return HIW "只听「呼」的一声，$N" HIW "掌锋划过，顿时将$n"
                       HIW "硬生生逼退数步！\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"dabei-zhang/" + action;
}
