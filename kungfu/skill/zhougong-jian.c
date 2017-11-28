// zhougong-jian.c 周公剑
// By Vin

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N纵步上前，手中$w斜斜刺出，不知其来路如何，也不知其刺向何方，$n完全无法招架",
        "force" : 120,
        "attack": 41,
        "parry" : 40,
        "dodge" : 31,
        "damage": 10,
        "lvl"   : 0,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w猛的反身递出，制敌机先，疾刺$n的$l",
        "force" : 140,
        "attack": 52,
        "parry" : 41,
        "dodge" : 42,
        "damage": 12,
        "lvl"   : 10,
        "damage_type" : "刺伤"
]),
([      "action": "$N面不露色，手中的$w向$n直直刺去, 这看似很平凡的一招竟然含着巨大的杀着",
        "force" : 150,
        "attack": 58,
        "parry" : 45,
        "dodge" : 43,
        "damage": 20,
        "lvl"   : 20,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w随意挥洒，幻出许许剑芒, 逼得$n连连后退",
        "force" : 170,
        "attack": 61,
        "parry" : 48,
        "dodge" : 48,
        "damage": 25,
        "lvl"   : 40,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w光芒闪烁，在许许剑芒中递出杀着，完全出自$n意料之外",
        "force" : 190,
        "attack": 68,
        "parry" : 51,
        "dodge" : 50,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w斜斜刺出，虚虚实实，笼罩$n四周，完全封所了$n的退路",
        "force" : 200,
        "attack": 71,
        "parry" : 55,
        "dodge" : 55,
        "damage": 35,
        "lvl"   : 80,
        "damage_type" : "刺伤"
]),
([      "action": "$N足尖在地上一点而起，半空中点出千万寒星，分刺$n各处要害",
        "force" : 230,
        "attack": 78,
        "parry" : 60,
        "dodge" : 62,
        "damage": 40,
        "lvl"   : 100,
        "damage_type" : "刺伤"
]),
([      "action": "$N飞身跃起，手中$w舞出无数个闪烁的剑花，满天闪落而下，制$n于其中",
        "force" : 250,
        "attack": 81,
        "parry" : 64,
        "dodge" : 65,
        "damage": 70,
        "lvl"   : 110,
        "damage_type" : "刺伤"
]),
([      "action": "$N身行晃动不定，手中$w挥洒而出，划出万点迅捷无比的寒星洒向$n",
        "force" : 280,
        "attack": 84,
        "parry" : 68,
        "dodge" : 75,
        "damage": 69,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
([      "action": "$N随意挥洒手中$w，顿时幻出万般剑芒, 数股剑气从剑芒中递出，直知贯向$n",
        "force" : 300,
        "attack": 88,
        "parry" : 70,
        "dodge" : 78,
        "damage": 80,
        "lvl"   : 130,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w遥指苍天，剑芒吞吐不定，一式「玉带围腰」，对准$n的$l直贯而去",
        "force" : 330,
        "attack": 91,
        "parry" : 72,
        "dodge" : 85,
        "damage": 88,
        "lvl"   : 140,
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「天如穹庐」，只见$w突然从天而降，一股强大的剑气席卷$n全身",
        "force" : 350,
        "attack": 94,
        "parry" : 72,
        "dodge" : 85,
        "damage": 100,
        "lvl"   : 150,
        "damage_type" : "割伤"
]),
([      "action": HIW "$N" HIW "一声爆喝，身法陡然加快，手中剑芒吞吐不定，身外化身，剑外"
                  "化剑，手中$w" HIW "如飞龙一般递出！\n" NOR "$n眼见这突如其来的一剑，面"
                  "如死灰，完全不知道该如何抵挡，想抽身后退，身后一股强大的剑气\n又云涌而至",
        "force" : 470,
        "attack": 138,
        "dodge" : -167,
        "parry" : -135,
        "damage": 280,
        "lvl"   : 250,
        "damage_type": "刺伤"
]),
});

int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力不够，无法学习周公剑。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功火候不够，无法学习周公剑。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习周公剑。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("zhougong-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的周公剑。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("zhougong-jian", 1))
                return notify_fail("你的基本内功水平有限，无法领会更高深的周公剑。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("zhougong-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;
        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练周公剑。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练周公剑。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zhougong-jian/" + action;
}
