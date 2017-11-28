#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N端坐不动，一招「破元势」，手中$w抖得笔直，对准$n的胸腹要害连刺数鞭",
        "force" : 180,
        "attack": 20,
        "dodge" : 2,
        "parry" : 1,
        "damage": 49,
        "lvl"   : 0,
        "skill_name" : "破元势",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「吞金势」，手中$w如矫龙般腾空一卷，猛地向$n劈头打下",
        "force" : 200,
        "attack": 28,
        "dodge" : 3,
        "parry" : 5,
        "damage": 61,
        "lvl"   : 30,
        "skill_name" : "吞金势",
        "damage_type": "抽伤"
]),
([      "action": "$N力贯鞭梢，一招「荡妖势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 210,
        "attack": 35,
        "dodge" : 2,
        "parry" : 5,
        "damage": 73,
        "lvl"   : 60,
        "skill_name" : "荡妖势",
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「伏魔势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 220,
        "attack": 41,
        "dodge" : 5,
        "parry" : 6,
        "damage": 84,
        "lvl"   : 90,
        "skill_name" : "伏魔势",
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「寰穹势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 230,
        "attack": 47,
        "dodge" : 6,
        "parry" : 15,
        "damage": 95,
        "lvl"   : 120,
        "skill_name" : "寰穹势",
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「戮神势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 240,
        "attack": 55,
        "dodge" : 12,
        "parry" : 20,
        "damage": 110,
        "lvl"   : 150,
        "skill_name":  "戮神势",
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「雷轰势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 260,
        "attack": 61,
        "dodge" : 17,
        "parry" : 25,
        "damage": 130,
        "lvl"   : 180,
        "skill_name" : "雷轰势",
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「盘龙势」，手中$w舞出满天鞭影，排山倒海般扫向$n全身",
        "force" : 290,
        "attack": 68,
        "dodge" : 20,
        "parry" : 35,
        "damage": 149,
        "lvl"   : 220,
        "skill_name" : "盘龙势",
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
                return notify_fail("你必须先找一条鞭子才能练鞭法。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不足，无法修炼霹雳盘龙索。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅，无法修炼霹雳盘龙索。\n");

        if ((int)me->query_skill("whip", 1) < 80)
                return notify_fail("你的基本鞭法火候太浅，无法修炼霹雳盘龙索。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("panlong-suo", 1))
                return notify_fail("你的基本鞭法水平还不够，无法领会更高深的霹雳盘龙索。\n");

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
        level = (int) me->query_skill("panlong-suo",1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练霹雳盘龙索。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够练霹雳盘龙索。\n");

        me->receive_damage("qi", 75);
        me->add("neili", -85);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"panlong-suo/" + action;
}
