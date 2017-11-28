#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N单手一扬，一招「无孔不入」，手中$w抖得笔直，对准$n"
                   "当头罩下",
        "force"  : 90,
        "attack" : 13,
        "dodge"  : 10,
        "parry"  : 10,
        "damage" : 20,
        "lvl" : 0,
        "skill_name" : "无孔不入",
        "damage_type":  "劈伤"
]),
([      "action" : "$N身形一转，一招「无所不至」，手中$w如矫龙般腾空一卷"
                   "，猛地击向$n",
        "force"  : 130,
        "attack" : 24,
        "dodge"  : 28,
        "parry"  : 15,
        "damage" : 36,
        "lvl" : 30,
        "skill_name" : "无所不至",
        "damage_type":  "劈伤"
]),
([      "action" : "$N唰的一抖长鞭，一招「无所不为」，手中$w抖得笔直，刺向"
                   "$n$l",
        "force"  : 170,
        "attack" : 35,
        "dodge"  : 36,
        "parry"  : 21,
        "damage" : 55,
        "lvl" : 60,
        "skill_name" : "无所不为",
        "damage_type":  "刺伤"
]),
([      "action" : "$N力贯鞭梢，一招「风起云涌」，手中$w舞出满天鞭影，排山倒"
                   "海般扫向$n全身",
        "force"  : 200,
        "attack" : 40,
        "dodge"  : 50,
        "parry"  : 30,
        "damage" : 64,
        "lvl" : 90,
        "skill_name" : "风起云涌",
        "damage_type":  "刺伤"
]),
([      "action" : "$N运气于腕，一招「风卷残云」，手中$w向一根铜棍般直击向$n",
        "force"  : 220,
        "attack" : 50,
        "dodge"  : 66,
        "parry"  : 38,
        "damage" : 80,
        "lvl" : 120,
        "skill_name" : "风卷残云",
        "damage_type":  "内伤"
]),
([      "action" : "$N单臂一挥，一招「欲擒故纵」，手中$w直击向$n腰肋",
        "force"  : 260,
        "attack" : 56,
        "dodge"  : 80,
        "parry"  : 32,
        "damage" : 98,
        "lvl" : 150,
        "skill_name" : "欲擒故纵",
        "damage_type":  "内伤"
]),
([      "action" : "$N高高跃起，一招「无影无踪」，手中$w笔直向$n当头罩下",
        "force"  : 300,
        "attack" : 70,
        "dodge"  : 110,
        "parry"  : 40,
        "damage" : 130,
        "lvl" : 200,
        "skill_name" : "无影无踪",
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

        if (me->query("character") != "心狠手辣" && me->query("character") != "国士无双") 
                return notify_fail("练三无三不手必须要心狠手辣，我看你这点做得还不够。\n"); 

        if ( !objectp(weapon = me->query_temp("weapon"))
        || ( string)weapon->query("skill_type") != "whip" )
                return notify_fail("你必须先找一条鞭子才能练三无三不手。\n");

        if( (int)me->query("max_neili") < 800 )
                return notify_fail("你的内力不足，没有办法练三无三不手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅，没有办法练三无三不手。\n");

        if ((int)me->query_skill("whip", 1) < 100)
                return notify_fail("你的基本鞭法火候太浅，没有办法练三无三不手。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("sanwu-shou", 1))
                return notify_fail("你的基本鞭法水平有限，无法领会更高深的没有办法练三无三不手。\n");

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
        level   = (int) me->query_skill("sanwu-shou",1);
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

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练三无三不手。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练三无三不手。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -60);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sanwu-shou/" + action;
}
