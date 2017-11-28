#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N纵步上前，手中$w斜斜刺出，也不知其刺向何方，$n完全无法招架",
        "force" : 72,
        "attack": 41,
        "parry" : 40,
        "dodge" : 31,
        "damage": 14,
        "lvl"   : 0,
        "damage_type" : "刺伤"
]),
([      "action": "$N退后三尺，手中$w猛的反身递出，制敌机先，疾刺$n的$l",
        "force" : 94,
        "attack": 52,
        "parry" : 41,
        "dodge" : 42,
        "damage": 25,
        "lvl"   : 20,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中的$w向$n直直刺去, 这看似很平凡的一招竟然含着巨大的杀着",
        "force" : 115,
        "attack": 58,
        "parry" : 45,
        "dodge" : 43,
        "damage": 36,
        "lvl"   : 40,
        "damage_type" : "刺伤"
]),
([      "action": "$N一声大喝，手中$w随意挥洒，幻出许许剑芒，逼得$n连连后退",
        "force" : 127,
        "attack": 61,
        "parry" : 48,
        "dodge" : 48,
        "damage": 45,
        "lvl"   : 60,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w光芒闪烁，在许许剑芒中递出杀着，完全出自$n意料之外",
        "force" : 139,
        "attack": 68,
        "parry" : 51,
        "dodge" : 50,
        "damage": 52,
        "lvl"   : 80,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w斜斜刺出，虚虚实实，笼罩$n四周，完全封所了$n的退路",
        "force" : 152,
        "attack": 71,
        "parry" : 55,
        "dodge" : 55,
        "damage": 58,
        "lvl"   : 100,
        "damage_type" : "刺伤"
]),
([      "action": "$N足尖在地上一点而起，半空中点出千万寒星，分刺$n各处要害",
        "force" : 173,
        "attack": 78,
        "parry" : 60,
        "dodge" : 62,
        "damage": 65,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
([      "action": "$N飞身跃起，手中$w舞出无数个闪烁的剑花，满天闪落而下，制$n于其中",
        "force" : 185,
        "attack": 81,
        "parry" : 64,
        "dodge" : 65,
        "damage": 78,
        "lvl"   : 140,
        "damage_type" : "刺伤"
]),
([      "action": "$N身行晃动不定，手中$w挥洒而出，划出万点迅捷无比的寒星洒向$n",
        "force" : 210,
        "attack": 94,
        "parry" : 68,
        "dodge" : 75,
        "damage": 91,
        "lvl"   : 160,
        "damage_type" : "刺伤"
]),
([      "action": "$N随意挥洒手中$w，顿时幻出万般剑芒, 数股剑气从剑芒中递出，直知贯向$n",
        "force" : 223,
        "attack": 104,
        "parry" : 70,
        "dodge" : 78,
        "damage": 102,
        "lvl"   : 180,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中$w遥指苍天，剑芒吞吐不定，陡然间剑芒暴涨，对准$n的$l直贯而去",
        "force" : 238,
        "attack": 115,
        "parry" : 72,
        "dodge" : 85,
        "damage": 118,
        "lvl"   : 200,
        "damage_type" : "刺伤"
]),
([      "action": "$N一声巨喝，体内真气迸发，只见$w从天而降，一股强大的剑气席卷$n全身",
        "force" : 280,
        "attack": 124,
        "parry" : 72,
        "dodge" : 85,
        "damage": 140,
        "lvl"   : 220,
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage)
{
        return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为不够，无法学习原始剑法。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功火候不够，无法学习原始剑法。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习原始剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("yuanshi-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的原始剑法。\n");

        if ((int)me->query_skill("force", 1) < (int)me->query_skill("yuanshi-jian", 1))
                return notify_fail("你的基本内功水平有限，无法领会更高深的原始剑法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("yuanshi-jian", 1);
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
                return notify_fail("你的体力不够练原始剑法。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的内力不够练原始剑法。\n");

        me->receive_damage("qi", 50);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yuanshi-jian/" + action;
}
