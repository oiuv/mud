#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N单手一扬，一招「开天辟地」，手中$w抖得笔直，对准$n当头罩下",
        "force"  : 80,
        "attack" : 1,
        "dodge"  : 3,
        "parry"  : 3,
        "damage" : 2,
        "lvl" : 0,
        "skill_name" : "开天辟地",
        "damage_type":  "劈伤"
]),
([      "action" : "$N身形一转，一招「龙腾四海」，手中$w如矫龙般腾空一卷，猛地击向$n",
        "force"  : 90,
        "attack" : 3,
        "dodge"  : 7,
        "parry"  : 5,
        "damage" : 6,
        "lvl" : 10,
        "skill_name" : "龙腾四海",
        "damage_type":  "劈伤"
]),
([      "action" : "$N唰的一抖长鞭，一招「矫龙出水」，手中$w抖得笔直，刺向$n双眼",
        "force"  : 110,
        "attack" : 9,
        "dodge"  : 13,
        "parry"  : 8,
        "damage" : 8,
        "lvl" : 20,
        "skill_name" : "矫龙出水",
        "damage_type":  "刺伤"
]),
([      "action" : "$N力贯鞭梢，一招「破云见日」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force"  : 118,
        "attack" : 10,
        "dodge"  : 4,
        "parry"  : 5,
        "damage" : 9,
        "lvl" : 40,
        "skill_name" : "破云见日",
        "damage_type":  "刺伤"
]),
([      "action" : "$N运气于腕，一招「开山裂石」，手中$w向一根铜棍般直击向$n",
        "force"  : 128,
        "attack" : 11,
        "dodge"  : 7,
        "parry"  : 10,
        "damage" : 8,
        "lvl" : 60,
        "skill_name" : "开山裂石",
        "damage_type":  "内伤"
]),
([      "action" : "$N单臂一挥，一招「玉带围腰」，手中$w直击向$n腰肋",
        "force"  : 136,
        "attack" : 13,
        "dodge"  : 1,
        "parry"  : 5,
        "damage" : 12,
        "lvl" : 80,
        "skill_name" : "玉带围腰",
        "damage_type":  "内伤"
]),
([      "action" : "$N高高跃起，一招「大漠孤烟」，手中$w笔直向$n当头罩下",
        "force"  : 148,
        "attack" : 21,
        "dodge"  : 13,
        "parry"  : 15,
        "damage" : 18,
        "lvl" : 100,
        "skill_name" : "大漠孤烟",
        "damage_type":  "内伤"
])
});

int valid_enable(string usage)
{
	return usage == "whip" || usage == "parry";
}

int valid_learn(object me)
{
        object weapon;

        if ( !objectp(weapon = me->query_temp("weapon"))
        || ( string)weapon->query("skill_type") != "whip" )
                return notify_fail("你必须先找一条鞭子才能练鞭法。\n");

        if( (int)me->query("max_neili") < 500 )
                return notify_fail("你的内力不足，没有办法练云龙鞭法。\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < 10)
                return notify_fail("你的基本鞭法火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("yunlong-bian", 1))
                return notify_fail("你的基本鞭法水平有限，无法领会更高深的云龙鞭法。\n");

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
        level   = (int) me->query_skill("yunlong-bian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练云龙鞭法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练云龙鞭法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -38);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yunlong-bian/" + action;
}
