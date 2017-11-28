// xuantian-zhi.c - 玄天指

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N左指挥出，一式「冰冻三尺」，指尖携着阴寒之劲削向$n的掌缘",
        "force" : 100,
        "attack": 10,
        "parry" : 15,
        "dodge" : -5,
        "lvl"   : 0,
        "skill_name" : "冰冻三尺",
        "damage_type" : "刺伤"
]),
([      "action" : "$N全身之力聚于指，顿时指尖笼罩着一层寒霜，一式「千里冰封」指向$n的胸前",
        "force" : 140,
        "attack": 15,
        "parry" : 18,
        "dodge" : -5,
        "lvl"   : 20,
        "skill_name" : "千里冰封",
        "damage_type" : "刺伤"
]),
([      "action" : "$N左掌贴于神道穴，右手一式「万里雪飘」，指尖携着阴寒之劲向$n的$l划过",
        "force" : 170,
        "attack": 20,
        "parry" : 25,
        "dodge" : 5,
        "lvl"   : 40,
        "skill_name" : "万里雪飘",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双目怒视，一式「落日寒冰」，双指携着阴寒之劲拂向$n各处要穴",
        "force" : 210,
        "attack": 28,
        "parry" : 30,
        "dodge" : 5,
        "damage": 10,
        "lvl"   : 60,
        "skill_name" : "落日寒冰",
        "damage_type" : "刺伤"
]),
([      "action" : "$N右手伸出，十指叉开，一式「冰河洞开」，分射出数股阴寒之劲，贯向$n",
        "force" : 250,
        "attack": 30,
        "parry" : 35,
        "dodge" : 15,
        "damage": 10,
        "lvl"   : 80,
        "skill_name" : "冰河洞开",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双指迸出无数道阴寒之极的劲气，一式「漫天雪舞」射向$n的全身",
        "force" : 280,
        "attack": 45,
        "parry" : 40,
        "dodge" : 20,
        "damage": 15,
        "lvl"   : 100,
        "skill_name" : "漫天雪舞",
        "damage_type" : "刺伤"
]),
([      "action": "$N双掌翻飞，一式「九阴寒箭」，指端迸出无数道阴寒劲气，射向$n的全身",
        "force" : 310,
        "attack": 50,
        "parry" : 48,
        "dodge" : 25,
        "damage": 20,
        "lvl"   : 130,
        "skill_name" : "九阴寒箭",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「极地冰原」，并指如刃，一束束锐利无俦的寒气，凌虚向$n的$l砍去",
        "force" : 370,
        "attack": 60,
        "parry" : 55,
        "dodge" : 30,
        "damage": 30,
        "lvl"   : 160,
        "skill_name" : "极地冰原",
        "damage_type" : "刺伤"
]),
([      "action": "$N一式「天寒地冻」，双手食指交叉，指端射出一缕寒气，穿过$n的$l",
        "force" : 400,
        "attack": 68,
        "parry" : 60,
        "dodge" : 35,
        "damage": 40,
        "lvl"   : 190,
        "skill_name" : "天寒地冻",
        "damage_type" : "刺伤"
]),
([      "action": "$N左掌竖立胸前，一式「万古坚冰」，右手食指扣住拇指，轻轻对着$n一弹",
        "force" : 440,
        "attack": 75,
        "parry" : 66,
        "dodge" : 50,
        "damage": 10,
        "lvl"   : 220,
        "skill_name" : "万古坚冰",
        "damage_type" : "刺伤"
])
});

int valid_enable(string usage) { return usage == "finger" || usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练玄天指必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学玄天指。\n");

        if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力太弱，无法练玄天指。\n");

        if ((int)me->query_skill("finger", 1) < 80)
                return notify_fail("你的基本指法火候不够，无法练玄天指。\n");

        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("xuantian-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的玄天指。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("xuantian-zhi",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if (me->query_temp("weapon") ||
            me->query_temp("secondary_weapon"))
                return notify_fail("你必须空手练习！\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练玄天指。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -70);
        return 1;
}

mixed hit_ob(object me, object victim, int damage_bonus, int factor)
{
        int lvl;
        int flvl;

        lvl  = me->query_skill("xuantian-zhi", 1);
        flvl = me->query("jiali");
        if (lvl < 100 || flvl < 20 || ! damage_bonus)
                return;

        if (flvl * 2 + random(lvl) > victim->query_skill("force") &&
            victim->affect_by("xuantian_zhi",
                              ([ "level" : flvl + random(flvl),
                                 "id"    : me->query("id"),
                                 "duration" : lvl / 50 + random(lvl / 20) ])))
        {
                return HIW "$n" HIW "只感觉阴寒之气攻心，全身瘫软，嘴皮乌紫，面庞竟笼罩了一层寒霜。\n" NOR;
        }
}

string perform_action_file(string action)
{
        return __DIR__"xuantian-zhi/" + action;
}
