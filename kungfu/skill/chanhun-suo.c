#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N单手一扬，一招「虐目」，手中$w抖得笔直，直点$n的双眼",
        "force" : 110,
        "dodge" : 12,
        "parry" : 10,
        "damage": 35,
        "lvl"   : 0,
        "skill_name" : "虐目",
        "damage_type": "刺伤"
]),
([      "action": "$N力贯鞭梢，一招「伤肝」，手中$w舞出满天鞭影，横扫$n腰间",
        "force" : 140,
        "dodge" : 17,
        "parry" : 15,
        "damage": 50,
        "lvl"   : 20,
        "skill_name" : "伤肝",
        "damage_type": "劈伤"
]),
([      "action": "$N运气于腕，一招「损心」，手中$w向一根铜棍般直击$n胸部",
        "force" : 180,
        "dodge" : 21,
        "parry" : 19,
        "damage": 43,
        "lvl"   : 40,
        "skill_name" : "损心",
        "damage_type": "内伤"
]),
([      "action": "$N单臂一挥，一招「催胆」，手中$w直击向$n腰肋",
        "force" : 215,
        "dodge" : 32,
        "parry" : 27,
        "damage": 58,
        "lvl"   : 60,
        "skill_name" : "催胆",
        "damage_type": "劈伤"
]),
([      "action": "$N高高跃起，一招「摄魄」，手中$w笔直向$n当头罩下",
        "force" : 255,
        "dodge" : 42,
        "parry" : 37,
        "damage": 75,
        "lvl"   : 80,
        "skill_name" : "摄魄",
        "damage_type": "劈伤"
]),
([      "action": "$N身形一转，一招「收魂」，手中$w如矫龙般腾空一卷，猛地向$n劈头打下",
        "force" : 330,
        "dodge" : 87,
        "parry" : 69,
        "damage": 81,
        "lvl"   : 100,
        "skill_name" : "收魂",
        "damage_type": "劈伤"
]),
});

int valid_enable(string usage) { return (usage == "whip") || (usage == "parry"); }

int valid_learn(object me)
{
        object weapon;

        if ( !objectp(weapon = me->query_temp("weapon"))
        || ( string)weapon->query("skill_type") != "whip" )
                return notify_fail("你必须先找一条鞭子才能练习缠魂索。\n");

        if( (int)me->query("max_neili") < 400 )
                return notify_fail("你的内力不足，没有办法练习缠魂索。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < 60)
                return notify_fail("你的基本鞭法火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("chanhun-suo", 1))
                return notify_fail("你的基本鞭法水平有限，无法领会更高深的缠魂索。\n");

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
        level   = (int) me->query_skill("chanhun-suo",1);
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
                return notify_fail("你的体力不够练缠魂索。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练缠魂索。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -50);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chanhun-suo/" + action;
}
