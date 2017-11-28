// Modify by Rcwiz for hero.cd

inherit SKILL;
#include <ansi.h>

mapping *action = ({
([      "action": "$N手中的$w荡出，就如大江东去，威力势不可挡",
        "force" : 250,
        "attack": 170,
        "dodge" : 30,
        "parry" : 70,
        "damage": 230,
        "lvl"   : 0,
        "damage_type": "割伤"
]),
([      "action": "$N踏上一步，手中$w舞出一道剑光劈向$n的$l",
        "force" : 310,
        "attack": 280,
        "dodge" : 33,
        "parry" : 79,
        "damage": 224,
        "lvl"   : 40,
        "damage_type": "割伤"
]),
([      "action": "$N手中$w一抖，一剑刺出，攻向$n的$l，没有半点花巧",
        "force" : 330,
        "attack": 290,
        "dodge" : 41,
        "parry" : 85,
        "damage": 235,
        "lvl"   : 80,
        "damage_type": "割伤"
]),
([      "action": "$N手中$w微微颤动，忽然刺出，一道剑光射向$n的$l",
        "force" : 360,
        "attack": 295,
        "dodge" : 45,
        "parry" : 92,
        "damage": 239,
        "lvl"   : 120,
        "damage_type": "刺伤"
]),
([      "action": "$N横过$w，蓦然横扫$n，气势如虹，荡气回肠",
        "force" : 340,
        "attack": 297,
        "dodge" : 47,
        "parry" : 99,
        "damage": 248,
        "lvl"   : 160,
        "damage_type": "割伤"
]),
([      "action": "$N手中的$w连削带刺，夹带着一阵旋风掠过$n全身",
        "force" : 380,
        "attack": 300,
        "dodge" : 50,
        "parry" : 100,
        "damage": 300,
        "lvl"   : 200,
        "damage_type": "刺伤"
])
});

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query("int") < 34)
                return notify_fail("你的先天悟性太差，无法领会玄铁剑法。\n");

        if (me->query("str") < 34)
                return notify_fail("你的先天膂力孱弱，无法学习玄铁剑法。\n");

        if (me->query("character") == "心狠手辣")
                return notify_fail("你一心想杀尽敌人，没能理解玄铁剑法的的真正含义。\n");

        if (me->query("character") == "阴险奸诈")
                return notify_fail("你一心想怎么学好剑法去害人，结果没能理解玄铁剑法。\n");

        if ((int)me->query_skill("force") < 380)
                return notify_fail("你的内功火候不到，无法学习玄铁剑法。\n");

        if (me->query_skill("martial-cognize", 1) < 220)
                return notify_fail("你武学修养不足，无法领悟玄铁剑法！\n");

        if (me->query("max_neili") < 5000)
                return notify_fail("你的内力太差，无法学习玄铁剑法。\n");

        if (me->query_skill("force", 1) < me->query_skill("xuantie-jian", 1))
                return notify_fail("你的基本内功水平有限，无法领会更高深的玄铁剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("xuantie-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的玄铁剑法。\n");

        return 1;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("xuantie-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;
        object env;
        
        env = environment(me);
        if (! env->query("can_practice_xiantie-jian"))
                return notify_fail("你拿起剑挥舞了半天，只觉得此处不适合练习玄铁剑法。\n");
       
        if (!objectp(weapon = me->query_temp("weapon")) || 
            (string)weapon->query("skill_type") != "sword" ||
            weapon->query("id") != "xuantie jian")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练玄铁剑法。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练玄铁剑法。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -70);

        message_vision(HIW "\n$N" HIW"屏气凝息，挥舞着手中的"+ weapon->name() + HIW "，奋力与洪流相抗。\n\n", me);

        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int lvl;
        object weapon = me->query_temp("weapon");

        lvl = me->query_skill("xuantie-jian", 1);

        if (damage_bonus < 120
           || lvl < 160
           || random(2)
           || me->query("neili") < 500
           || me->query_skill_mapped("sword") != "xuantie-jian" )
      		return damage_bonus / 4;

        if (lvl / 2 + random(lvl) > victim->query_skill("parry", 1))
        {
                me->add("neili", -120);
                victim->receive_wound("qi", damage_bonus * 4 / 5, me);
      
                return HIW "$N" HIW "手中" + weapon->name() + HIW "犹如神助，从天而下，威不"
                       "可挡地劈向$n" HIW "，气势恢弘之极。\n" NOR;
         }
}

int difficult_level()
{
        return 500;
}

string perform_action_file(string action)
{
        return __DIR__"xuantie-jian/" + action;
}
