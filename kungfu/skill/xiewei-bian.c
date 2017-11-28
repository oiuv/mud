#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N单手一扬，一招「天蝎爪」，手中$w抖得笔直，直点$n的双眼",
        "force" : 100,
        "dodge" : 12,
        "parry" : 10,
        "damage": 5,
        "lvl"   : 0,
        "damage_type": "刺伤"
]),
([      "action": "$N力贯鞭梢，一招「蝎尾钩」，手中$w舞出满天鞭影，横扫$n腰间",
        "force" : 130,
        "dodge" : 17,
        "parry" : 15,
        "damage": 10,
        "lvl"   : 20,
        "damage_type": "劈伤"
]),
([      "action": "$N运气于腕，一招「毒蝎蚀月」，手中$w向一根铜棍般直击$n胸部",
        "force" : 150,
        "dodge" : 21,
        "parry" : 19,
        "damage": 13,
        "lvl"   : 40,
        "damage_type": "内伤"
]),
([      "action": "$N单臂一挥，一招「蛇游蝎行」，手中$w直击向$n腰肋",
        "force" : 175,
        "dodge" : 32,
        "parry" : 27,
        "damage": 18,
        "lvl"   : 60,
        "damage_type": "劈伤"
]),
([      "action": "$N高高跃起，一招「天蝎藏针」，手中$w笔直向$n当头刺下",
        "force" : 225,
        "dodge" : 42,
        "parry" : 37,
        "damage": 35,
        "lvl"   : 80,
        "damage_type": "刺伤"
]),
});

int valid_enable(string usage) { return (usage == "whip") || (usage == "parry"); }

int valid_learn(object me)
{
        object weapon;

        if ( !objectp(weapon = me->query_temp("weapon"))
        || ( string)weapon->query("skill_type") != "whip" )
                return notify_fail("你必须先找一条鞭子才能练习蝎尾鞭。\n");

        if( (int)me->query("max_neili") < 400 )
                return notify_fail("你的内力不足，没有办法练习蝎尾鞭。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < 20)
                return notify_fail("你的基本鞭法火候太浅。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("xiewei-bian", 1))
                return notify_fail("你的基本鞭法水平有限，无法领会更高深的蝎尾鞭。\n");

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
        level   = (int) me->query_skill("xiewei-bian", 1);
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
                return notify_fail("你的体力不够练蝎尾鞭。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练蝎尾鞭。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -50);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xiewei-bian/" + action;
}
