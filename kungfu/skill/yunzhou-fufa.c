#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N右手微抬，一招「长空万里」，手中$w笔直刺向$n",
        "force" : 45,
        "dodge" : 35,
        "parry" : 12,
        "damage": 15,
        "lvl"   : 0,
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，手中$w如矫龙般腾空一卷，猛地向$n劈头打下",
        "force" : 80,
        "dodge" : 28,
        "parry" : 15,
        "damage": 30,
        "lvl"   : 30,
        "damage_type": "抽伤"
]),
([      "action": "$N一声长啸，手中$w挥舞得呼呼作响，如长龙般地袭向$n全身",
        "force" : 116,
        "dodge" : 43,
        "parry" : 29,
        "damage": 51,
        "lvl"   : 50,
        "damage_type": "抽伤"
]),
([      "action":"$N身法忽变，忽左忽右，手中$w龙吟不定只向$n$l",
        "force" : 180,
        "dodge" : 55,
        "parry" : 33,
        "damage": 60,
        "lvl"   : 80,
        "damage_type": "抽伤"
]),
([      "action":"$N飞身一跃而起，$w宛如游龙，破空而下，攻向$n",
        "force" : 210,
        "dodge" : 65,
        "parry" : 36,
        "damage": 80,
        "lvl"   : 110,
        "damage_type": "抽伤"
]),
});

int valid_enable(string usage) 
{ 
        return usage == "whip" || usage == "parry"; 
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你必须先找一条鞭子才能练云帚拂法。\n");

        if ((int)me->query("max_neili") < 400)
                return notify_fail("你的内力不足，没有办法练云帚拂法，多练些内力再来吧。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候太浅，没有办法练云帚拂法。\n");

        if ((int)me->query_skill("whip", 1) < 20)
                return notify_fail("你的基本鞭法火候太浅，没有办法练云帚拂法。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("yunzhou-fufa", 1))
                return notify_fail("你的基本鞭法水平还不够，无法领会更高深的云帚拂法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("yunzhou-fufa", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够练云帚拂法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练云帚拂法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -40);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yunzhou-fufa/" + action;
}
