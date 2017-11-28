// yipai-liangsan.c

#include <ansi.h>

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N一掌拍向$n，没有什么章法",
        "force" : 100,
        "attack": -50,
        "dodge" : -50,
        "parry" : -50,
        "damage": -50,
        "lvl"   : 0,
        "damage_type" : "内伤"
]),
([      "action": "$N深深吸了一口气，双掌划了一个圈子，缓缓拍向$n，掌力有如排山倒海一般",
        "force" : 700,
        "attack": 400,
        "dodge" : -20,
        "parry" : 30,
        "damage": 300,
        "lvl"   : 150,
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage == "strike"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练一拍两散必须空手。\n");

        if ((int)me->query_skill("force") < 200)
                return notify_fail("你的内功火候不够，不能强行修习一拍两散。\n");

        if (me->query("int") < 28 || me->query("con") < 28) 
                return notify_fail("你的先天条件不够，无法练习一拍两散。\n");
        
        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力还不够强，无法修习一拍两散。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("yipai-liangsan", 1))
                return notify_fail("你的基本掌法火候水平有限，无法领会更高深的一拍两散。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action); i > 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int level;
        level = (int) me->query_skill("yipai-liangsan", 1);
        if (level < action[1]["lvl"])
                return action[0];

        return action[1];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 300)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你的内力不够练一拍两散。\n");

        me->receive_damage("qi", 100);
        me->add("neili", -100);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        if (damage_bonus < 100) return 0;

        if (me->query("jiali") < 50 || me->query("neili") < 300)
                return 0;

        me->start_busy(2);
        victim->receive_damage("qi", damage_bonus, me);
        if (victim->query("neili") < 200)
                victim->set("neili", 0);
        else
                victim->add("neili", -100);

        return HIR "$n" HIR "接下$N这一掌，一时间只觉得浑身乏力。\n" NOR;
}

